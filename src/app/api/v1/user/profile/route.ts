import { connectDB } from "@/src/lib/mongoose";
import User from "@/src/models/User";
import UserActivity from "@/src/models/UserActivity";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET as string;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function buildProfileResponse(user: any) {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        avatarUrl: user.avatarUrl || null,
        preferredArea: user.preferredArea || "",
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
    };
}

/**
 * @openapi
 * /api/v1/user/profile:
 *   get:
 *     summary: Lấy thông tin hồ sơ cá nhân
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
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

        const user = await User.findById(auth.userId).select("-passwordHash");
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy người dùng",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: buildProfileResponse(user),
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

/**
 * @openapi
 * /api/v1/user/profile:
 *   patch:
 *     summary: Cập nhật hồ sơ cá nhân
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferredArea:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferredArea:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
export async function PATCH(req: Request) {
    const auth = getUserIdFromRequest(req);
    if ("response" in auth) return auth.response;

    try {
        await connectDB();

        const user = await User.findById(auth.userId).select("-passwordHash");
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy người dùng",
                },
                { status: 404 }
            );
        }

        const contentType = req.headers.get("content-type") || "";
        let payload: Record<string, unknown> = {};
        let avatarFile: File | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();

            payload.fullName = formData.get("fullName")?.toString();
            payload.email = formData.get("email")?.toString();
            payload.phone = formData.get("phone")?.toString();
            payload.preferredArea = formData.get("preferredArea")?.toString();
            payload.avatarUrl = formData.get("avatarUrl")?.toString();

            const avatar = formData.get("avatar");
            if (avatar instanceof File && avatar.size > 0) {
                avatarFile = avatar;
            }
        } else {
            payload = await req.json();
        }

        const updates: Record<string, string> = {};
        const infoFields: string[] = [];

        if (typeof payload.fullName === "string") {
            const value = payload.fullName.trim();
            if (!value) {
                return NextResponse.json(
                    { success: false, message: "Họ tên không hợp lệ" },
                    { status: 400 }
                );
            }
            updates.fullName = value;
            infoFields.push("fullName");
        }

        if (typeof payload.email === "string") {
            const value = payload.email.trim().toLowerCase();
            if (!value) {
                return NextResponse.json(
                    { success: false, message: "Email không hợp lệ" },
                    { status: 400 }
                );
            }
            updates.email = value;
            infoFields.push("email");
        }

        if (typeof payload.phone === "string") {
            const value = payload.phone.trim();
            if (!value) {
                return NextResponse.json(
                    { success: false, message: "Số điện thoại không hợp lệ" },
                    { status: 400 }
                );
            }
            updates.phone = value;
            infoFields.push("phone");
        }

        if (typeof payload.preferredArea === "string") {
            updates.preferredArea = payload.preferredArea.trim();
            infoFields.push("preferredArea");
        }

        if (typeof payload.avatarUrl === "string") {
            updates.avatarUrl = payload.avatarUrl.trim();
        }

        let updatedAvatar = false;

        if (avatarFile) {
            if (!ALLOWED_AVATAR_TYPES.has(avatarFile.type)) {
                return NextResponse.json(
                    { success: false, message: "Định dạng ảnh không hỗ trợ" },
                    { status: 400 }
                );
            }

            if (avatarFile.size > MAX_AVATAR_SIZE) {
                return NextResponse.json(
                    { success: false, message: "Ảnh vượt quá dung lượng cho phép" },
                    { status: 400 }
                );
            }

            const extFromType =
                avatarFile.type === "image/png"
                    ? ".png"
                    : avatarFile.type === "image/webp"
                    ? ".webp"
                    : ".jpg";
            const rawExt = path.extname(avatarFile.name || "");
            const safeExt = /^[.][a-zA-Z0-9]+$/.test(rawExt) ? rawExt.toLowerCase() : extFromType;

            const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
            await fs.mkdir(uploadDir, { recursive: true });

            const fileName = `${user._id}-${randomUUID()}${safeExt}`;
            const filePath = path.join(uploadDir, fileName);
            const buffer = Buffer.from(await avatarFile.arrayBuffer());

            await fs.writeFile(filePath, buffer);

            updates.avatarUrl = `/uploads/avatars/${fileName}`;
            updatedAvatar = true;
        } else if ("avatarUrl" in updates) {
            updatedAvatar = true;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, message: "Không có dữ liệu để cập nhật" },
                { status: 400 }
            );
        }

        const duplicateConditions = [] as Array<Record<string, string>>;
        if (updates.email) duplicateConditions.push({ email: updates.email });
        if (updates.phone) duplicateConditions.push({ phone: updates.phone });

        if (duplicateConditions.length > 0) {
            const existing = await User.findOne({
                _id: { $ne: user._id },
                $or: duplicateConditions,
            });

            if (existing) {
                return NextResponse.json(
                    { success: false, message: "Email hoặc số điện thoại đã tồn tại" },
                    { status: 400 }
                );
            }
        }

        user.set(updates);
        await user.save();

        const activityTasks: Array<Promise<any>> = [];
        if (updatedAvatar) {
            activityTasks.push(
                UserActivity.create({
                    userId: user._id,
                    title: "Cập nhật ảnh đại diện",
                })
            );
        }

        if (infoFields.length > 0) {
            activityTasks.push(
                UserActivity.create({
                    userId: user._id,
                    title: "Cập nhật thông tin tài khoản",
                    metadata: { fields: infoFields },
                })
            );
        }

        if (activityTasks.length > 0) {
            await Promise.all(activityTasks);
        }

        return NextResponse.json({
            success: true,
            message: "Cập nhật hồ sơ thành công",
            data: buildProfileResponse(user),
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Email hoặc số điện thoại đã tồn tại" },
                { status: 400 }
            );
        }

        if (error?.name === "ValidationError") {
            return NextResponse.json(
                { success: false, message: "Dữ liệu không hợp lệ", error: error.message },
                { status: 400 }
            );
        }

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
