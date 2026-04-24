import multer from 'multer';

// Use memory storage for simplicity, but for production consider disk or cloud storage
const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  'application/pdf',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain',
  // Document types for cover letters, certificates
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Image types for scanned certificates
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// Multiple file upload for candidate document submission (up to 5 files)
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

export default upload;
