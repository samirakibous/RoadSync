import multer from "multer";
import path from "path";
import fs from "fs";

const fuelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/uploads/fuelLogs";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = Date.now() + path.extname(file.originalname);
    cb(null, name);
  }
});

const fuelFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const valid = allowed.test(file.mimetype);
  cb(valid ? null : new Error("Type non supporté"), valid);
};

export const uploadFuelLog = multer({
  storage: fuelStorage,
  fileFilter: fuelFilter
}).single("facture");
