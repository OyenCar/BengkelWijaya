import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRES || '12h' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}
