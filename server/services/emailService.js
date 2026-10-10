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

  const mailOptions = {
    from: `"FixIt AI Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to FixIt AI - Your Staff Account Details',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .content h2 { color: #111827; font-size: 22px; margin-top: 0; font-weight: 700; }
        .credentials-box { background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #e2e8f0; border-left-width: 4px; }
        .credentials-box p { margin: 8px 0; font-size: 15px; }
        .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 10px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3); }
        .warning { color: #b91c1c; font-size: 13px; font-weight: 600; background-color: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fecaca; margin-top: 30px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; background-color: #f9fafb; }
      </style>
      </head>
      <body style="background-color: #f9fafb; padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>FixIt AI</h1>
          </div>
          <div class="content">
            <h2>Welcome to the Team, ${name}! 👋</h2>
            <p>We are excited to have you on board. Your official staff account for the FixIt AI portal has been created and is ready to use.</p>
            
            <p>Here are your secure login credentials:</p>
            
            <div class="credentials-box">
              <p><strong>Email:</strong> <span style="color: #4f46e5; font-weight: 600;">${email}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; background: #e5e7eb; padding: 3px 8px; border-radius: 4px; color: #111827;">${password}</span></p>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="btn">Log In to Portal</a>
            </div>

            <p class="warning">
              ⚠️ For your security, please log in and change your password immediately from your profile settings.
            </p>
            
            <p style="margin-top: 35px; margin-bottom: 0;">Best regards,<br><strong style="color: #111827;">The FixIt AI Admin Team</strong></p>
          </div>
          <div class="footer">
            This is an automated email sent from the FixIt AI Facility Management System. Please do not reply to this email.
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

  const subject = type === 'registration' 
    ? 'Verify your FixIt AI Account' 
    : 'FixIt AI Password Reset Code';
    
  const title = type === 'registration'
    ? 'Account Verification'
    : 'Password Reset';
    
  const message = type === 'registration'
    ? 'Thank you for registering with FixIt AI! Please use the following One-Time Password (OTP) to verify your email address and activate your account.'
    : 'We received a request to reset the password for your FixIt AI account. Please use the following One-Time Password (OTP) to securely change your password.';

  const mailOptions = {
    from: `"FixIt AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; text-align: center; }
        .content h2 { color: #111827; font-size: 22px; margin-top: 0; font-weight: 700; }
        .otp-box { background-color: #f0fdf4; border: 2px dashed #10b981; padding: 20px; border-radius: 8px; margin: 30px auto; max-width: 250px; }
        .otp-code { font-family: monospace; font-size: 32px; font-weight: bold; color: #047857; letter-spacing: 4px; }
        .warning { color: #6b7280; font-size: 13px; margin-top: 30px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; background-color: #f9fafb; }
      </style>
      </head>
      <body style="background-color: #f9fafb; padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>FixIt AI Security</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p style="font-size: 15px;">${message}</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p style="font-size: 15px;"><strong>This code will expire in 5 minutes.</strong></p>

            <p class="warning">
              If you did not request this code, please ignore this email. Your account is safe.
            </p>
          </div>
          <div class="footer">
            This is an automated security email from FixIt AI. Please do not reply.
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
