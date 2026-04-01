import { Injectable } from '@nestjs/common';
import { templateSendEmailForResetPassword } from 'common/templates/email.template';
import { env } from 'configs';
import transporter from 'configs/sendEmail.config';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';

@Injectable()
export class EmailService {
  constructor(private readonly logger: CustomLogger) {}
  sendEmailForResetPassword = async (otpData: { otp: string; email: string }) => {
    try {
      const mailOptions = {
        from: env.EMAIL_USER,
        to: otpData.email,
        subject: 'Thông báo: Mã otp lấy lại mật khẩu đăng nhập',
        html: templateSendEmailForResetPassword(otpData.otp)
      };
      await transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email xác nhận đã gửi tới ${otpData.email}`);
    } catch (error) {
      // preserve original error stack for debugging and log the recipient
      if (error instanceof Error) {
        this.logger.error(`Failed to send email to ${otpData.email}: ${error.message}`, error, EmailService.name);
        throw error; // rethrow original error to keep stack/context
      } else {
        const errStr = JSON.stringify(error);
        this.logger.error(`Failed to send email to ${otpData.email}: ${errStr}`);
        throw new Error(`Failed to send email: ${errStr}`);
      }
    }
  };
}
