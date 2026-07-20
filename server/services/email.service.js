import transporter from '../config/nodemailer.js';

export const sendForgotPasswordEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Reset Password',
    html: `
        <h2>Forgot Password</h2>
        <p>You requested to reset your password.</p>
        <a href=${resetUrl}>
            Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        `,
  });
};
