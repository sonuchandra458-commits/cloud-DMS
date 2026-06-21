const crypto = require('crypto');

const ALGORITHM  = 'aes-256-cbc';
const KEY        = Buffer.from(process.env.ENCRYPTION_KEY || 'myEncryptionKey32CharactersLong!!', 'utf8').slice(0, 32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const generateFileKey = (userId, fileName) => {
  const timestamp = Date.now();
  const random    = crypto.randomBytes(8).toString('hex');
  return `documents/${userId}/${timestamp}-${random}-${fileName}`;
};

module.exports = { encrypt, decrypt, generateFileKey };