import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as Mail from 'nodemailer/lib/mailer'
import { createTransport } from 'nodemailer'
import { InviteUserDto } from 'src/workspaces/dto/invite-user.dto'

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
    const html = `
      <h3>Password Reset Request</h3>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${url}">Reset your password</a></p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `

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

  async invitationEmail(workspaceName: string,{ fullName, email, token}){

    const url = `${this.configService.get('EMAIL_ACCEPT_INVITATION_URL')}?token=${token}`

    const text = `Hi ${fullName},\n\nYou have been invited to join the workspace "${workspaceName}". To accept this invitation, click here: ${url}`
    const html = `
      <h3>Workspace Invitation</h3>
      <p>Hi ${fullName},</p>
      <p>You have been invited to join the workspace <strong>"${workspaceName}"</strong>.</p>
      <p>To accept this invitation, click the link below:</p>
      <p><a href="${url}">Accept invitation</a></p>
      <p>Best regards,<br>Focus flow Team</p>
    `;

    return this.sendMail({
      to: email,
      subject: 'workspace invitation',
      text,
      html,
    })

  }
}
