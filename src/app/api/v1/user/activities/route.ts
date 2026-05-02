import { connectDB } from "@/src/lib/mongoose";
import UserActivity from "@/src/models/UserActivity";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

function getCookieValue(cookieHeader: string, name: string) {
    const target = `${name}=`;
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(target))
        ?.slice(target.length);
}

function getUserIdFromRequest(req: Request) {
    if (!JWT_SECRET) {
        return {
            response: NextResponse.json(
                {
                    success: false,
                    message: "JWT_SECRET chưa được cấu hình",
                },
                { status: 500 }
            ),
        };
    }

    const cookie = req.headers.get("cookie") || "";
    const token = getCookieValue(cookie, "token");

    if (!token) {
        return {
            response: NextResponse.json(
                {
                    success: false,
                    message: "Chưa đăng nhập",
                },
                { status: 401 }
            ),
        };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };

        if (!decoded?.userId) {
            return {
                response: NextResponse.json(
                    {
                        success: false,
                        message: "Token không hợp lệ",
                    },
                    { status: 401 }
                ),
            };
        }

        return { userId: decoded.userId };
    } catch (error: any) {
        return {
            response: NextResponse.json(
                {
                    success: false,
                    message: "Token không hợp lệ hoặc đã hết hạn",
                    error: error.message,
                },
                { status: 401 }
            ),
        };
    }
}

/**
 * @openapi
 * /api/v1/user/activities:
 *   get:
 *     summary: Lấy lịch sử hoạt động gần đây
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 5
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lấy lịch sử thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
export async function GET(req: Request) {
    const auth = getUserIdFromRequest(req);
    if ("response" in auth) return auth.response;

    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = Math.min(Number(searchParams.get("limit") || 5) || 5, 50);
        const page = Math.max(Number(searchParams.get("page") || 1) || 1, 1);
        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            UserActivity.find({ userId: auth.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            UserActivity.countDocuments({ userId: auth.userId }),
        ]);

        return NextResponse.json({
            success: true,
            data: activities.map((activity) => ({
                id: activity._id,
                title: activity.title,
                createdAt: activity.createdAt,
                metadata: activity.metadata || null,
            })),
            pagination: {
                page,
                limit,
                total,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Lỗi server",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
