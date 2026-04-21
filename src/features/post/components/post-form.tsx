"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createPostApi } from "../servers/create-post";

const PROPERTY_TYPES = [
	{ value: "nha_o", label: "Nhà ở" },
	{ value: "can_ho_chung_cu", label: "Căn hộ/Chung cư" },
	{ value: "phong_tro", label: "Phòng trọ" },
] as const;

const BASIC_FIELDS = [
	{ name: "area", label: "Diện tích đất", placeholder: "Diện tích đất (m2)", type: "number" },
	{ name: "bedrooms", label: "Số phòng ngủ", placeholder: "Số phòng ngủ", type: "number" },
	{ name: "bathrooms", label: "Số phòng vệ sinh", placeholder: "Số phòng vệ sinh", type: "number" },
	{ name: "width", label: "Chiều ngang", placeholder: "Chiều ngang (m)", type: "number" },
	{ name: "length", label: "Chiều dài", placeholder: "Chiều dài (m)", type: "number" },
	{ name: "floors", label: "Tổng số tầng", placeholder: "Tổng số tầng", type: "number" },
	{ name: "usableArea", label: "Diện tích sử dụng", placeholder: "Diện tích sử dụng (m2)", type: "number" },
	{ name: "interiorStatus", label: "Tình trạng nội thất", placeholder: "Ví dụ: Đầy đủ nội thất", type: "text" },
] as const;

type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];
type OwnerType = "ca_nhan" | "moi_gioi";

type Feedback = {
	type: "success" | "error";
	message: string;
};

function getOptionalString(formData: FormData, key: string): string | undefined {
	const value = formData.get(key);

	if (typeof value !== "string") {
		return undefined;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
	const value = formData.get(key);

	if (typeof value !== "string" || value.trim() === "") {
		return undefined;
	}

	const parsed = Number(value);

	if (!Number.isFinite(parsed) || parsed < 0) {
		return undefined;
	}

	return parsed;
}

export function PostForm() {
	const [propertyType, setPropertyType] = useState<PropertyType>("phong_tro");
	const [ownerType, setOwnerType] = useState<OwnerType>("ca_nhan");
	const [selectedImageNames, setSelectedImageNames] = useState<string[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<Feedback | null>(null);

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		setSelectedImageNames(files.map((file) => file.name));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		const address = getOptionalString(formData, "address") || "";
		const title = getOptionalString(formData, "title") || "";
		const description = getOptionalString(formData, "description") || "";
		const price = getOptionalNumber(formData, "price");
		const imageFiles = formData
			.getAll("images")
			.filter((item): item is File => item instanceof File && item.size > 0);

		if (!address) {
			setFeedback({ type: "error", message: "Vui lòng nhập địa chỉ cụ thể." });
			return;
		}

		if (!title) {
			setFeedback({ type: "error", message: "Vui lòng nhập tiêu đề tin đăng." });
			return;
		}

		if (!description) {
			setFeedback({ type: "error", message: "Vui lòng nhập mô tả tin đăng." });
			return;
		}

		if (price === undefined || price <= 0) {
			setFeedback({ type: "error", message: "Giá thuê phải lớn hơn 0." });
			return;
		}

		if (imageFiles.length === 0) {
			setFeedback({ type: "error", message: "Vui lòng tải lên ít nhất 1 ảnh." });
			return;
		}

		if (imageFiles.length > 10) {
			setFeedback({ type: "error", message: "Bạn chỉ có thể tải tối đa 10 ảnh." });
			return;
		}

		if (imageFiles.some((file) => !file.type.startsWith("image/"))) {
			setFeedback({ type: "error", message: "Chỉ chấp nhận tệp hình ảnh." });
			return;
		}

		if (imageFiles.some((file) => file.size > 5 * 1024 * 1024)) {
			setFeedback({ type: "error", message: "Mỗi ảnh phải nhỏ hơn hoặc bằng 5MB." });
			return;
		}

		formData.set("propertyType", propertyType);
		formData.set("listingType", "cho_thue");
		formData.set("ownerType", ownerType);

		try {
			setSubmitting(true);
			setFeedback(null);

			const response = await createPostApi(formData);

			setFeedback({
				type: "success",
				message: response.message || "Đăng tin thành công.",
			});

			form.reset();
			setPropertyType("phong_tro");
			setOwnerType("ca_nhan");
			setSelectedImageNames([]);
		} catch (error: unknown) {
			setFeedback({
				type: "error",
				message: error instanceof Error ? error.message : "Không thể đăng tin. Vui lòng thử lại.",
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(37,195,200,0.14),transparent_33%),radial-gradient(circle_at_98%_22%,rgba(4,90,132,0.14),transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef2f7_100%)] pb-28 pt-8 sm:pt-10">
			<form onSubmit={handleSubmit} noValidate>
				<div className="mx-auto w-full max-w-6xl px-3 pb-8 sm:px-4 lg:px-8">
					<section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-5">
						<h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">Đăng tin cho thuê trọ</h1>
						<p className="mt-1 text-sm text-slate-600 sm:text-base">
							Điền đầy đủ thông tin để tin đăng được duyệt nhanh và tiếp cận đúng khách thuê.
						</p>
					</section>

					<section className="space-y-4">
						<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
							<label className="mb-3 block text-lg font-bold text-slate-900">Loại bất động sản *</label>
							<div className="flex flex-wrap gap-2.5">
								{PROPERTY_TYPES.map((type) => (
									<button
										key={type.value}
										type="button"
										onClick={() => setPropertyType(type.value)}
										className={`inline-flex items-center rounded-full border px-4 py-2 text-[17px] font-semibold transition ${
											propertyType === type.value
												? "border-slate-900 bg-slate-900 text-white"
												: "border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300"
										}`}
									>
										{type.label}
									</button>
								))}
							</div>

							<div className="mt-5 border-t border-slate-200 pt-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<p className="text-[17px] font-semibold text-slate-700 sm:text-lg">Tôi muốn *</p>
									<div className="inline-flex rounded-full bg-slate-100 p-1.5">
										<button type="button" className="rounded-full bg-slate-900 px-5 py-1.5 text-[17px] font-semibold text-white">
											Cho thuê
										</button>
									</div>
								</div>
							</div>
						</article>

						<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
							<h2 className="mb-4 text-lg font-bold text-slate-900">Vị trí bất động sản</h2>

							<div className="space-y-4">
								<div>
									<label htmlFor="projectName" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Tên tòa nhà/khu dân cư/dự án
									</label>
									<input
										id="projectName"
										name="projectName"
										type="text"
										placeholder="Tên tòa nhà/khu dân cư/dự án"
										className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									/>
									<p className="mt-2 text-sm text-slate-600">
										Không tìm thấy dự án?{" "}
										<button type="button" className="font-semibold text-slate-900 underline underline-offset-2">
											Yêu cầu thêm dự án
										</button>
									</p>
								</div>

								<div>
									<label htmlFor="address" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Địa chỉ cụ thể *
									</label>
									<input
										id="address"
										name="address"
										type="text"
										required
										placeholder="Ví dụ: Số 20 ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội"
										className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[17px] text-slate-700 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									/>
								</div>

								<label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-[15px] text-slate-700">
									Hiển thị mã căn trên tin đăng
									<input type="checkbox" name="showRoomCode" className="h-5 w-5 rounded border-slate-300" />
								</label>
							</div>
						</article>

						<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
							<h2 className="mb-4 text-lg font-bold text-slate-900">Đặc điểm bất động sản</h2>
							<div className="grid gap-3 sm:grid-cols-2">
								{BASIC_FIELDS.map((field) => (
									<div key={field.name}>
										<label htmlFor={field.name} className="mb-1.5 block text-[15px] font-semibold text-slate-700">
											{field.label}
										</label>
										<input
											id={field.name}
											name={field.name}
											type={field.type}
											placeholder={field.placeholder}
											min={field.type === "number" ? 0 : undefined}
											step={field.type === "number" ? "any" : undefined}
											className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
										/>
									</div>
								))}

								<div className="sm:col-span-2">
									<label htmlFor="feature" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Đặc điểm
									</label>
									<div className="relative">
										<select
											id="feature"
											name="feature"
											defaultValue=""
											className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-[17px] text-slate-500 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
										>
											<option value="" disabled>
												Chọn đặc điểm
											</option>
											<option value="near-school">Gần trường học</option>
											<option value="near-market">Gần chợ/bệnh viện</option>
											<option value="quiet">Khu vực yên tĩnh</option>
										</select>
										<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-500">
											<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
												<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</span>
									</div>
								</div>
							</div>
						</article>

						<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5">
							<h2 className="mb-4 text-lg font-bold text-slate-900">Nội dung tin đăng</h2>

							<div className="space-y-4">
								<div>
									<label htmlFor="images" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Hình ảnh *
									</label>
									<label
										htmlFor="images"
										className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#f59e0b] bg-[#fff8db] px-4 text-center text-slate-700 transition hover:bg-[#fff3c4]"
									>
										<span className="text-lg font-bold">Chọn ảnh từ máy</span>
										<span className="mt-1 text-sm text-slate-600">PNG, JPG, WEBP - tối đa 10 ảnh, mỗi ảnh không quá 5MB</span>
									</label>
									<input
										id="images"
										name="images"
										type="file"
										accept="image/*"
										multiple
										onChange={handleImageChange}
										className="sr-only"
									/>
									{selectedImageNames.length ? (
										<p className="mt-2 text-sm text-slate-600">Đã chọn {selectedImageNames.length} ảnh: {selectedImageNames.join(", ")}</p>
									) : (
										<p className="mt-2 text-sm text-slate-500">Chưa có ảnh nào được chọn.</p>
									)}
								</div>

								<div>
									<label htmlFor="title" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Tiêu đề tin đăng *
									</label>
									<input
										id="title"
										name="title"
										type="text"
										maxLength={70}
										placeholder="Tiêu đề tin đăng"
										className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									/>
									<p className="mt-2 text-sm text-slate-500">Tối đa 70 ký tự</p>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<div>
										<label htmlFor="price" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
											Giá thuê *
										</label>
										<div className="relative">
											<input
												id="price"
												name="price"
												type="number"
												min={0}
												step="1000"
												placeholder="Giá thuê"
												className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-9 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
											/>
											<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[20px] text-slate-500">
												₫
											</span>
										</div>
									</div>

									<div>
										<label htmlFor="deposit" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
											Số tiền cọc
										</label>
										<div className="relative">
											<input
												id="deposit"
												name="deposit"
												type="number"
												min={0}
												step="1000"
												placeholder="Số tiền cọc"
												className="h-12 w-full rounded-xl border border-slate-300 px-4 pr-9 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
											/>
											<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[20px] text-slate-500">
												₫
											</span>
										</div>
									</div>
								</div>

								<div>
									<label htmlFor="description" className="mb-1.5 block text-[15px] font-semibold text-slate-700">
										Mô tả *
									</label>
									<textarea
										id="description"
										name="description"
										rows={8}
										maxLength={1500}
										placeholder="Mô tả ưu điểm phòng, nội thất, giao thông và quy định thuê"
										className="w-full rounded-xl border border-slate-300 px-4 py-3 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
									/>
									<p className="mt-2 text-sm text-slate-500">Tối đa 1500 ký tự</p>
								</div>

								<div>
									<label className="mb-2 block text-[15px] font-semibold text-slate-700">Bạn là *</label>
									<div className="inline-flex rounded-full bg-slate-100 p-1.5">
										<button
											type="button"
											onClick={() => setOwnerType("ca_nhan")}
											className={`rounded-full px-5 py-1.5 text-[17px] font-semibold transition ${
												ownerType === "ca_nhan" ? "bg-slate-900 text-white" : "text-slate-700"
											}`}
										>
											Cá nhân
										</button>
										<button
											type="button"
											onClick={() => setOwnerType("moi_gioi")}
											className={`rounded-full px-5 py-1.5 text-[17px] font-semibold transition ${
												ownerType === "moi_gioi" ? "bg-slate-900 text-white" : "text-slate-700"
											}`}
										>
											Môi giới
										</button>
									</div>
								</div>
							</div>
						</article>

						{feedback ? (
							<div
								className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
									feedback.type === "success"
										? "border-emerald-200 bg-emerald-50 text-emerald-700"
										: "border-rose-200 bg-rose-50 text-rose-700"
								}`}
							>
								{feedback.message}
							</div>
						) : null}
					</section>
				</div>

				<div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
					<div className="mx-auto flex w-full max-w-6xl items-center gap-3">
						<button
							type="button"
							disabled={submitting}
							className="h-12 flex-1 rounded-xl border border-slate-300 bg-slate-100 text-lg font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
						>
							Xem trước
						</button>
						<button
							type="submit"
							disabled={submitting}
							className="h-12 flex-1 rounded-xl bg-[#f7cd00] text-lg font-bold text-slate-900 shadow-[0_8px_20px_rgba(247,205,0,0.34)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{submitting ? "Đang đăng tin..." : "Đăng tin"}
						</button>
					</div>
				</div>
			</form>
		</main>
	);
}
