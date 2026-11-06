import nodemailer from "nodemailer";

export function adapters(env = process.env) {
  const smtp = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_PORT === "465",
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
      : {}),
  });

  return {
    email: {
      send: (to, code, purpose = "verify") => {
        const templates = {
          verify: {
            subject: "Verify your marketplace account",
            text: `Your verification code is ${code}. It expires in 10 minutes.`,
          },
          login: {
            subject: "Your marketplace login OTP",
            text: `Your login code is ${code}. It expires in 10 minutes.`,
          },
          reset: {
            subject: "Reset your marketplace password",
            text: `Your password reset code is ${code}. It expires in 10 minutes.`,
          },
        };

        const template = templates[purpose];

        if (!template) {
          throw new Error("Invalid email purpose");
        }

        return smtp.sendMail({
          from: env.MAIL_FROM,
          to,
          subject: template.subject,
          text: template.text,
        });
      },
    },
  };
}
