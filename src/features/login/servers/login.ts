export type LoginPayload = {
    account: string;
    password: string;
};

export type LoginResponse = {
    success: boolean;
    message: string;
    data?: {
        token: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            role: string;
            isVerified: boolean;
            status: string;
        };
    };
};

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}