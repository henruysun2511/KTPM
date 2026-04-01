const templateSendEmailForResetPassword = (otp: string) => `
      <h3>Lấy lại mật khẩu:</h3>
      <strong> Mã otp của bạn là: ${otp} (Mã otp chỉ có hiệu lực trong 3 phút)</strong>
      `;
export { templateSendEmailForResetPassword };
