const path = require('path');
const fs   = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

const uploadToS3 = async (fileBuffer, key, contentType) => {
  // Local mein save karo
  const filename = path.basename(key);
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(filePath, fileBuffer);
  return `http://localhost:5000/uploads/${filename}`;
};

const getPresignedUrl = async (key, expiresIn = 3600) => {
  const filename = path.basename(key);
  return `http://localhost:5000/uploads/${filename}`;
};

const deleteFromS3 = async (key) => {
  try {
    const filename = path.basename(key);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Delete error:', err.message);
  }
};

module.exports = { uploadToS3, getPresignedUrl, deleteFromS3 };