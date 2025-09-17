
export function resetPasswordHtml(url: string) {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background-color: #4042e2; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Password Reset</h1>
              <p style="color: #e8e8ff; margin: 10px 0 0 0; font-size: 16px;">Focus Flow Time Tracker</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #666666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                You requested a password reset for your Focus Flow account. Click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${url}" style="display: inline-block; background-color: #4042e2; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(64, 66, 226, 0.2);">
                  Reset Password
                </a>
              </div>
              
              <div style="background-color: #fff5e6; border-left: 4px solid #ff9500; padding: 15px; margin: 30px 0; border-radius: 4px;">
                <p style="color: #b8860b; margin: 0; font-size: 14px;">
                  ⚠️ <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
                </p>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f6f6f6; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © 2025 Focus Flow. All rights reserved.
              </p>
              <p style="color: #999999; margin: 5px 0 0 0; font-size: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
}
