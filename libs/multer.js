import multer from "multer";

// Set up multer storage configuration for aws s3
const storageS3 = multer.memoryStorage(); // Store files in memory
export const uploadS3 = multer({ storage: storageS3 });