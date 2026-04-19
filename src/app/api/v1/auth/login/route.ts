import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
    try {
        await connectDB();

        const { account, password } = await req.json();

        // 1. Validate input
        if (!account || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sai tài khoản hoặc mật khẩu",
                    data: null,
                },
                { status: 400 }
            );
        }

        // 2. Find user
        const user = await User.findOne({
            $or: [{ email: account }, { phone: account }],
        }).select("+passwordHash");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sai tài khoản hoặc mật khẩu",
                    data: null,
                },
                { status: 400 }
            );
        }

        if (!user.isVerified || user.status == "pending") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tài khoản chưa xác thực",
                    data: null,
                },
                { status: 400 }
            );
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Sai tài khoản hoặc mật khẩu",
                    data: null,
                },
                { status: 400 }
            );
        }

        // 4. Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Đăng nhập thành công",
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    status: user.status,
                },
            },
            { status: 200 }
        );

        // 6. Set HttpOnly Cookie
        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 ngày
        });

        return response;
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