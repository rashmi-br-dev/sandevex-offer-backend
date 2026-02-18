// Simple email service for appointment confirmations using Nodemailer
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  message: string;
}

// Create transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendSimpleEmail = async ({ to, subject, message }: EmailData) => {
  try {
    console.log('📧 Sending appointment confirmation email:', { to, subject });
    console.log('📧 Email content:', message);
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@sandevex.com',
      to: to,
      subject: subject,
      html: message.replace(/\n/g, '<br>'), // Convert newlines to HTML
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Failed to send email:', errorMessage);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

export default { sendSimpleEmail };
