import crypto from "crypto";

export class MediaStorage {
  private static getCredentials() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new Error("Cấu hình CLOUDINARY_URL không tồn tại trong môi trường.");
    }

    try {
      const parsed = new URL(cloudinaryUrl);
      const apiKey = parsed.username;
      const apiSecret = parsed.password;
      const cloudName = parsed.hostname;

      if (!apiKey || !apiSecret || !cloudName) {
        throw new Error("Định dạng CLOUDINARY_URL không đúng.");
      }

      return { apiKey, apiSecret, cloudName };
    } catch (error) {
      throw new Error(`Lỗi phân tích CLOUDINARY_URL: ${error instanceof Error ? error.message : "Định dạng không hợp lệ"}`);
    }
  }

  private static generateSignature(
    paramsToSign: Record<string, string | number>,
    apiSecret: string
  ): string {
    const sortedKeys = Object.keys(paramsToSign).sort();
    const serialized = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

    const toHash = serialized + apiSecret;
    return crypto.createHash("sha1").update(toHash).digest("hex");
  }

  /**
   * Tải ảnh lên Cloudinary
   * @param base64Data Chuỗi base64 dạng "data:image/jpeg;base64,..."
   * @returns URL ảnh đã tải lên (secure_url)
   */
  public static async uploadImage(base64Data: string): Promise<string> {
    const { apiKey, apiSecret, cloudName } = this.getCredentials();

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "posts";

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = this.generateSignature(paramsToSign, apiSecret);

    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("folder", folder);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Tải ảnh lên Cloudinary thất bại.");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }
}
