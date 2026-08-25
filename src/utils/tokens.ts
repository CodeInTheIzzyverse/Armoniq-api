import * as crypto from 'crypto';

export function generateSecureToken(bytes: number = 32): string {
	return crypto.randomBytes(bytes).toString('hex');
}

export function generateEmailVerificationToken(): string {
	return generateSecureToken(32);
}

export function generatePasswordResetToken(): string {
	return generateSecureToken(32);
}
