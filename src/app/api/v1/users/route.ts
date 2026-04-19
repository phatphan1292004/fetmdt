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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Tạo user mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    return Response.json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to create user",
        data: null,
      },
      { status: 500 }
    );
  }
}