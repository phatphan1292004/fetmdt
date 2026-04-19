import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags:
 *       - Auth
 *     description: |
 *       Lấy thông tin user từ JWT token được lưu trong HttpOnly cookie.
 *       API này dùng để kiểm tra trạng thái đăng nhập.
 *     responses:
 *       200:
 *         description: Lấy thông tin user thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     status:
 *                       type: string
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       500:
 *         description: Lỗi server
 */

export async function GET(req: Request) {
    try {
        await connectDB();

        // 1. Lấy cookie
        const cookie = req.headers.get("cookie") || "";
        const token = cookie
            .split("; ")
            .find((c) => c.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Chưa đăng nhập",
                },
                { status: 401 }
            );
        }

        // 2. Verify token
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // 3. Lấy user
        const user = await User.findById(decoded.userId).select("-passwordHash");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy người dùng",
                },
                { status: 404 }
            );
        }

        // 4. Trả về user
        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                status: user.status,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Token không hợp lệ hoặc đã hết hạn",
                error: error.message,
            },
            { status: 401 }
        );
    }
}