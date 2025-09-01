import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as Mail from 'nodemailer/lib/mailer'
import { createTransport } from 'nodemailer'
import { ConfirmationEmailDetails, InvitationDetails } from 'src/util/types'
import { UserRole } from 'src/util/role.enum'

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
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Role update</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f6f6f6;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      "
    >
      <!-- Header -->
      <div
        style="
          background-color: #4042e2;
          padding: 40px 30px;
          text-align: center;
        "
      >
        <h1
          style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600"
        >
          You are now an admin!
        </h1>
        <p style="color: #e8e8ff; margin: 10px 0 0 0; font-size: 16px">
          Focus Flow Time Tracker
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 30px">
        <p
          style="
            color: #666666;
            line-height: 1.6;
            margin: 0 0 20px 0;
            font-size: 16px;
          "
        >
          ${userName},<br />
        </p>
        <p
          style="
            color: #666666;
            line-height: 1.6;
            margin: 0 0 25px 0;
            font-size: 16px;
          "
        >
          Your role has changed to <strong>${newRole}</strong> in the
          <strong>"${workspaceName}"</strong> workspace on Focus Flow.
        </p>

        <!-- Features -->
        <div style="margin: 30px 0">
          <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px">
            What you can now do in your workspace:
          </h3>
          <ul
            style="
              color: #666666;
              line-height: 1.8;
              margin: 0;
              padding-left: 20px;
            "
          >
            <li>Invite different users</li>
            <li>Create clients and projects</li>
            <li>Create more workspaces</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div
        style="
          background-color: #f6f6f6;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e0e0e0;
        "
      >
        <p
          style="
            color: #999999;
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: 600;
          "
        >
          Best regards,<br />The Focus Flow Team
        </p>
        <p style="color: #999999; margin: 0; font-size: 12px">
          © 2025 Focus Flow. All rights reserved.
        </p>
        <p style="color: #999999; margin: 5px 0 0 0; font-size: 12px">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    </div>
  </body>
</html>
`

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

    const url = `${this.configService.get('EMAIL_ACCEPT_INVITATION_URL')}?token=${token}`
    const text = `Hi,\n\n ${inviterName} has invited you to join the workspace "${workspaceName}". To accept this invitation, click here: ${url}`

    const html = `
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

    return this.sendMail({
      to: email,
      subject: 'Workspace invitation',
      text,
      html,
    })
  }
}
