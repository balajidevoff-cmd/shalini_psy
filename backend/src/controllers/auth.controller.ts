import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { hashPassword, comparePassword } from '../auth/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../auth/jwt';
import { sendSuccess, sendError } from '../utils/api-response';
import { loginSchema, registerSchema } from '../validators/validators';
import { AuditService } from '../utils/audit.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const { email, password, firstName, lastName, role, title, licenseNumber } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return sendError(res, 'User already exists with this email', 'EMAIL_EXISTS', 400);
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role,
          title,
          licenseNumber,
        },
      });

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      await AuditService.log({
        userId: user.id,
        userEmail: user.email,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
      });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            title: user.title,
          },
          accessToken,
          refreshToken,
        },
        'Registration successful',
        201
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Registration failed', 'SERVER_ERROR', 500);
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid credentials format', 'VALIDATION_ERROR', 400);
      }

      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.status !== 'ACTIVE') {
        return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      await AuditService.log({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress: req.ip,
      });

      return sendSuccess(res, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          title: user.title,
          licenseNumber: user.licenseNumber,
        },
        accessToken,
        refreshToken,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', 'SERVER_ERROR', 500);
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 'UNAUTHORIZED', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          title: true,
          licenseNumber: true,
          status: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 'NOT_FOUND', 404);
      }

      return sendSuccess(res, { user });
    } catch (err: any) {
      return sendError(res, err.message, 'SERVER_ERROR', 500);
    }
  }

  public static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, 'Refresh token required', 'TOKEN_REQUIRED', 400);
      }

      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user || user.status !== 'ACTIVE') {
        return sendError(res, 'Invalid refresh token', 'UNAUTHORIZED', 401);
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const newAccessToken = generateAccessToken(tokenPayload);
      return sendSuccess(res, { accessToken: newAccessToken });
    } catch (err) {
      return sendError(res, 'Invalid or expired refresh token', 'UNAUTHORIZED', 401);
    }
  }
}
