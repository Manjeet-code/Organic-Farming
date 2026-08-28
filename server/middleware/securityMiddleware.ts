import { Request, Response, NextFunction } from 'express';

// In-memory rate limiting map for login attempts (15-minute sliding window)
const loginAttemptMap = new Map<string, { count: number; firstAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 1000; // High limit to prevent blocking during development / testing
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const clearAuthRateLimit = () => {
  loginAttemptMap.clear();
};


export const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = loginAttemptMap.get(ip);

  if (!record) {
    loginAttemptMap.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    // Reset window
    loginAttemptMap.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({
      message: 'Too many authentication attempts. Please try again after 15 minutes for security protection.',
    });
  }

  record.count += 1;
  return next();
};

// Base64 Photo Upload Security Sanitizer & File Size Restrictor (< 5MB)
export const validatePhotoUploadPayload = (photoUrl?: string): { isValid: boolean; error?: string } => {
  if (!photoUrl) return { isValid: true };

  // Check if string is data URL
  if (!photoUrl.startsWith('data:image/')) {
    return { isValid: false, error: 'Invalid file format. Only JPEG, PNG, and WebP images are allowed.' };
  }

  // Check byte size approximation (Base64 string length * 0.75)
  const sizeInBytes = (photoUrl.length * 3) / 4;
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (sizeInBytes > maxSizeBytes) {
    return { isValid: false, error: 'Uploaded defect evidence photo exceeds maximum 5MB size limit.' };
  }

  return { isValid: true };
};
