export interface PasswordResetData {
	userName: string;
	resetUrl: string;
}

export function buildPasswordResetTemplate({
	userName,
	resetUrl,
}: PasswordResetData): string {
	return `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
			<h1>Reset your Armoniq password</h1>
			<p>Hello ${userName},</p>
			<p>We received a request to reset your Armoniq password.</p>
			<p><a href="${resetUrl}">Reset password</a></p>
			<p>This single-use link expires in 15 minutes.</p>
			<p>If you did not request this, you can safely ignore this email.</p>
		</div>
	`;
}
