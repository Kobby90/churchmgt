import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to delete old logo
async function deleteOldLogo() {
  try {
    // Get current logo URL from settings
    const { rows } = await db.query(
      "SELECT value FROM settings WHERE key = 'logo_url'"
    );
    
    if (rows.length > 0) {
      // The value is already a JSON string, so we need to parse it first
      let currentLogoUrl;
      try {
        currentLogoUrl = JSON.parse(rows[0].value);
      } catch (e) {
        // If parsing fails, use the value as is
        currentLogoUrl = rows[0].value;
      }

      if (currentLogoUrl && currentLogoUrl !== '/logo.png') {
        // Remove any leading slash for path joining
        const relativePath = currentLogoUrl.startsWith('/') ? currentLogoUrl.slice(1) : currentLogoUrl;
        const oldLogoPath = path.join(process.cwd(), 'public', relativePath);
        
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
          console.log('Deleted old logo:', oldLogoPath);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting old logo:', error);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Always use 'logo' as the base name with the original extension
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  }
});

router.post('/upload', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old logo before saving new one
    await deleteOldLogo();

    const url = `/uploads/${req.file.filename}`;
    
    // Update the logo_url in settings
    await db.query(
      `UPDATE settings 
       SET value = $1 
       WHERE key = 'logo_url'`,
      [JSON.stringify(url)]
    );

    res.json({ url });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

export default router; 