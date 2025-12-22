import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = null
    this.from = process.env.EMAIL_FROM || 'noreply@facial-analyzer.com'
  }

  async init() {
    // Use environment variables for production
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } else {
      // For development, use ethereal.email (fake SMTP)
      const testAccount = await nodemailer.createTestAccount()
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      console.log('📧 Using Ethereal email for development')
      console.log(`   Preview emails at: https://ethereal.email/login`)
      console.log(`   User: ${testAccount.user}`)
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      await this.init()
    }

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    })

    // Log preview URL for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return info
  }

  async sendVerificationEmail(email, token, name) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #14b8a6; }
          h1 { color: #f8fafc; margin: 0 0 20px; }
          p { line-height: 1.6; color: #94a3b8; }
          .button { display: inline-block; background: linear-gradient(to right, #0d9488, #14b8a6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 14px; }
          .code { background: #334155; padding: 4px 12px; border-radius: 6px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Facial Analyzer</div>
          </div>
          <h1>Verify Your Email</h1>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please verify your email address to start using Facial Analyzer and access our AI-powered skin analysis features.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="code" style="word-break: break-all;">${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail(email, 'Verify Your Email - Facial Analyzer', html)
  }

  async sendPasswordResetEmail(email, token, name) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #14b8a6; }
          h1 { color: #f8fafc; margin: 0 0 20px; }
          p { line-height: 1.6; color: #94a3b8; }
          .button { display: inline-block; background: linear-gradient(to right, #0d9488, #14b8a6); color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 14px; }
          .code { background: #334155; padding: 4px 12px; border-radius: 6px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Facial Analyzer</div>
          </div>
          <h1>Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="code" style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail(email, 'Reset Your Password - Facial Analyzer', html)
  }
}

export const emailService = new EmailService()
