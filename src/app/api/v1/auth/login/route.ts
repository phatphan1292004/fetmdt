import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account
 *               - password
 *             properties:
 *               account:
 *                 type: string
 *                 description: Email hoặc số điện thoại
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { account, password } = body;

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

        // 4. Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Response success
        return NextResponse.json(
            {
                success: true,
                message: "Đăng nhập thành công",
                data: {
                    token,
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        isVerified: user.isVerified,
                        status: user.status,
                    },
                },
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