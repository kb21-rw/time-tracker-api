export function sendInvitationHtml(inviterName: string, workspaceName: string, url: string) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #4042e2; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;"> You've been invited!</h1>
            <p style="color: #e8e8ff; margin: 10px 0 0 0; font-size: 16px;">Focus Flow Time Tracker</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Hi there!
            </p>
            <p style="color: #666666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
              <strong>${inviterName}</strong> has invited you to join the <strong>"${workspaceName}"</strong> workspace on Focus Flow.
            </p>
            
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${url}" style="display: inline-block; background-color: #4042e2; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(64, 66, 226, 0.2);">
                Accept Invitation
              </a>
            </div>
            
            <!-- Features -->
            <div style="margin: 30px 0;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">What you can do:</h3>
              <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Track time across multiple projects</li>
                <li>Generate detailed reports</li>
                <li>Manage workspace settings</li>
              </ul>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f6f6f6; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
              Best regards,<br>The Focus Flow Team
            </p>
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