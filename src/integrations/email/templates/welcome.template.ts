export interface WelcomeEmailData {
	userName: string;
	verificationUrl: string;
}

export function buildWelcomeEmailTemplate(data: WelcomeEmailData): string {
	const { userName, verificationUrl } = data;

	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome to Armoniq</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
	<table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
		<tr>
			<td align="center" style="padding: 40px 0;">
				<table role="presentation" style="width: 600px; border-collapse: collapse; border: 0; border-spacing: 0; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);">
					<tr>
						<td align="center" style="padding: 40px 30px 20px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
							<h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Armoniq</h1>
							<p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Your Music Store</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 40px 30px;">
							<h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #2d3748;">Welcome, ${userName}!</h2>
							<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
								Thank you for creating an account with Armoniq. We're excited to have you join our community of music enthusiasts.
							</p>
							<p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
								To get started, please verify your email address by clicking the button below:
							</p>
							<table role="presentation" style="width: 100%; border-collapse: collapse; border: 0; border-spacing: 0; text-align: center;">
								<tr>
									<td align="center" style="padding: 20px 0;">
										<a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
											Verify Email Address
										</a>
									</td>
								</tr>
							</table>
							<p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #718096;">
								If the button doesn't work, you can also copy and paste this link into your browser:
							</p>
							<p style="margin: 10px 0 0 0; font-size: 13px; line-height: 1.5; color: #667eea; word-break: break-all;">
								${verificationUrl}
							</p>
							<p style="margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #718096;">
								This link will expire in 24 hours for security purposes.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 30px; background: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
							<p style="margin: 0; font-size: 13px; line-height: 1.6; color: #718096; text-align: center;">
								If you didn't create an account with Armoniq, please ignore this email.
							</p>
							<p style="margin: 15px 0 0 0; font-size: 12px; color: #a0aec0; text-align: center;">
								&copy; ${new Date().getFullYear()} Armoniq. All rights reserved.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`.trim();
}
