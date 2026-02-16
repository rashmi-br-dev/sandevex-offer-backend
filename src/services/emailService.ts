import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

export const sendEmail = async ({ to, subject, html }: EmailData) => {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Sandevex Hiring" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to send email:', errorMessage);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

export default { sendEmail };
