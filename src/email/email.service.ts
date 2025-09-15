import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as Mail from 'nodemailer/lib/mailer'
import { createTransport } from 'nodemailer'
import { ConfirmationEmailDetails, InvitationDetails } from 'src/util/types'
import { UserRole } from 'src/util/role.enum'
import { resetPasswordHtml } from './templates/reset-password.template'
import { confirmationEmailHtml } from './templates/confirmation-email.template'
import { sendInvitationHtml } from './templates/send-invitation.template'
import { removeUserNotificationHtml } from './templates/remove-notification.tempate'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private nodemailerTransport

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.nodemailerTransport = createTransport({
      host: configService.get('EMAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    })
  }

  async sendResetPasswordLink(email: string, userId: number): Promise<void> {
    const payload = { email, userId }

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '900'}s`, // Default to 15 minutes
    })

    const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`

    const text = `Hi, \nTo reset your password, click here: ${url}`
    const html = resetPasswordHtml(url)

    return this.sendMail({
      to: email,
      subject: 'Reset password',
      text,
      html,
    })
  }

  private sendMail(options: Mail.Options) {
    this.logger.log('Email sent out to', options.to)
    return this.nodemailerTransport.sendMail(options)
  }

  async sendConfirmationEmail({
    email,
    userName,
    newRole,
    workspaceName,
  }: ConfirmationEmailDetails): Promise<void> {
    const text = `Hi ${userName},\n\nYour role has changed to ${newRole} in the "${workspaceName}" workspace on Focus Flow.`
    const html = confirmationEmailHtml(userName, newRole, workspaceName)

    return this.sendMail({
      to: email,
      subject: 'User role update',
      text,
      html,
    })
  }

  async sendInvitationEmail(
    workspaceName: string,
    payload: InvitationDetails,
    inviterName: string,
  ) {
    const { email, token } = payload

    // URL encode the token to prevent corruption during email transmission
    const encodedToken = encodeURIComponent(token)
    const url = `${this.configService.get('EMAIL_ACCEPT_INVITATION_URL')}?token=${encodedToken}`
    const text = `Hi,\n\n ${inviterName} has invited you to join the workspace "${workspaceName}". To accept this invitation, click here: ${url}`

    const html = sendInvitationHtml(inviterName, workspaceName, url)

    return this.sendMail({
      to: email,
      subject: 'Workspace invitation',
      text,
      html,
    })
  }

  async sendUserRemovedNotification({
    email,
    userName,
    workspaceName,
    removedBy,
  }: {
    email: string
    userName: string
    workspaceName: string
    removedBy: string
  }): Promise<void> {
    const text = `Hi ${userName},\n\nYou have been removed from the "${workspaceName}" workspace by ${removedBy}.\n\nYou will no longer have access to this workspace, but your previous contributions remain intact.\n\nIf you have any questions, please contact the workspace administrator.\n\nBest regards,\nThe Focus Flow Team`

    const html = removeUserNotificationHtml(userName, workspaceName, removedBy)

    return this.sendMail({
      to: email,
      subject: `Access removed from ${workspaceName} workspace`,
      text,
      html,
    })
  }

  async sendUserRemovalConfirmation({
    email,
    adminName,
    removedUserName,
    removedUserEmail,
    workspaceName,
  }: {
    email: string
    adminName: string
    removedUserName: string
    removedUserEmail: string
    workspaceName: string
  }): Promise<void> {
    const text = `Hi ${adminName},\n\nYou have successfully removed ${removedUserName} (${removedUserEmail}) from the "${workspaceName}" workspace.\n\nThe user no longer has access to the workspace, but their previous contributions remain intact.\n\nThis action has been logged for audit purposes.\n\nBest regards,\nThe Focus Flow Team`

    const html = `
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

    return this.sendMail({
      to: email,
      subject: `User removal confirmation - ${workspaceName}`,
      text,
      html,
    })
  }
}
