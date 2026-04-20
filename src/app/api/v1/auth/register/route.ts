import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/src/models/User";

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *               - role
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [nguoi_tim_tro, nguoi_cho_thue_tro]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { fullName, email, phone, password, role } = body;

        // 1. Validate input
        if (!fullName || !email || !phone || !password || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Thiếu thông tin bắt buộc",
                    data: null,
                },
                { status: 400 }
            );
        }

        // 2. Check duplicate user
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email hoặc số điện thoại đã tồn tại",
                    data: null,
                },
                { status: 400 }
            );
        }

        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Create user instance
        const user = new User({
            fullName,
            email,
            phone,
            passwordHash,
            role,
        });

        // 5. Validate schema
        await user.validate();

        // 6. Save DB
        await user.save();

        // 7. Response success
        return NextResponse.json(
            {
                success: true,
                message: "Đăng ký thành công",
                data: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    status: user.status,
                    createdAt: user.createdAt,
                },
            },
            { status: 201 }
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