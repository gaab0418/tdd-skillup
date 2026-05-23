import PDFDocument from 'pdfkit';
import { certificateService, CertificateServiceError } from './certificateService.js';
import path from 'path';

const certificateController = {
  downloadCertificate: async (req, res) => {
    try {
      const certificate = await certificateService.getCertificateForDownload(req.params.id, req.session.userId);

      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50
      });

      // Headers for PDF download
      res.setHeader('Content-disposition', `attachment; filename=Certificado-${certificate.course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      res.setHeader('Content-type', 'application/pdf');

      doc.pipe(res);

      // Design do Certificado
      
      // Borda
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(5)
         .stroke('#0050cb');
      
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
         .lineWidth(1)
         .stroke('#0050cb');

      // Cabeçalho
      doc.fontSize(40)
         .fillColor('#0050cb')
         .text('CERTIFICADO DE CONCLUSÃO', 0, 120, { align: 'center' });

      doc.moveDown();
      
      // Corpo
      doc.fontSize(20)
         .fillColor('#333333')
         .text('Certificamos que', { align: 'center' });
      
      doc.moveDown(0.5);

      doc.fontSize(30)
         .fillColor('#000000')
         .text(certificate.user.name, { align: 'center', underline: true });

      doc.moveDown(0.5);

      doc.fontSize(20)
         .fillColor('#333333')
         .text(`concluiu com êxito o curso de`, { align: 'center' });

      doc.moveDown(0.5);

      doc.fontSize(25)
         .fillColor('#006c4f')
         .text(certificate.course.title, { align: 'center' });

      doc.moveDown();

      const dateStr = certificate.issuedAt.toLocaleDateString('pt-BR');
      doc.fontSize(16)
         .fillColor('#666666')
         .text(`Emitido em: ${dateStr}`, { align: 'center' });

      // Código do certificado
      doc.fontSize(12)
         .fillColor('#999999')
         .text(`Código de Validação: ${certificate.certificateCode}`, 50, doc.page.height - 80, { align: 'left' });

      // Assinatura (Simulada)
      doc.fontSize(16)
         .fillColor('#000000')
         .text('_____________________________', 0, doc.page.height - 120, { align: 'right' })
         .fontSize(12)
         .text('SkillUp Team', 0, doc.page.height - 100, { align: 'right', right: 50 });

      doc.end();

    } catch (error) {
      if (error instanceof CertificateServiceError) {
        req.flash('error', error.message);
        return res.redirect('/profile');
      }
      console.error('Erro ao gerar certificado:', error);
      req.flash('error', 'Erro ao gerar o PDF do certificado.');
      res.redirect('/profile');
    }
  }
};

export default certificateController;
