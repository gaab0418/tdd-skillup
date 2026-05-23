import { Certificate, User, Course } from '../../models/index.js';

class CertificateServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CertificateServiceError';
  }
}

const certificateService = {
  async getCertificateForDownload(certificateId, userId) {
    const certificate = await Certificate.findOne({
      where: { id: certificateId, userId },
      include: [
        { model: User, as: 'user' },
        { model: Course, as: 'course' }
      ]
    });

    if (!certificate) {
      throw new CertificateServiceError('Certificado não encontrado.');
    }

    return certificate;
  }
};

export { certificateService, CertificateServiceError };
