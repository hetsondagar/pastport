import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailEnabledEnv = (process.env.EMAIL_ENABLED || '').toLowerCase();
const isEmailEnabledFlag = emailEnabledEnv === 'true' || emailEnabledEnv === '1' || emailEnabledEnv === 'yes';
const hasEmailCredentials = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS);
const isEmailEnabled = isEmailEnabledFlag && hasEmailCredentials;

let transporter = null;

if (isEmailEnabled) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.log('Email service error:', error);
    } else {
      console.log('Email service is ready to send messages');
    }
  });
} else {
  console.log('Email service disabled (set EMAIL_ENABLED=true and provide EMAIL_HOST/PORT/USER/PASS to enable).');
}

// Send email function
export const sendEmail = async (to, subject, html, text = '') => {
  if (!isEmailEnabled || !transporter) {
    return { success: false, skipped: true, reason: 'Email disabled in this environment' };
  }

  try {
    const mailOptions = {
      from: `"PastPort" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to PastPort! 🌟',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to PastPort!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your journey through time begins now</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to PastPort, your personal time capsule app! We're excited to have you on board.
          </p>
          <p style="color: #666; line-height: 1.6;">
            You can now start creating time capsules to preserve your memories and send messages to your future self.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;">
              Start Creating Capsules
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 PastPort. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to PastPort, ${userName}! Your journey through time begins now. Visit ${process.env.FRONTEND_URL}/dashboard to start creating time capsules.`
  }),

  unlockReminder: (userName, capsuleTitle, unlockDate) => ({
    subject: 'Your time capsule is ready to unlock! 🔓',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Time to Unlock! 🔓</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your capsule is ready</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your time capsule "<strong>${capsuleTitle}</strong>" is ready to be unlocked.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Unlock date: <strong>${new Date(unlockDate).toLocaleDateString()}</strong>
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;">
              Unlock Your Capsule
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            Don't forget to check your PastPort dashboard to unlock your capsule and discover what your past self left for you!
          </p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 PastPort. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Hi ${userName}! Your time capsule "${capsuleTitle}" is ready to be unlocked on ${new Date(unlockDate).toLocaleDateString()}. Visit ${process.env.FRONTEND_URL}/dashboard to unlock it.`
  }),

  friendRequest: (userName, requesterName) => ({
    subject: `${requesterName} sent you a friend request on PastPort`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Friend Request 👥</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Someone wants to connect with you</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            <strong>${requesterName}</strong> sent you a friend request on PastPort.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Connect with friends to share time capsules and create memories together!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;">
              View Friend Request
            </a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2024 PastPort. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Hi ${userName}! ${requesterName} sent you a friend request on PastPort. Visit ${process.env.FRONTEND_URL}/dashboard to view and respond to the request.`
  })
};

export default { sendEmail, emailTemplates };
