import nodemailer from 'nodemailer';

import { env } from './env.config';
const { EMAIL_USER, EMAIL_PASS } = env;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});
export default transporter;
