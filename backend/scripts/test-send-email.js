import dotenv from 'dotenv';
import { sendEmail, isEmailConfigured } from '../utils/email.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

(async () => {
  console.log('SMTP configured?', isEmailConfigured());
  try {
    const res = await sendEmail({
      to: process.env.TEST_SEND_TO || 'your-email@example.com',
      subject: 'Test: Founders Connect branded email',
      html: '<p>Hello — this is a test email from Founders Connect. If you see the logo above, branding works.</p>',
      requireConfigured: false,
    });
    console.log('send result:', res);
  } catch (err) {
    console.error('send failed:', err);
    process.exit(1);
  }
})();
