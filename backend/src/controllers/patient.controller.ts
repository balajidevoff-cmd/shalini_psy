import { Response } from 'express';
import { prisma } from '../database/prisma';
import { sendSuccess, sendError } from '../utils/api-response';
import { createPatientSchema, updatePatientSchema } from '../validators/validators';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AuditService } from '../utils/audit.service';

export class PatientController {
  public static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status, psychologistId, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (psychologistId) {
        where.assignedPsychologistId = psychologistId;
      }

      if (search) {
        where.OR = [
          { patientCode: { contains: String(search) } },
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
        ];
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          include: {
            assignedPsychologist: {
              select: { id: true, firstName: true, lastName: true, title: true, email: true },
            },
            sessions: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                score: { select: { severity: true, rawScore: true, hasRiskFlag: true } },
                assessment: { select: { name: true, shortName: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.patient.count({ where }),
      ]);

      return sendSuccess(res, patients, 'Patients retrieved successfully', 200, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch patients', 'SERVER_ERROR', 500);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          assignedPsychologist: {
            select: { id: true, firstName: true, lastName: true, title: true, licenseNumber: true, email: true },
          },
          contact: true,
          history: true,
          consentRecords: { orderBy: { grantedAt: 'desc' } },
          sessions: {
            include: {
              assessment: { select: { name: true, shortName: true, domain: true } },
              score: true,
              aiAnalysis: true,
              clinicalReview: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          followUpPlans: {
            include: { assignedClinician: { select: { firstName: true, lastName: true } } },
            orderBy: { scheduledDate: 'asc' },
          },
          reports: { orderBy: { generatedAt: 'desc' } },
        },
      });

      if (!patient) {
        return sendError(res, 'Patient not found', 'NOT_FOUND', 404);
      }

      return sendSuccess(res, patient);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch patient', 'SERVER_ERROR', 500);
    }
  }

  public static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = createPatientSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const data = parsed.data;

      // Auto-assign Shalini Devi V if no psychologist explicitly provided
      let psychologistId = data.assignedPsychologistId;
      if (!psychologistId) {
        const defaultPsychologist = await prisma.user.findFirst({
          where: { role: 'PSYCHOLOGIST', firstName: { contains: 'Shalini' } },
        });
        if (defaultPsychologist) {
          psychologistId = defaultPsychologist.id;
        }
      }

      // Generate unique patient code
      const count = await prisma.patient.count();
      const patientCode = `PSY-${10001 + count}`;

      const dob = new Date(data.dateOfBirth);
      const ageDiff = Date.now() - dob.getTime();
      const calculatedAge = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);

      const patient = await prisma.patient.create({
        data: {
          patientCode,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: dob,
          age: calculatedAge || 25,
          gender: data.gender,
          education: data.education,
          occupation: data.occupation,
          maritalStatus: data.maritalStatus,
          socioeconomicStatus: data.socioeconomicStatus,
          assignedPsychologistId: psychologistId,
          contact: {
            create: {
              phone: data.phone,
              email: data.email || null,
              address: data.address,
              city: data.city,
              state: data.state,
              emergencyName: data.emergencyName,
              emergencyRelation: data.emergencyRelation,
              emergencyPhone: data.emergencyPhone,
            },
          },
          history: {
            create: {
              presentingComplaints: data.presentingComplaints,
              symptomDuration: data.symptomDuration,
              medicalHistory: data.medicalHistory,
              familyHistory: data.familyHistory,
              traumaHistory: data.traumaHistory,
              majorLifeEvents: data.majorLifeEvents,
              suicidalThoughts: data.suicidalThoughts || false,
              selfHarmHistory: data.selfHarmHistory || false,
              substanceUse: data.substanceUse,
              sleepPattern: data.sleepPattern,
            },
          },
          consentRecords: {
            create: {
              acceptedBy: `${data.firstName} ${data.lastName}`,
              consentText: 'Consent granted for psychological screening and clinical decision support.',
              ipAddress: req.ip,
            },
          },
        },
        include: {
          contact: true,
          history: true,
          assignedPsychologist: true,
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'PATIENT_CREATED',
        entityType: 'Patient',
        entityId: patient.id,
        ipAddress: req.ip,
        metadata: { patientCode: patient.patientCode },
      });

      return sendSuccess(res, patient, 'Patient registered successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create patient', 'SERVER_ERROR', 500);
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updatePatientSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, parsed.error.errors);
      }

      const data = parsed.data;

      const updated = await prisma.patient.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
          education: data.education,
          occupation: data.occupation,
          maritalStatus: data.maritalStatus,
          socioeconomicStatus: data.socioeconomicStatus,
          assignedPsychologistId: data.assignedPsychologistId,
          contact: {
            upsert: {
              create: {
                phone: data.phone,
                email: data.email || null,
                address: data.address,
                city: data.city,
                state: data.state,
                emergencyName: data.emergencyName,
                emergencyRelation: data.emergencyRelation,
                emergencyPhone: data.emergencyPhone,
              },
              update: {
                phone: data.phone,
                email: data.email || null,
                address: data.address,
                city: data.city,
                state: data.state,
                emergencyName: data.emergencyName,
                emergencyRelation: data.emergencyRelation,
                emergencyPhone: data.emergencyPhone,
              },
            },
          },
          history: {
            upsert: {
              create: {
                presentingComplaints: data.presentingComplaints,
                symptomDuration: data.symptomDuration,
                medicalHistory: data.medicalHistory,
                familyHistory: data.familyHistory,
                traumaHistory: data.traumaHistory,
                majorLifeEvents: data.majorLifeEvents,
                suicidalThoughts: data.suicidalThoughts,
                selfHarmHistory: data.selfHarmHistory,
                substanceUse: data.substanceUse,
                sleepPattern: data.sleepPattern,
              },
              update: {
                presentingComplaints: data.presentingComplaints,
                symptomDuration: data.symptomDuration,
                medicalHistory: data.medicalHistory,
                familyHistory: data.familyHistory,
                traumaHistory: data.traumaHistory,
                majorLifeEvents: data.majorLifeEvents,
                suicidalThoughts: data.suicidalThoughts,
                selfHarmHistory: data.selfHarmHistory,
                substanceUse: data.substanceUse,
                sleepPattern: data.sleepPattern,
              },
            },
          },
        },
        include: {
          contact: true,
          history: true,
          assignedPsychologist: true,
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        userEmail: req.user?.email,
        action: 'PATIENT_UPDATED',
        entityType: 'Patient',
        entityId: id,
        ipAddress: req.ip,
      });

      return sendSuccess(res, updated, 'Patient updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update patient', 'SERVER_ERROR', 500);
    }
  }
}
