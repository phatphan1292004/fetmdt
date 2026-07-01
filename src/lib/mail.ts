import nodemailer from "nodemailer";

interface SendEmailResult {
  success: boolean;
  message?: string;
  error?: any;
}

export async function sendResetPasswordEmail(
  email: string,
  resetLink: string
): Promise<SendEmailResult> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <title>Khôi phục mật khẩu - Stayvia</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
        body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          background-color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        a { text-decoration: none; }
      </style>
    </head>
    <body style="background-color: #f1f5f9; padding: 20px 0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" bgcolor="#f1f5f9">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <!-- HEADER -->
              <tr>
                <td align="center" bgcolor="#0b7ea9" style="padding: 40px 20px; background: linear-gradient(135deg, #045a84 0%, #0b7ea9 50%, #25c3c8 100%);">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;">Stayvia</h1>
                  <p style="margin: 5px 0 0 0; color: #e0f2fe; font-size: 14px;">Tìm phòng trọ thông minh & nhanh chóng</p>
                </td>
              </tr>
              <!-- BODY -->
              <tr>
                <td align="left" style="padding: 40px 30px; color: #334155;">
                  <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Yêu cầu đặt lại mật khẩu</h2>
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #475569;">
                    Xin chào,<br/><br/>
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Stayvia liên kết với email này. Hãy nhấn vào nút bên dưới để tiến hành đặt mật khẩu mới. Liên kết này sẽ hết hạn sau <strong>15 phút</strong>.
                  </p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 10px 0 20px 0;">
                        <a href="${resetLink}" target="_blank" style="background: linear-gradient(92deg, #045a84 0%, #25c3c8 100%); color: #ffffff; display: inline-block; padding: 14px 30px; font-size: 16px; font-weight: 700; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(6, 98, 133, 0.3); text-align: center;">Đặt lại mật khẩu</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                    Nếu bạn không yêu cầu thay đổi này, bạn có thể bỏ qua email này một cách an toàn. Mật khẩu của bạn sẽ không thay đổi trừ khi bạn click vào liên kết trên và tạo mật khẩu mới.
                  </p>
                </td>
              </tr>
              <!-- FOOTER -->
              <tr>
                <td align="center" style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
                  <p style="margin: 0 0 10px 0;">Email này được gửi tự động từ hệ thống Stayvia.</p>
                  <p style="margin: 0;">&copy; 2026 Stayvia. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Fallback logs to console if credentials are missing
  if (!host || !user || !pass) {
    console.log("\n" + "=".repeat(80));
    console.log(" [SMTP MOCK] SMTP CONFIGURATION IS MISSING. FALLBACK TO CONSOLE LOG:");
    console.log(` TO: ${email}`);
    console.log(` LINK: ${resetLink}`);
    console.log("=".repeat(80) + "\n");
    return { success: true, message: "SMTP credentials missing. Mocked email to console." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: false, // TLS
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || "Stayvia"}" <${process.env.SMTP_FROM_EMAIL || user}>`,
      to: email,
      subject: "Khôi phục mật khẩu - Stayvia",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send reset email via SMTP:", error);
    // Even if SMTP fails, print to console as fallback in dev
    console.log("\n" + "=".repeat(80));
    console.log(" [SMTP FALLBACK] SMTP SEND FAILED. LINK FOR DEV:");
    console.log(` TO: ${email}`);
    console.log(` LINK: ${resetLink}`);
    console.log("=".repeat(80) + "\n");
    return { success: true, message: "SMTP failed. Mocked email to console.", error };
  }
}
