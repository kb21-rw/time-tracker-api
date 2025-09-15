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
import { removeUserNotificationHtml } from './templates/remove-user-notification.tempate'
import { removeUserConfirmation } from './templates/remove-user-confirmation'

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

    const html = removeUserConfirmation(adminName, removedUserName, removedUserEmail, workspaceName)

    return this.sendMail({
      to: email,
      subject: `User removal confirmation - ${workspaceName}`,
      text,
      html,
    })
  }
}
