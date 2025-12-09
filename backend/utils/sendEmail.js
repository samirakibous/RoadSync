import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,    
  port: process.env.MAIL_PORT, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"RoadSync" <no-reply@roadsync.com>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
