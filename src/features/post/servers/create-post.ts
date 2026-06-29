export type CreatePostResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: "draft" | "pending" | "published" | "rejected" | "hidden";
    createdAt: string;
  };
};

export async function createPostApi(
  payload: FormData
): Promise<CreatePostResponse> {
  const response = await fetch("/api/v1/posts", {
    method: "POST",
    body: payload,
  });

  const data = (await response.json()) as CreatePostResponse;

  if (!response.ok) {
    throw new Error(data.message || "Đăng tin thất bại");
  }

  return data;
}