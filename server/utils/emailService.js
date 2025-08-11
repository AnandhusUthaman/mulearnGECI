// Email service utility (placeholder for future email functionality)
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure email transporter (example with Gmail)
    // In production, use environment variables for email configuration
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.log('Email service not configured. Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html);
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@mulearn.org',
        to,
        subject,
        html,
        ...(text && { text })
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendContactFormNotification(contactData) {
    const subject = `New Contact Form Submission: ${contactData.subject}`;
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${contactData.name}</p>
      <p><strong>Email:</strong> ${contactData.email}</p>
      <p><strong>Subject:</strong> ${contactData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${contactData.message}</p>
      <p><strong>Submitted:</strong> ${new Date(contactData.createdAt).toLocaleString()}</p>
    `;

    return await this.sendEmail(
      process.env.ADMIN_EMAIL || 'admin@mulearn.org',
      subject,
      html
    );
  }

  async sendContactResponse(contactData, responseMessage) {
    const subject = `Re: ${contactData.subject}`;
    const html = `
      <h2>Response from µLearn Team</h2>
      <p>Dear ${contactData.name},</p>
      <p>Thank you for contacting µLearn. Here's our response to your inquiry:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        ${responseMessage}
      </div>
      <p>If you have any further questions, please don't hesitate to reach out.</p>
      <p>Best regards,<br>µLearn Team</p>
    `;

    return await this.sendEmail(contactData.email, subject, html);
  }
}

module.exports = new EmailService();