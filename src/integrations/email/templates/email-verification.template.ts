export interface EmailVerificationData {
	userName: string;
	verificationUrl: string;
}

export function buildEmailVerificationTemplate({
	userName,
	verificationUrl,
}: EmailVerificationData): string {
	return `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
			<h1>Verify your Armoniq email</h1>
			<p>Hello ${userName},</p>
			<p>Please verify your email address to activate your Armoniq account.</p>
			<p><a href="${verificationUrl}">Verify email address</a></p>
			<p>This link expires in 24 hours.</p>
		</div>
	`;
}
