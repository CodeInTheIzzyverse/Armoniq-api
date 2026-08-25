export const AUTH_MESSAGES = {
	// Registration messages
	REGISTRATION: {
		SUCCESS:
			'Registration successful. Please check your email to verify your account.',
		EMAIL_ALREADY_EXISTS:
			'An account with this email address already exists.',
		INVALID_DATA:
			'Invalid registration data. Please check your input and try again.',
		WEAK_PASSWORD:
			'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
	},

	// Email verification messages
	EMAIL_VERIFICATION: {
		SUCCESS:
			'Email verified successfully. You can now log in to your account.',
		INVALID_TOKEN: 'Invalid or expired verification token.',
		ALREADY_VERIFIED: 'Email address is already verified.',
		RESEND_SUCCESS:
			'Verification email has been resent. Please check your inbox.',
	},

	// Login messages
	LOGIN: {
		SUCCESS: 'Login successful.',
		INVALID_CREDENTIALS: 'Invalid email or password.',
		ACCOUNT_NOT_VERIFIED:
			'Please verify your email address before logging in.',
		ACCOUNT_DISABLED:
			'Your account has been disabled. Please contact support.',
	},

	// Password reset messages
	PASSWORD_RESET: {
		REQUEST_SUCCESS:
			'If your email is registered, you will receive a password reset link.',
		RESET_SUCCESS:
			'Password has been reset successfully. You can now log in with your new password.',
		INVALID_TOKEN: 'Invalid or expired password reset token.',
		WEAK_PASSWORD:
			'New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
	},

	// Logout messages
	LOGOUT: {
		SUCCESS: 'Logout successful.',
	},

	// Token messages
	TOKEN: {
		INVALID: 'Invalid token.',
		EXPIRED: 'Token has expired.',
		MISSING: 'Authentication token is missing.',
		REFRESH_SUCCESS: 'Token refreshed successfully.',
	},

	// General auth messages
	GENERAL: {
		UNAUTHORIZED: 'You are not authorized to perform this action.',
		FORBIDDEN: 'Access denied.',
		SESSION_EXPIRED: 'Your session has expired. Please log in again.',
	},
} as const;
