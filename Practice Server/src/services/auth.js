import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/index.js";
import { assert, publicUser } from "../utils/errors.js";
import { makeOtp, hashOtp } from "../utils/otp.js";
export function authService({ config, email, clock = () => new Date() }) {
  const token = (user) =>
    jwt.sign({ ver: user.tokenVersion }, config.jwtSecret, {
      subject: user.id,
      algorithm: "HS256",
      issuer: "Ahmed-marketplace",
      audience: "marketplace-client",
      expiresIn: "1d",
    });
  return {
    async signup({ name, email: address, password }) {
      const code = makeOtp();
      const now = clock();
      try {
        const user = await User.create({
          name,
          email: address,
          password: await bcrypt.hash(password, 12),
          otpHash: hashOtp(address, code, config.otpSecret),
          otpExpires: new Date(+now + 600000),
          otpSent: now,
        });

        await email.send(address, code);
        return publicUser(user);
      } catch (error) {
        throw error;
      }
    },
    async resend({ email: address }) {
      const now = clock();
      const code = makeOtp();
      const user = await User.findOneAndUpdate(
        {
          email: address,
          verified: false,
          active: true,
          otpSent: { $lte: new Date(+now - 60000) },
        },
        {
          $set: {
            otpHash: hashOtp(address, code, config.otpSecret),
            otpExpires: new Date(+now + 600000),
            otpSent: now,
            otpAttempts: 0,
          },
        },
        { new: true },
      );
      assert(user, 429, "Cannot resend yet; wait 60 seconds or check account");
      await email.send(address, code);
      return { message: "Code sent" };
    },
    async verify({ email: address, code }) {
      const now = clock();
      const user = await User.findOneAndUpdate(
        {
          email: address,
          verified: false,
          active: true,
          otpExpires: { $gt: now },
          otpAttempts: { $lt: 5 },
          otpHash: hashOtp(address, code, config.otpSecret),
        },
        { $set: { verified: true }, $unset: { otpHash: 1, otpExpires: 1 } },
        { new: true },
      );
      if (!user) {
        await User.updateOne(
          {
            email: address,
            verified: false,
            otpExpires: { $gt: now },
            otpAttempts: { $lt: 5 },
          },
          { $inc: { otpAttempts: 1 } },
        );
        assert(false, 400, "Invalid, expired or already used code");
      }
      return { user: publicUser(user) };
    },
    async login({ email: address, password }) {
      const user = await User.findOne({ email: address }).select("+password");
      assert(
        user && (await bcrypt.compare(password, user.password)),
        401,
        "Invalid credentials",
      );
      assert(
        user.active && user.verified,
        403,
        "Account must be active and verified",
      );
      const now = clock();
      const code = makeOtp();

      user.loginOtpHash = hashOtp(address, code, config.otpSecret);
      user.loginOtpExpires = new Date(+now + 600000);
      user.loginOtpAttempts = 0;
      user.loginOtpSent = now;

      await user.save();

      await email.send(address, code, "login");
      return { message: "Login OTP sent to your email" };
    },

    async verifyLoginOtp({ email: address, code }) {
      const now = clock();

      const user = await User.findOneAndUpdate(
        {
          email: address,
          active: true,
          verified: true,
          loginOtpHash: hashOtp(address, code, config.otpSecret),
          loginOtpExpires: { $gt: now },
          loginOtpAttempts: { $lt: 5 },
        },
        {
          $unset: {
            loginOtpHash: 1,
            loginOtpExpires: 1,
            loginOtpSent: 1,
          },
          $set: {
            loginOtpAttempts: 0,
          },
        },
        { new: true },
      );

      if (!user) {
        await User.updateOne(
          {
            email: address,
            loginOtpExpires: { $gt: now },
            loginOtpAttempts: { $lt: 5 },
          },
          { $inc: { loginOtpAttempts: 1 } },
        );

        assert(false, 400, "Invalid, expired or already used login code");
      }

      return {
        token: token(user),
        user: publicUser(user),
      };
    },

    async forgotPassword({ email: address }) {
      const user = await User.findOne({
        email: address,
        active: true,
        verified: true,
      });

      // Same response whether account exists or not.
      if (!user) {
        return {
          message: "If the account exists, a reset code has been sent",
        };
      }

      const now = clock();
      const code = makeOtp();

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            resetOtpHash: hashOtp(address, code, config.otpSecret),
            resetOtpExpires: new Date(+now + 600000),
            resetOtpAttempts: 0,
            resetOtpSent: now,
          },
        },
      );

      await email.send(address, code, "reset");

      return {
        message: "If the account exists, a reset code has been sent",
      };
    },

    
    async resetPassword({ email: address, code, newPassword }) {
      const now = clock();

      const user = await User.findOneAndUpdate(
        {
          email: address,
          active: true,
          verified: true,
          resetOtpHash: hashOtp(address, code, config.otpSecret),
          resetOtpExpires: { $gt: now },
          resetOtpAttempts: { $lt: 5 },
        },
        {
          $set: {
            password: await bcrypt.hash(newPassword, 12),
          },
          $inc: {
            tokenVersion: 1,
          },
          $unset: {
            resetOtpHash: 1,
            resetOtpExpires: 1,
            resetOtpSent: 1,
          },
        },
        { new: true },
      );

      if (!user) {
        await User.updateOne(
          {
            email: address,
            resetOtpExpires: { $gt: now },
            resetOtpAttempts: { $lt: 5 },
          },
          { $inc: { resetOtpAttempts: 1 } },
        );

        assert(false, 400, "Invalid, expired or already used reset code");
      }

      return {
        message: "Password reset successfully",
      };
    },
  };
}
