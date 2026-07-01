import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";
import UserActivity from "@/src/models/UserActivity";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Thiếu thông tin bắt buộc",
                    data: null,
                },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Mật khẩu mới phải có tối thiểu 6 ký tự",
                    data: null,
                },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tài khoản không tồn tại trên hệ thống",
                    data: null,
                },
                { status: 404 }
            );
        }

        const secret = JWT_SECRET + user.passwordHash;
        try {
            jwt.verify(token, secret);
        } catch (err: any) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ",
                    data: null,
                },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = passwordHash;
        await user.save();

        try {
            const userAgent = req.headers.get("user-agent") || "";
            const forwardedFor = req.headers.get("x-forwarded-for");
            const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;

            await UserActivity.create({
                userId: user._id,
                title: "Thay đổi mật khẩu (Quên mật khẩu)",
                metadata: {
                    userAgent,
                    ip,
                },
            });
        } catch { }

        return NextResponse.json(
            {
                success: true,
                message: "Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại.",
                data: null,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Lỗi server",
                data: null,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
