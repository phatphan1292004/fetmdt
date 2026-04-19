import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Đăng xuất tài khoản
 *     tags:
 *       - Auth
 *     description: Xóa JWT token khỏi HttpOnly cookie để đăng xuất người dùng
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đăng xuất thành công
 *       500:
 *         description: Lỗi server
 */
export async function POST() {
    const response = NextResponse.json(
        {
            success: true,
            message: "Đăng xuất thành công",
        },
        { status: 200 }
    );

    response.cookies.set({
        name: "token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return response;
}
