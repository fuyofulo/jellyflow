const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const mailOptions = {
  from: {
    name: "zaid Khan",
    address: process.env.EMAIL,
  },
  to: "fuyofulo@gmail.com",
  subject: "Test Email",
  text: "This is a test email",
  html: "<p>This is a test email</p>",
};

const sendEmail = async () => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

sendEmail();
