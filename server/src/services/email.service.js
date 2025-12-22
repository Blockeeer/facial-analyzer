import sgMail from '@sendgrid/mail'

class EmailService {
  constructor() {
    this.initialized = false
  }

  init() {
    if (!this.initialized && process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      this.initialized = true
      console.log('📧 Email service initialized with SendGrid')
      console.log(`📧 Sending from: ${process.env.EMAIL_FROM}`)
    }
  }

  async sendEmail(to, subject, html) {
    this.init()

    if (!this.initialized) {
      console.warn('📧 Email not sent - SENDGRID_API_KEY not configured')
      console.log(`   To: ${to}`)
      console.log(`   Subject: ${subject}`)
      return { id: 'dev-mode', message: 'Email service not configured' }
    }

    const from = process.env.EMAIL_FROM
    if (!from) {
      console.error('📧 EMAIL_FROM not configured in .env')
      throw new Error('EMAIL_FROM not configured')
    }

    try {
      const msg = {
        to,
        from,
        subject,
        html,
      }

      const response = await sgMail.send(msg)
      console.log(`📧 Email sent to ${to} - Status: ${response[0].statusCode}`)
      return { id: response[0].headers['x-message-id'], statusCode: response[0].statusCode }
    } catch (error) {
      console.error('📧 Failed to send email:', error.message)
      if (error.response) {
        console.error('📧 SendGrid error details:', error.response.body)
      }
      throw error
    }
  }

  async sendVerificationEmail(email, token, name) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .logo-sub { font-size: 14px; color: #64748b; margin-top: 4px; }
          h1 { color: #f8fafc; margin: 0 0 20px; font-size: 24px; }
          p { line-height: 1.6; color: #94a3b8; margin: 16px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 13px; }
          .link { background: #334155; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; color: #94a3b8; display: block; margin: 16px 0; }
          .highlight { color: #14b8a6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🧬 PeptiScan</div>
            <div class="logo-sub">AI-Powered Skin Analysis</div>
          </div>
          <h1>Verify Your Email</h1>
          <p>Hi <span class="highlight">${name}</span>,</p>
          <p>Welcome to PeptiScan! Please verify your email address to unlock all features including personalized peptide recommendations based on AI skin analysis.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </p>
          <p style="font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link">${verifyUrl}</div>
          <p style="font-size: 13px; color: #64748b;">This link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} PeptiScan. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail(email, 'Verify Your Email - PeptiScan', html)
  }

  async sendPasswordResetEmail(email, token, name) {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #14b8a6; }
          .logo-sub { font-size: 14px; color: #64748b; margin-top: 4px; }
          h1 { color: #f8fafc; margin: 0 0 20px; font-size: 24px; }
          p { line-height: 1.6; color: #94a3b8; margin: 16px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 13px; }
          .link { background: #334155; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; color: #94a3b8; display: block; margin: 16px 0; }
          .highlight { color: #14b8a6; }
          .warning { background: #422006; border: 1px solid #854d0e; padding: 12px 16px; border-radius: 8px; color: #fbbf24; font-size: 13px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🧬 PeptiScan</div>
            <div class="logo-sub">AI-Powered Skin Analysis</div>
          </div>
          <h1>Reset Your Password</h1>
          <p>Hi <span class="highlight">${name}</span>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p style="font-size: 14px;">Or copy and paste this link into your browser:</p>
          <div class="link">${resetUrl}</div>
          <p style="font-size: 13px; color: #64748b;">This link will expire in 1 hour.</p>
          <div class="warning">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </div>
          <div class="footer">
            <p>For security, this request was received from a web browser.</p>
            <p style="margin-top: 12px;">&copy; ${new Date().getFullYear()} PeptiScan. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail(email, 'Reset Your Password - PeptiScan', html)
  }
}

export const emailService = new EmailService()
