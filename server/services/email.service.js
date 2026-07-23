const transporter = require('../config/nodemailer');

const sendForgotPasswordEmail = async (email, resetUrl) => {
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

const sendInviteMemberEmail = async (email, workspaceName, url) => {
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: `Invite to ${workspaceName}`,
    html: `
        <h2>Invite Member</h2>
        <p>You are invited to join the workspace.</p>
        <a href=${url}>
            Accept Invitation
        </a>
        `,
  });
};

module.exports = {
  sendForgotPasswordEmail,
  sendInviteMemberEmail,
};
