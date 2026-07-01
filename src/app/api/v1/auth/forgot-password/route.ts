import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";
import { sendResetPasswordEmail } from "@/src/lib/mail";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
    try {
        await connectDB();

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập địa chỉ email",
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
                    message: "Email không tồn tại trên hệ thống",
                    data: null,
                },
                { status: 404 }
            );
        }

        const secret = JWT_SECRET + user.passwordHash;
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            secret,
            { expiresIn: "15m" }
        );

        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
        const proto = req.headers.get("x-forwarded-proto") || "http";
        const origin = `${proto}://${host}`;
        const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        const emailResult = await sendResetPasswordEmail(user.email, resetLink);

        return NextResponse.json(
            {
                success: true,
                message: "Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email của bạn.",
                data: process.env.NODE_ENV === "development" ? { resetLink } : null,
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
