const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../middleware/authMiddleware');

let cloudinary = null;
try {
  // Optional dependency: falls back to local /uploads if not configured.
  // eslint-disable-next-line global-require
  cloudinary = require('cloudinary').v2;
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } else {
    cloudinary = null;
  }
} catch {
  cloudinary = null;
}

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|webm/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images (jpg, png, gif, webp) and videos (mp4, webm) are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter
});

// Upload single file (admin only)
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const localPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isVideo = ['.mp4', '.webm'].includes(ext) || String(req.file.mimetype || '').startsWith('video/');

    if (cloudinary) {
      const resourceType = isVideo ? 'video' : 'image';
      const result = await cloudinary.uploader.upload(localPath, {
        resource_type: resourceType,
        folder: process.env.CLOUDINARY_FOLDER || 'travai/cities',
      });
      // Cleanup temp local file
      try { fs.unlinkSync(localPath); } catch { /* ignore */ }
      return res.json({ url: result.secure_url, filename: req.file.filename, size: req.file.size });
    }

    const url = `/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename, size: req.file.size });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload multiple files (admin only) — max 10
router.post('/multiple', requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    if (cloudinary) {
      const uploaded = [];
      for (const f of req.files) {
        const ext = path.extname(f.originalname).toLowerCase();
        const isVideo = ['.mp4', '.webm'].includes(ext) || String(f.mimetype || '').startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
        const result = await cloudinary.uploader.upload(f.path, {
          resource_type: resourceType,
          folder: process.env.CLOUDINARY_FOLDER || 'travai/cities',
        });
        try { fs.unlinkSync(f.path); } catch { /* ignore */ }
        uploaded.push({ url: result.secure_url, filename: f.filename, size: f.size });
      }
      return res.json({ files: uploaded });
    }

    const urls = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      size: f.size,
    }));
    return res.json({ files: urls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a file (admin only)
router.delete('/:filename', requireAdmin, (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;
