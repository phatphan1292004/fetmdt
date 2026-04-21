import "dotenv/config";
import { connectDB } from "@/src/lib/mongoose";
import { signToken, verifyToken } from "@/src/lib/jwt";
import bcrypt from "bcryptjs";
import User from "@/src/models/User";

export function getToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return auth.split(" ")[1];
}

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Lấy danh sách user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 */

export async function GET(req: Request) {
  const token = getToken(req);

  if (!token) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
        data: null,
      },
      { status: 401 }
    );
  }

  const isDev = token === process.env.DEV_TOKEN;
  const user = isDev ? { role: "dev" } : verifyToken(token);

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Invalid token",
        data: null,
      },
      { status: 401 }
    );
  }

  await connectDB();

  const users = await User.find();

  return Response.json({
    success: true,
    message: "Get users successfully",
    data: users,
  });
}