"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { createPostApi } from "../servers/create-post";

const PROPERTY_TYPES = [
	{ value: "nha_o", label: "Nhà ở" },
	{ value: "can_ho_chung_cu", label: "Căn hộ/Chung cư" },
	{ value: "phong_tro", label: "Phòng trọ" },
] as const;

type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];
type OwnerType = "ca_nhan" | "moi_gioi";
type FieldName =
	| "usableArea"
	| "area"
	| "maxOccupants"
	| "bedrooms"
	| "bathrooms"
	| "floors"
	| "frontage"
	| "alleyWidth"
	| "houseDirection"
	| "legalStatus"
	| "apartmentFloor"
	| "buildingFloors"
	| "hasBalcony"
	| "balconyDirection"
	| "managementFee"
	| "hasLoft"
	| "hasPrivateWc"
	| "curfewFree"
	| "hasAirConditioner"
	| "hasFridge"
	| "hasWashingMachine"
	| "utilityPricing"
	| "hasParking"
	| "interiorStatus";

type FieldType = "number" | "text" | "boolean";

type FieldConfig = {
	name: FieldName;
	label: string;
	placeholder?: string;
	type: FieldType;
	step?: string;
	required?: boolean;
	helperText?: string;
};

type RequiredField = {
	name: FieldName;
	label: string;
	type: FieldType;
};

const FIELD_CONFIGS: Record<FieldName, FieldConfig> = {
	area: {
		name: "area",
		label: "Diện tích",
		placeholder: "Diện tích (m2)",
		type: "number",
		step: "any",
		required: true,
	},
	maxOccupants: {
		name: "maxOccupants",
		label: "Số người tối đa",
		placeholder: "Ví dụ: 2",
		type: "number",
		step: "1",
		required: true,
	},
	usableArea: {
		name: "usableArea",
		label: "Diện tích sử dụng",
		placeholder: "Diện tích sử dụng (m2)",
		type: "number",
		step: "any",
		required: true,
	},
	bedrooms: {
		name: "bedrooms",
		label: "Số phòng ngủ",
		placeholder: "Số phòng ngủ",
		type: "number",
		step: "1",
		required: true,
	},
	bathrooms: {
		name: "bathrooms",
		label: "Số phòng vệ sinh",
		placeholder: "Số phòng vệ sinh",
		type: "number",
		step: "1",
		required: true,
	},
	floors: {
		name: "floors",
		label: "Số tầng",
		placeholder: "Số tầng",
		type: "number",
		step: "1",
		required: true,
	},
	frontage: {
		name: "frontage",
		label: "Mặt tiền",
		placeholder: "Mặt tiền (m)",
		type: "number",
		step: "any",
		required: true,
	},
	alleyWidth: {
		name: "alleyWidth",
		label: "Đường vào",
		placeholder: "Độ rộng đường vào (m)",
		type: "number",
		step: "any",
		required: true,
	},
	houseDirection: {
		name: "houseDirection",
		label: "Hướng nhà",
		placeholder: "Ví dụ: Đông Nam",
		type: "text",
		required: true,
	},
	legalStatus: {
		name: "legalStatus",
		label: "Pháp lý",
		placeholder: "Ví dụ: Sổ hồng riêng",
		type: "text",
	},
	apartmentFloor: {
		name: "apartmentFloor",
		label: "Tầng căn hộ",
		placeholder: "Ví dụ: 12",
		type: "number",
		step: "1",
		required: true,
	},
	buildingFloors: {
		name: "buildingFloors",
		label: "Tổng số tầng của tòa",
		placeholder: "Ví dụ: 35",
		type: "number",
		step: "1",
		required: true,
	},
	hasBalcony: {
		name: "hasBalcony",
		label: "Ban công",
		type: "boolean",
		required: true,
	},
	balconyDirection: {
		name: "balconyDirection",
		label: "Hướng ban công",
		placeholder: "Ví dụ: Tây Bắc",
		type: "text",
		helperText: "Bắt buộc khi căn hộ có ban công",
	},
	managementFee: {
		name: "managementFee",
		label: "Phí quản lý",
		placeholder: "Ví dụ: 15000 (đ/m2)",
		type: "number",
		step: "1000",
	},
	hasLoft: {
		name: "hasLoft",
		label: "Có gác",
		type: "boolean",
		required: true,
	},
	hasPrivateWc: {
		name: "hasPrivateWc",
		label: "Có WC riêng",
		type: "boolean",
		required: true,
	},
	curfewFree: {
		name: "curfewFree",
		label: "Giờ giấc tự do",
		type: "boolean",
		required: true,
	},
	hasAirConditioner: {
		name: "hasAirConditioner",
		label: "Có máy lạnh",
		type: "boolean",
		required: true,
	},
	hasFridge: {
		name: "hasFridge",
		label: "Có tủ lạnh",
		type: "boolean",
		required: true,
	},
	hasWashingMachine: {
		name: "hasWashingMachine",
		label: "Có máy giặt",
		type: "boolean",
		required: true,
	},
	utilityPricing: {
		name: "utilityPricing",
		label: "Điện nước tính thế nào",
		placeholder: "Ví dụ: Điện 3.5k/số, nước 100k/người",
		type: "text",
		required: true,
	},
	hasParking: {
		name: "hasParking",
		label: "Có chỗ để xe",
		type: "boolean",
		required: true,
	},
	interiorStatus: {
		name: "interiorStatus",
		label: "Tình trạng nội thất",
		placeholder: "Ví dụ: Đầy đủ nội thất",
		type: "text",
	},
};

const FIELDS_BY_PROPERTY: Record<PropertyType, readonly FieldName[]> = {
	nha_o: ["usableArea", "area", "bedrooms", "bathrooms", "floors", "frontage", "alleyWidth", "houseDirection", "interiorStatus", "legalStatus"],
	can_ho_chung_cu: ["usableArea", "bedrooms", "bathrooms", "apartmentFloor", "buildingFloors", "hasBalcony", "balconyDirection", "interiorStatus", "managementFee"],
	phong_tro: [
		"area",
		"maxOccupants",
		"hasLoft",
		"hasPrivateWc",
		"curfewFree",
		"hasAirConditioner",
		"hasFridge",
		"hasWashingMachine",
		"utilityPricing",
		"hasParking",
	],
};

const REQUIRED_FIELDS_BY_PROPERTY: Record<PropertyType, readonly RequiredField[]> = {
	nha_o: FIELDS_BY_PROPERTY.nha_o
		.map((name) => FIELD_CONFIGS[name])
		.filter((field) => field.required)
		.map((field) => ({ name: field.name, label: field.label, type: field.type })),
	can_ho_chung_cu: FIELDS_BY_PROPERTY.can_ho_chung_cu
		.map((name) => FIELD_CONFIGS[name])
		.filter((field) => field.required)
		.map((field) => ({ name: field.name, label: field.label, type: field.type })),
	phong_tro: FIELDS_BY_PROPERTY.phong_tro
		.map((name) => FIELD_CONFIGS[name])
		.filter((field) => field.required)
		.map((field) => ({ name: field.name, label: field.label, type: field.type })),
};

const FEATURE_OPTIONS_BY_PROPERTY: Record<PropertyType, readonly { value: string; label: string }[]> = {
	nha_o: [
		{ value: "nha-mat-tien", label: "Nhà mặt tiền" },
		{ value: "hem-rong", label: "Hẻm rộng" },
		{ value: "gan-truong-cho", label: "Gần trường/chợ" },
		{ value: "phu-hop-gia-dinh", label: "Phù hợp gia đình" },
	],
	can_ho_chung_cu: [
		{ value: "ban-cong", label: "Có ban công" },
		{ value: "view-dep", label: "View thoáng" },
		{ value: "an-ninh-24-7", label: "An ninh 24/7" },
		{ value: "gan-thang-may", label: "Gần thang máy" },
	],
	phong_tro: [
		{ value: "co-gac", label: "Có gác" },
		{ value: "wc-rieng", label: "WC riêng" },
		{ value: "gio-giac-tu-do", label: "Giờ giấc tự do" },
		{ value: "gan-trung-tam", label: "Gần trung tâm" },
	],
};

const PROPERTY_HINT_BY_TYPE: Record<PropertyType, string> = {
	nha_o: "Nhà ở: tập trung vào đất, kết cấu và yếu tố ngoài công trình.",
	can_ho_chung_cu: "Căn hộ/chung cư: tập trung vào thông số tòa nhà và tiện ích căn hộ.",
	phong_tro: "Phòng trọ: tập trung vào tiện ích và chi phí sinh hoạt.",
};

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
	const currentPropertyLabel =
		PROPERTY_TYPES.find((type) => type.value === propertyType)?.label ?? "Bất động sản";
	const detailFields = FIELDS_BY_PROPERTY[propertyType].map((fieldName) => FIELD_CONFIGS[fieldName]);
	const featureOptions = FEATURE_OPTIONS_BY_PROPERTY[propertyType];

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		setSelectedImageNames(files.map((file) => file.name));
	};

	const handlePropertyTypeChange = (type: PropertyType) => {
		setPropertyType(type);
		setFeedback(null);
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

		for (const field of REQUIRED_FIELDS_BY_PROPERTY[propertyType]) {
			if (field.type === "number") {
				const value = getOptionalNumber(formData, field.name);
				if (value === undefined || value <= 0) {
					setFeedback({ type: "error", message: `Vui lòng nhập ${field.label.toLowerCase()} hợp lệ.` });
					return;
				}
				continue;
			}

			if (field.type === "boolean") {
				const value = getOptionalString(formData, field.name);
				if (value !== "true" && value !== "false") {
					setFeedback({ type: "error", message: `Vui lòng chọn ${field.label.toLowerCase()}.` });
					return;
				}
				continue;
			}

			const value = getOptionalString(formData, field.name);
			if (!value) {
				setFeedback({ type: "error", message: `Vui lòng nhập ${field.label.toLowerCase()}.` });
				return;
			}
		}

		if (propertyType === "can_ho_chung_cu") {
			const hasBalcony = getOptionalString(formData, "hasBalcony");
			const balconyDirection = getOptionalString(formData, "balconyDirection");

			if (hasBalcony === "true" && !balconyDirection) {
				setFeedback({ type: "error", message: "Vui lòng nhập hướng ban công." });
				return;
			}
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
						<h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">ĐĂNG TIN CHO THUÊ {currentPropertyLabel.toUpperCase()}</h1>
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
										onClick={() => handlePropertyTypeChange(type.value)}
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
							<h2 className="mb-1 text-lg font-bold text-slate-900">Thông tin {currentPropertyLabel.toLowerCase()}</h2>
							<p className="mb-4 text-sm text-slate-600">{PROPERTY_HINT_BY_TYPE[propertyType]}</p>
							<div className="grid gap-3 sm:grid-cols-2">
								{detailFields.map((field) => (
									<div key={field.name}>
										<label htmlFor={field.name} className="mb-1.5 block text-[15px] font-semibold text-slate-700">
											{field.label}
											{field.required ? " *" : ""}
										</label>
										{field.type === "boolean" ? (
											<div className="relative">
												<select
													id={field.name}
													name={field.name}
													defaultValue=""
													className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-[17px] text-slate-700 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
												>
													<option value="" disabled>
														Chọn
													</option>
													<option value="true">Có</option>
													<option value="false">Không</option>
												</select>
												<span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-500">
													<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
														<path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												</span>
											</div>
										) : (
											<input
												id={field.name}
												name={field.name}
												type={field.type}
												placeholder={field.placeholder}
												required={field.required}
												min={field.type === "number" ? 0 : undefined}
												step={field.type === "number" ? field.step || "any" : undefined}
												className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[17px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
											/>
										)}
										{field.helperText ? <p className="mt-1 text-xs text-slate-500">{field.helperText}</p> : null}
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
												Chọn đặc điểm phù hợp
											</option>
											{featureOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
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
