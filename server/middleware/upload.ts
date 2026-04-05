import multer from 'multer';

const resumeStorage = multer.memoryStorage();

export const uploadResumePDF = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('PDF files only'));
  }
});
