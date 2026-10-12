const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this or use host/port for other services
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email with login credentials to a new staff member.
 * @param {string} email - The recipient's email
 * @param {string} name - The recipient's name
 * @param {string} password - The generated or provided password
 */
const sendStaffCredentialsEmail = async (email, name, password) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email sending.');
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const mailOptions = {
    from: `"FixIt AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to FixIt AI — Your Staff Account Credentials',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FixIt AI</title>
        <style>
          body, p, h1, h2, h3, table, td { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6; -webkit-font-smoothing: antialiased; }
          a { text-decoration: none; }
          .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 16px; }
          .card { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); }
          .brand-stripe { height: 4px; background: linear-gradient(90deg, #4f46e5 0%, #2563eb 50%, #4f46e5 100%); }
          .header { padding: 30px 36px 22px 36px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; }
          .logo-badge { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); display: inline-block; vertical-align: middle; text-align: center; line-height: 38px; color: #ffffff; font-size: 18px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25); }
          .logo-text { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; vertical-align: middle; margin-left: 10px; }
          .logo-ai { color: #4f46e5; }
          .tagline { display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 0.8px; margin-top: 4px; }
          .content { padding: 36px; }
          .badge { display: inline-block; background-color: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid #e0e7ff; margin-bottom: 16px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
          .lead-text { font-size: 15px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
          .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px 24px; margin: 24px 0; }
          .cred-row { margin-bottom: 16px; }
          .cred-row:last-child { margin-bottom: 0; }
          .cred-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px; }
          .cred-value { font-size: 15px; font-weight: 600; color: #0f172a; }
          .cred-email { color: #4f46e5; }
          .password-pill { display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; background-color: #ffffff; color: #0f172a; padding: 7px 14px; border-radius: 8px; border: 1px solid #cbd5e1; letter-spacing: 1px; }
          .btn-container { text-align: center; margin: 32px 0 24px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); color: #ffffff !important; padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); }
          .notice-box { background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin: 24px 0 0 0; font-size: 13px; color: #92400e; line-height: 1.5; }
          .signoff { margin-top: 32px; font-size: 14px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 24px; }
          .signoff-name { color: #0f172a; font-weight: 700; }
          .footer { background-color: #0f172a; color: #94a3b8; padding: 24px 36px; text-align: center; font-size: 12px; line-height: 1.6; }
          .footer-copy { color: #64748b; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="brand-stripe"></div>
            
            <div class="header">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <div>
                      <div class="logo-badge">&#128295;</div>
                      <span class="logo-text">FixIt <span class="logo-ai">AI</span></span>
                    </div>
                    <span class="tagline">Facility &amp; Maintenance Suite</span>
                  </td>
                  <td align="right" valign="top">
                    <span class="badge" style="margin: 0; background-color: #f1f5f9; color: #475569; border-color: #e2e8f0;">Staff Portal</span>
                  </td>
                </tr>
              </table>
            </div>

            <div class="content">
              <span class="badge">Welcome to the Team</span>
              <h1 class="title">Hello, ${name}! &#128075;</h1>
              <p class="lead-text">
                Your staff account for the <strong>FixIt AI</strong> maintenance portal has been created. You can now log in to review complaints, update work status, and manage campus facilities.
              </p>

              <div class="credentials-box">
                <div class="cred-row">
                  <div class="cred-label">Login Email</div>
                  <div class="cred-value cred-email">${email}</div>
                </div>
                <div class="cred-row" style="margin-top: 16px;">
                  <div class="cred-label">Temporary Password</div>
                  <div>
                    <span class="password-pill">${password}</span>
                  </div>
                </div>
              </div>

              <div class="btn-container">
                <a href="${clientUrl}/login" class="btn" target="_blank">Log In to Staff Portal &rarr;</a>
              </div>

              <div class="notice-box">
                <strong>&#128274; Security Note:</strong> For account safety, please sign in and change your temporary password immediately from your profile settings.
              </div>

              <div class="signoff">
                Warm regards,<br>
                <span class="signoff-name">FixIt AI Administration</span>
              </div>
            </div>

            <div class="footer">
              <p>Automated dispatch from <strong>FixIt AI Maintenance Management System</strong>.</p>
              <p class="footer-copy">&copy; ${new Date().getFullYear()} FixIt AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
};

/**
 * Send an OTP code to a user for verification or password reset.
 * @param {string} email - The recipient's email
 * @param {string} otp - The 6-digit OTP code
 * @param {string} type - The type of OTP ('registration' or 'reset')
 */
const sendOtpEmail = async (email, otp, type) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping OTP email.');
    return;
  }

  const isRegistration = type === 'registration';
  const subject = isRegistration 
    ? 'Verify your FixIt AI Account' 
    : 'FixIt AI Password Reset Code';
    
  const badgeLabel = isRegistration ? 'ACCOUNT VERIFICATION' : 'PASSWORD RESET';
  const title = isRegistration ? 'Verify Your Email Address' : 'Reset Your Password';
  const message = isRegistration
    ? 'Thank you for signing up with <strong>FixIt AI</strong>! Enter the 6-digit verification code below to verify your email address and activate your account.'
    : 'We received a request to reset your password for your <strong>FixIt AI</strong> account. Enter the 6-digit code below to proceed securely.';

  const mailOptions = {
    from: `"FixIt AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body, p, h1, h2, h3, table, td { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6; -webkit-font-smoothing: antialiased; }
          a { text-decoration: none; }
          .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 16px; }
          .card { max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); }
          .brand-stripe { height: 4px; background: linear-gradient(90deg, #4f46e5 0%, #2563eb 50%, #4f46e5 100%); }
          .header { padding: 32px 36px 20px 36px; text-align: center; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; }
          .logo-badge { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); display: inline-block; vertical-align: middle; text-align: center; line-height: 42px; color: #ffffff; font-size: 20px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25); margin-bottom: 8px; }
          .logo-text { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
          .logo-ai { color: #4f46e5; }
          .content { padding: 36px 32px; text-align: center; }
          .badge { display: inline-block; background-color: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid #e0e7ff; margin-bottom: 14px; }
          .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
          .lead-text { font-size: 15px; color: #475569; margin-bottom: 28px; line-height: 1.6; max-width: 440px; margin-left: auto; margin-right: auto; }
          .otp-container { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 24px 20px; margin: 0 auto 20px auto; max-width: 320px; text-align: center; }
          .otp-code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; color: #4f46e5; letter-spacing: 8px; line-height: 1.2; text-indent: 8px; }
          .expiry-pill { display: inline-block; font-size: 12px; font-weight: 600; color: #64748b; background-color: #f1f5f9; padding: 4px 12px; border-radius: 9999px; margin-top: 10px; border: 1px solid #e2e8f0; }
          .security-note { font-size: 13px; color: #64748b; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; line-height: 1.5; }
          .security-note strong { color: #334155; }
          .footer { background-color: #0f172a; color: #94a3b8; padding: 22px 32px; text-align: center; font-size: 12px; line-height: 1.6; }
          .footer-copy { color: #64748b; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="brand-stripe"></div>
            
            <div class="header">
              <div><div class="logo-badge">&#128295;</div></div>
              <div class="logo-text">FixIt <span class="logo-ai">AI</span></div>
            </div>

            <div class="content">
              <span class="badge">${badgeLabel}</span>
              <h1 class="title">${title}</h1>
              <p class="lead-text">${message}</p>

              <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="expiry-pill">&#9201; Valid for 5 minutes</div>
              </div>

              <p class="security-note">
                <strong>Didn't request this code?</strong> If this wasn't you, please disregard this email. Your account remains completely secure.
              </p>
            </div>

            <div class="footer">
              <p>Automated security dispatch from <strong>FixIt AI Maintenance Platform</strong>.</p>
              <p class="footer-copy">&copy; ${new Date().getFullYear()} FixIt AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
  }
};

module.exports = {
  sendStaffCredentialsEmail,
  sendOtpEmail,
};
