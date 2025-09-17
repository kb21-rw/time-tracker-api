export function removeUserConfirmation(adminName: string, removedUserName: string, removedUserEmail: string, workspaceName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Removal Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #28a745; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">User Removal Confirmed</h1>
            <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Focus Flow Time Tracker</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Hi <strong>${adminName}</strong>,
            </p>
            <p style="color: #666666; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
              You have successfully removed <strong>${removedUserName}</strong> (<em>${removedUserEmail}</em>) from the <strong>"${workspaceName}"</strong> workspace.
            </p>
            
            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                ✅ <strong>Completed:</strong> The user no longer has access to the workspace, but their previous contributions remain intact.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #495057; margin: 0; font-size: 14px;">
                📋 <strong>Audit Trail:</strong> This action has been logged for security and compliance purposes.
              </p>
            </div>
            
            <p style="color: #666666; line-height: 1.6; margin: 25px 0 0 0; font-size: 14px;">
              The removed user has been notified of this change via email.
            </p>
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