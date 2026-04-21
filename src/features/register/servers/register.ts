export type RegisterPayload = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: "nguoi_tim_tro" | "nguoi_cho_thue_tro";
};

export type RegisterResponse = {
    success: boolean;
    message: string;
    data?: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: string;
        isVerified: boolean;
        status: string;
        createdAt: string;
    };
};

export async function registerApi(payload: RegisterPayload): Promise<RegisterResponse> {
    const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        // đảm bảo luôn throw lỗi rõ ràng
        throw new Error(data.message || "Đăng ký thất bại");
    }

    return data;
}