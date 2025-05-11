import nodemailer from "nodemailer";
import { COMPANY_EMAIL, COMPANY_EMAIL_PASSWORD } from "./constants.js";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // host is just the mailing service provider that you want to use
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: COMPANY_EMAIL,
      pass: COMPANY_EMAIL_PASSWORD, // app specific password
    },
});