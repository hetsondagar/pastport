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
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

  // Verify connection asynchronously (non-blocking)
  transporter.verify()
    .then(() => {
      console.log('✅ Email service is ready to send messages');
    })
    .catch((error) => {
      console.log('⚠️ Email service error (non-critical):', error.message);
      console.log('Email notifications will be disabled. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
  });
} else {
  console.log('📧 Email service disabled (set EMAIL_ENABLED=true and provide EMAIL_HOST/PORT/USER/PASS to enable).');
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
    subject: 'Welcome to PastPort! 🌟 Your Journey Through Time Begins',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #f5f5f5;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 45px 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <div style="font-size: 60px; margin-bottom: 15px;">🌟🎁✨</div>
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">Welcome to PastPort!</h1>
          <p style="margin: 18px 0 0 0; font-size: 19px; opacity: 0.95;">Your journey through time begins now</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 35px; background: white;">
          <h2 style="color: #333; margin-top: 0; font-size: 26px;">Hi ${userName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.8; font-size: 17px; margin: 25px 0;">
            We're thrilled to have you on board! 🎉 PastPort is your personal time machine where you can preserve precious memories, send messages to your future self, and create magical moments that last forever.
          </p>

          <!-- Features Section -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 15px; padding: 30px; margin: 30px 0; color: white;">
            <h3 style="margin: 0 0 20px 0; font-size: 24px; text-align: center;">✨ Amazing Features Await You ✨</h3>
            
            <div style="margin: 20px 0;">
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">🎁</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Time Capsules</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Create digital time capsules and unlock them on a future date. Lock them with riddles or time locks!</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">📝</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Daily Journal</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Write daily entries, track your moods, and watch your journey unfold in a beautiful calendar view.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">🌌</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Memory Constellation</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">See your memories come alive as stars in a stunning 3D space! Each entry becomes a shining star.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">📸</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Media Attachments</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Add photos, videos, and audio to your entries. Up to 5 files per entry - preserve your memories in full color!</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">🔔</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Smart Notifications</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Get notified when your capsules are ready to unlock. Never miss a moment from your past!</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start; margin-bottom: 18px;">
                <span style="font-size: 28px; margin-right: 12px;">🔥</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Streak Tracking</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Build habits! Track your daily journaling streak and earn amazing badges for your dedication.</p>
                </div>
              </div>
              
              <div style="display: flex; align-items: start;">
                <span style="font-size: 28px; margin-right: 12px;">😊</span>
                <div>
                  <strong style="font-size: 17px; display: block; margin-bottom: 5px;">Mood Tracking</strong>
                  <p style="margin: 0; font-size: 14px; opacity: 0.95;">Track your emotional journey with 8 different moods. See patterns and celebrate growth!</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Start -->
          <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 20px;">🚀 Quick Start Guide</h3>
            <ol style="color: #555; line-height: 1.8; font-size: 15px; margin: 10px 0 10px 20px; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Create Your First Capsule:</strong> Click "Create" and write a message to your future self</li>
              <li style="margin-bottom: 10px;"><strong>Start Journaling:</strong> Visit "Daily Journal" to write your first entry</li>
              <li style="margin-bottom: 10px;"><strong>Explore Constellation:</strong> Watch your memories appear as stars in 3D space</li>
              <li><strong>Upload Memories:</strong> Add photos and videos to make it extra special!</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 18px 45px; 
                      text-decoration: none; 
                      border-radius: 30px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 18px;
                      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                      transition: all 0.3s ease;">
              🌟 Go to Dashboard
            </a>
          </div>

          <!-- Tips -->
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
              <strong style="font-size: 16px;">💡 Pro Tip:</strong><br>
              Create a capsule for each birthday, anniversary, or special occasion. Your future self will thank you! 🎂
            </p>
          </div>

          <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 30px 0;">
            Remember: Every moment is worth preserving. Whether it's a big milestone or a simple Tuesday afternoon, your memories matter. ❤️
          </p>
          
          <p style="color: #999; line-height: 1.6; font-size: 13px; text-align: center; margin-top: 35px;">
            Need help? We're here for you! Reply to this email anytime.<br>
            Follow us on social media for tips, inspiration, and updates! 🌈
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0 0 12px 0; font-size: 15px;">Made with ❤️ by the PastPort Team</p>
          <p style="margin: 0 0 15px 0; font-size: 13px; opacity: 0.8;">Preserving moments, connecting times</p>
          <div style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}" style="color: #fff; text-decoration: none; margin: 0 10px; opacity: 0.8;">Home</a>
            <span style="opacity: 0.5;">|</span>
            <a href="${process.env.FRONTEND_URL}/how-it-works" style="color: #fff; text-decoration: none; margin: 0 10px; opacity: 0.8;">How It Works</a>
            <span style="opacity: 0.5;">|</span>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #fff; text-decoration: none; margin: 0 10px; opacity: 0.8;">Dashboard</a>
          </div>
          <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">© 2024 PastPort. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Welcome to PastPort, ${userName}! 🌟

We're thrilled to have you on board! Your journey through time begins now.

✨ AMAZING FEATURES AWAIT YOU:

🎁 Time Capsules - Create digital time capsules and unlock them on future dates
📝 Daily Journal - Write daily entries and track your moods
🌌 Memory Constellation - See your memories as stars in stunning 3D space
📸 Media Attachments - Add photos, videos, and audio to your entries
🔔 Smart Notifications - Get notified when capsules are ready to unlock
🔥 Streak Tracking - Build habits and earn badges
😊 Mood Tracking - Track your emotional journey

🚀 QUICK START GUIDE:
1. Create Your First Capsule - Write a message to your future self
2. Start Journaling - Write your first daily entry
3. Explore Constellation - Watch your memories appear as stars
4. Upload Memories - Add photos and videos!

💡 Pro Tip: Create a capsule for each birthday, anniversary, or special occasion. Your future self will thank you!

Ready to begin? Visit your dashboard:
${process.env.FRONTEND_URL}/dashboard

Need help? Reply to this email anytime!

---
PastPort - Preserving moments, connecting times
© 2024 PastPort. All rights reserved.`
  }),

  unlockReminder: (userName, capsuleTitle, unlockDate) => ({
    subject: `🎉 "${capsuleTitle}" is Ready to Unlock!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <div style="font-size: 48px; margin-bottom: 10px;">🔓✨</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Your Time Capsule is Ready!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">The moment you've been waiting for has arrived</p>
        </div>
        
        <!-- Main content -->
        <div style="padding: 40px 30px; background: white;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hi ${userName}! 👋</h2>
          
          <!-- Capsule info card -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="color: white; font-size: 40px; text-align: center; margin-bottom: 15px;">🎁</div>
            <h3 style="color: white; margin: 0 0 10px 0; text-align: center; font-size: 22px;">"${capsuleTitle}"</h3>
            <p style="color: rgba(255,255,255,0.95); text-align: center; margin: 0; font-size: 16px;">
              Unlock Date: <strong>${new Date(unlockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 25px 0;">
            🌟 Great news! Your time capsule is now <strong style="color: #667eea;">ready to unlock</strong>. Your past self left something special for you, and now it's time to discover what memories, messages, or surprises await inside!
          </p>
          
          <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 25px 0;">
            💭 Take a moment to reflect on your journey since you created this capsule. What has changed? What stayed the same? Your past self had something important to share with you today.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 30px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 18px;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                      transition: all 0.3s ease;">
              🔓 Unlock Your Capsule Now
            </a>
          </div>
          
          <!-- Tips box -->
          <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
              <strong style="color: #667eea; font-size: 16px;">💡 Pro Tip:</strong><br>
              Find a quiet moment to unlock your capsule. Grab your favorite drink, get comfortable, and enjoy this journey through time. Your past self put thought into this moment!
            </p>
          </div>
          
          <p style="color: #999; line-height: 1.6; font-size: 13px; margin-top: 30px; text-align: center;">
            You can unlock your capsule anytime from your PastPort dashboard.<br>
            The memories you preserved are waiting for you! 🌈
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #2c3e50; color: white; padding: 25px 30px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0 0 10px 0; font-size: 14px;">Made with ❤️ by PastPort</p>
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">© 2024 PastPort. Preserving moments, connecting times.</p>
        </div>
      </div>
    `,
    text: `Hi ${userName}! 🎉\n\nYour time capsule "${capsuleTitle}" is ready to unlock!\n\nUnlock Date: ${new Date(unlockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nYour past self left something special for you. Take a moment to reflect on your journey since creating this capsule, then head to your PastPort dashboard to discover what awaits inside.\n\n🔓 Unlock now: ${process.env.FRONTEND_URL}/dashboard\n\nThe memories you preserved are waiting for you!\n\n---\nPastPort - Preserving moments, connecting times.`
  }),

};


export default { sendEmail, emailTemplates };
