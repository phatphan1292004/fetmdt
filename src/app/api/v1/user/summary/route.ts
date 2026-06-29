import { connectDB } from "@/src/lib/mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/src/models/User";
import Post from "@/src/models/Post";
import UserSavedPost from "@/src/models/UserSavedPost";

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
 * /api/v1/user/summary:
 *   get:
 *     summary: Lấy thống kê hồ sơ người dùng
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
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

        const user = await User.findById(auth.userId).select(
            "followerCount followingCount walletBalance responseRate"
        );

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy người dùng",
                },
                { status: 404 }
            );
        }

        const [activePosts, savedPosts] = await Promise.all([
            Post.countDocuments({ ownerId: user._id, status: "published" }),
            UserSavedPost.countDocuments({ userId: user._id }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                followersCount: user.followerCount || 0,
                followingCount: user.followingCount || 0,
                walletBalance: user.walletBalance || 0,
                stats: {
                    activePosts,
                    savedPosts,
                    views7Days: 0,
                    responseRate: user.responseRate || 0,
                },
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
