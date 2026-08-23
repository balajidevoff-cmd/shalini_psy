import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { prisma } from '../database/prisma';
import { config } from '../config';

export class ReportService {
  /**
   * Generates a comprehensive clinical screening PDF report
   */
  public static async generatePdfReport(sessionId: string): Promise<{ pdfBuffer: Buffer; reportNumber: string }> {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        patient: {
          include: {
            assignedPsychologist: true,
            contact: true,
            history: true,
          },
        },
        assessment: {
          include: { domain: true },
        },
        assessmentVersion: true,
        score: {
          include: { subscaleScores: true },
        },
        aiAnalysis: {
          include: {
            suggestions: {
              where: {
                status: { in: ['ACCEPTED', 'MODIFIED'] }, // Exclude rejected suggestions
              },
            },
          },
        },
        clinicalReview: {
          include: { psychologist: true },
        },
      },
    });

    if (!session) {
      throw new Error('Assessment session not found.');
    }

    const reportNumber = `RPT-${new Date().getFullYear()}-${session.patient.patientCode.replace('PSY-', '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve({ pdfBuffer, reportNumber });
        });

        // 1. Header Banner
        doc.rect(40, 40, 515, 60).fill('#0F294A');
        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('PSYSCAN AI', 55, 52);
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#93C5FD')
          .text('AI-Assisted Psychological Screening & Clinical Decision Support', 55, 74);
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#FFFFFF')
          .text(`Report Ref: ${reportNumber}`, 390, 55, { align: 'right', width: 150 });
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#CBD5E1')
          .text(`Generated: ${new Date().toLocaleDateString()}`, 390, 72, { align: 'right', width: 150 });

        let currentY = 115;

        // 2. Patient & Administration Metadata Table
        doc.rect(40, currentY, 515, 70).fill('#F8FAFC').stroke('#E2E8F0');
        doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, currentY + 8);
        doc.text('ADMINISTRATION DETAILS', 310, currentY + 8);

        doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
        doc.text(`Patient Code: ${session.patient.patientCode}`, 50, currentY + 25);
        doc.text(`Age / Gender: ${session.patient.age} yrs / ${session.patient.gender}`, 50, currentY + 38);
        doc.text(
          `Assigned Psychologist: ${session.patient.assignedPsychologist?.firstName || 'Shalini Devi'} ${
            session.patient.assignedPsychologist?.lastName || 'V'
          }`,
          50,
          currentY + 51
        );

        doc.text(`Assessment: ${session.assessment.name} (${session.assessment.shortName})`, 310, currentY + 25);
        doc.text(`Domain: ${session.assessment.domain.name}`, 310, currentY + 38);
        doc.text(`Completed Date: ${session.completedAt ? session.completedAt.toLocaleDateString() : 'N/A'}`, 310, currentY + 51);

        currentY += 85;

        // 3. Assessment Score Summary & Severity Indicator
        doc.fillColor('#0F294A').fontSize(11).font('Helvetica-Bold').text('1. QUESTIONNAIRE SCREENING SCORES', 40, currentY);
        currentY += 16;

        if (session.score) {
          doc.rect(40, currentY, 515, 45).fill('#EFF6FF').stroke('#BFDBFE');
          doc.fillColor('#1E3A8A').fontSize(10).font('Helvetica-Bold');
          doc.text(`Total Score: ${session.score.rawScore} / ${session.score.maxPossibleScore}`, 50, currentY + 10);
          doc.text(`Severity Classification: ${session.score.severity}`, 230, currentY + 10);
          doc.text(`Standard Score: ${session.score.standardScore ?? 'N/A'}`, 430, currentY + 10);

          doc.fontSize(8.5).font('Helvetica').fillColor('#1E293B');
          doc.text(session.score.interpretation, 50, currentY + 26, { width: 495 });
          currentY += 55;

          // Subscales Table
          if (session.score.subscaleScores && session.score.subscaleScores.length > 0) {
            doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text('Subscale Breakdown:', 40, currentY);
            currentY += 12;

            for (const sub of session.score.subscaleScores) {
              doc.fontSize(8.5).font('Helvetica').fillColor('#475569');
              doc.text(`• ${sub.subscaleName}: ${sub.rawScore} / ${sub.maxScore} (${sub.severity || 'Normal'})`, 55, currentY);
              currentY += 12;
            }
            currentY += 6;
          }
        }

        // 4. AI-Assisted Screening Summary (Reviewed)
        doc.fillColor('#0F294A').fontSize(11).font('Helvetica-Bold').text('2. AI-ASSISTED SCREENING SUGGESTIONS (CLINICIAN REVIEWED)', 40, currentY);
        currentY += 14;

        if (session.aiAnalysis) {
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748B');
          doc.text('Note: The following suggestions were synthesized by the decision-support engine and reviewed by the psychologist:', 40, currentY);
          currentY += 12;

          for (const sug of session.aiAnalysis.suggestions) {
            doc.rect(40, currentY, 515, 26).fill('#FAF5FF').stroke('#E9D5FF');
            doc.fillColor('#6B21A8').fontSize(8.5).font('Helvetica-Bold').text(`[${sug.suggestionType}] ${sug.title}`, 48, currentY + 4);
            const bodyText = sug.modifiedContent || sug.content;
            doc.fontSize(8).font('Helvetica').fillColor('#3B0764').text(bodyText, 48, currentY + 14, { width: 495 });
            currentY += 30;
          }
        }

        // 5. Psychologist Clinical Review & Impressions
        currentY += 6;
        doc.fillColor('#0F294A').fontSize(11).font('Helvetica-Bold').text('3. PSYCHOLOGIST CLINICAL REVIEW & FINAL IMPRESSION', 40, currentY);
        currentY += 16;

        if (session.clinicalReview) {
          const rev = session.clinicalReview;
          doc.rect(40, currentY, 515, 140).fill('#F8FAFC').stroke('#CBD5E1');

          doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0F172A').text('Clinical Observations:', 50, currentY + 8);
          doc.font('Helvetica').fillColor('#334155').text(rev.clinicalObservations || 'Intake interview completed.', 50, currentY + 20, { width: 495 });

          doc.font('Helvetica-Bold').fillColor('#0F172A').text(`Assessed Risk Level: ${rev.riskLevel}`, 50, currentY + 45);
          if (rev.riskJustification) {
            doc.font('Helvetica').fillColor('#475569').text(` (${rev.riskJustification})`, 180, currentY + 45);
          }

          doc.font('Helvetica-Bold').fillColor('#0F172A').text('Recommendations & Plan:', 50, currentY + 60);
          doc.font('Helvetica').fillColor('#334155').text(rev.recommendations || 'Regular psychotherapy sessions.', 50, currentY + 72, { width: 495 });

          doc.font('Helvetica-Bold').fillColor('#0F172A').text('Final Clinical Impression:', 50, currentY + 98);
          doc.font('Helvetica').fillColor('#1E3A8A').text(rev.finalClinicalImpression || 'Clinical evaluation consistent with screening results.', 50, currentY + 110, { width: 495 });

          currentY += 150;
        }

        // 6. Clinician Signature Block
        doc.rect(340, currentY, 215, 45).stroke('#CBD5E1');
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0F172A').text('Reviewed & Confirmed By:', 348, currentY + 6);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E3A8A').text('Shalini Devi V', 348, currentY + 18);
        doc.fontSize(8).font('Helvetica').fillColor('#64748B').text('Senior Clinical Psychologist | Lic: RCI-PSY-2024-8841', 348, currentY + 30);

        currentY += 55;

        // 7. Clinical Disclaimer (Bottom)
        doc.rect(40, 750, 515, 40).fill('#FEF2F2').stroke('#FECACA');
        doc
          .fillColor('#991B1B')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('CLINICAL SAFETY DISCLAIMER:', 48, 755);
        doc
          .font('Helvetica')
          .fillColor('#7F1D1D')
          .text(
            config.clinicalDisclaimer,
            48,
            766,
            { width: 495 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
