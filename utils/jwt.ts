import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

export function generateToken(user: { id: number; username: string }) {
  const payload = { id: user.id, username: user.username };
  return jwt.sign(payload, SECRET, { expiresIn: '1h' }); 
}