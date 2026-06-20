import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "client", "public", "files", "challenges");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
    cb(null, unique);
  },
});

// Single file per challenge, field name "file", 50MB cap.
export const uploadChallengeFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");

export function challengeFilePath(fileUrl: string): string {
  // fileUrl is stored as "/files/challenges/<name>" — resolve to an absolute disk path.
  return path.join(process.cwd(), "client", "public", fileUrl);
}

export function deleteChallengeFileIfExists(fileUrl: string | null | undefined) {
  if (!fileUrl) return;
  const filePath = challengeFilePath(fileUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
