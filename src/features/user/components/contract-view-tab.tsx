"use client";

import { useState, useEffect } from "react";
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoBusinessOutline,
  IoCloudUploadOutline,
  IoShieldCheckmarkOutline,
  IoImageOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoPhonePortraitOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoPrintOutline,
  IoQrCodeOutline
} from "react-icons/io5";
import { generateEContractDownloadText } from "./contract-templates";

type ContractHistory = {
  id: string;
  type: "electronic" | "paper";
  price: string;
  priceText?: string;
  deposit: string;
  depositText?: string;
  periodMonths: string;
  period: string;
  roomNumber: string;
  address: string;
  createdAt: string;
  sha256?: string;
  signerA?: string;
  signerB?: string;
  paperImageTenant?: string | null;
  paperImageLandlord?: string | null;
  renterCccd?: string;
  renterAddress?: string;
  landlordCccd?: string;
  landlordAddress?: string;
};

type RentedRoomHistory = {
  id: string;
  roomName: string;
  landlord: string;
  address: string;
  contracts: ContractHistory[];
};

const INITIAL_ROOM_HISTORY: RentedRoomHistory[] = [
  {
    id: "ROOM-001",
    roomName: "Phòng 102 - Nhà trọ Linh Trung",
    landlord: "Nguyễn Văn A",
    address: "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
    contracts: [
      {
        id: "HD-DT-2026-002",
        type: "electronic",
        price: "3.600.000 đ/tháng",
        priceText: "Ba triệu sáu trăm nghìn đồng",
        deposit: "3.600.000 đ",
        depositText: "Ba triệu sáu trăm nghìn đồng",
        periodMonths: "12",
        period: "01/07/2026 - 30/06/2027",
        roomNumber: "102",
        address: "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
        createdAt: "30/06/2026",
        sha256: "9f82d7038cb123e42f9e4e69b0fa525287349ab902e4d0d082fa2c9e782a44cc",
        signerA: "Nguyễn Văn A (Ký số Smart-ID - 30/06/2026 14:15)",
        signerB: "",
        renterCccd: "079096001234",
        renterAddress: "Quận 1, TP.HCM",
        landlordCccd: "079075005678",
        landlordAddress: "Linh Trung, Thủ Đức, TP.HCM",
      },
      {
        id: "HD-DT-2025-001",
        type: "electronic",
        price: "3.200.000 đ/tháng",
        priceText: "Ba triệu hai trăm nghìn đồng",
        deposit: "3.200.000 đ",
        depositText: "Ba triệu hai trăm nghìn đồng",
        periodMonths: "12",
        period: "01/01/2025 - 31/12/2025",
        roomNumber: "102",
        address: "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
        createdAt: "01/01/2025",
        sha256: "8e92f7038cb123e42f9e4e69b0fa525287349ab902e4d0d082fa2c9e782a44bb",
        signerA: "Nguyễn Văn A (Ký số Smart-ID - 01/01/2025 09:15)",
        signerB: "Nguyễn Văn B (Ký số Smart-ID - 01/01/2025 10:30)",
        renterCccd: "079096001234",
        renterAddress: "Quận 1, TP.HCM",
        landlordCccd: "079075005678",
        landlordAddress: "Linh Trung, Thủ Đức, TP.HCM",
      },
    ],
  },
  {
    id: "ROOM-002",
    roomName: "Phòng 304 - KTX Tư nhân Đông Hòa",
    landlord: "Trần Thị B",
    address: "Khu phố Tân Lập, Đông Hòa, Dĩ An, Bình Dương",
    contracts: [
      {
        id: "HD-G-2024-098",
        type: "paper",
        price: "2.800.000 đ/tháng",
        priceText: "Hai triệu tám trăm nghìn đồng",
        deposit: "2.800.000 đ",
        depositText: "Hai triệu tám trăm nghìn đồng",
        periodMonths: "6",
        period: "01/06/2024 - 31/12/2024",
        roomNumber: "304",
        address: "Khu phố Tân Lập, Đông Hòa, Dĩ An, Bình Dương",
        createdAt: "01/06/2024",
        paperImageTenant: null,
        paperImageLandlord: null,
        renterCccd: "079096001234",
        renterAddress: "Quận 1, TP.HCM",
        landlordCccd: "079075008912",
        landlordAddress: "Đông Hòa, Dĩ An, Bình Dương",
      },
    ],
  },
];

export function ContractViewTab() {
  const [roomHistory, setRoomHistory] = useState<RentedRoomHistory[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState("0987654321");
  const [userName, setUserName] = useState("Khách thuê");

  // Modal overlays
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [pdfContract, setPdfContract] = useState<ContractHistory | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Signing OTP States
  const [signingContract, setSigningContract] = useState<ContractHistory | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [phoneInput, setPhoneInput] = useState("0987654321");

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/contracts");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const groupedMap = new Map<string, ContractHistory[]>();

        const mappedContracts = data.data.map((c: any) => ({
          ...c,
          id: c._id || c.id,
        }));

        for (const contract of mappedContracts) {
          const key = `${contract.roomNumber}_${contract.address}`;
          if (!groupedMap.has(key)) {
            groupedMap.set(key, []);
          }
          groupedMap.get(key)!.push(contract);
        }

        const histories: RentedRoomHistory[] = [];
        let roomCounter = 1;
        groupedMap.forEach((contractsList, key) => {
          const first = contractsList[0];
          histories.push({
            id: `ROOM-${roomCounter++}`,
            roomName: `Phòng ${first.roomNumber} - ${first.address.split(",")[0]}`,
            landlord: first.landlordName || "Chủ trọ",
            address: first.address,
            contracts: contractsList,
          });
        });

        setRoomHistory(histories);
        if (histories.length > 0) {
          setSelectedRoomId(histories[0].id);
          if (histories[0].contracts.length > 0) {
            setExpandedContractId(histories[0].contracts[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error loading contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();

    fetch("/api/v1/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.phone) {
            setUserPhone(data.data.phone);
            setPhoneInput(data.data.phone);
          }
          if (data.data.fullName) {
            setUserName(data.data.fullName);
          }
        }
      })
      .catch((err) => console.error("Error loading renter profile:", err));
  }, []);

  const selectedRoom = roomHistory.find((r) => r.id === selectedRoomId) || roomHistory[0] || null;

  const handleDownloadSigned = (roomName: string, landlord: string, contract: ContractHistory) => {
    const fileContent = generateEContractDownloadText(contract, landlord);
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Hop_Dong_Dien_Tu_${contract.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle tenant local physical contract image upload simulation
  const handleTenantImageUpload = async (roomId: string, contractId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch(`/api/v1/user/contracts/${contractId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload-paper",
            paperImageTenant: base64Data,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          await fetchContracts();
        } else {
          alert(data.message || "Không thể tải lên ảnh hợp đồng.");
        }
      } catch (err) {
        console.error("Tenant upload paper error:", err);
        alert("Lỗi kết nối khi tải lên ảnh.");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleExpandContract = (contractId: string) => {
    setExpandedContractId((prev) => (prev === contractId ? null : contractId));
  };

  // Signing OTP verification workflow
  const handleSendOtp = () => {
    if (!agreementChecked) return;
    setOtpSent(true);
    setOtpError("");
  };

  const handleVerifyOtp = async () => {
    if (otpCode !== "123456") {
      setOtpError("Mã OTP chưa chính xác. Vui lòng thử lại với mã 123456.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    if (signingContract) {
      try {
        const res = await fetch(`/api/v1/user/contracts/${signingContract.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sign",
            signerB: `Bên B xác thực SMS OTP (${phoneInput}) - ${formattedDate}`,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          await fetchContracts();
        } else {
          setOtpError(data.message || "Không thể ký số hợp đồng.");
          return;
        }
      } catch (err) {
        console.error("Sign contract error:", err);
        setOtpError("Lỗi kết nối khi ký số.");
        return;
      }
    }

    setSigningContract(null);
    setOtpSent(false);
    setOtpCode("");
    setAgreementChecked(false);
    setOtpError("");
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-extrabold text-slate-900">Lịch Sử Thuê Trọ</h2>
        <p className="mt-1 text-slate-600 text-[15px]">
          Tra cứu lịch sử các phòng trọ đã thuê. Xem chi tiết các hợp đồng điện tử pháp lý, thực hiện ký kết online bằng OTP, hoặc tải lên ảnh chụp bản hợp đồng giấy.
        </p>
      </div>

      {/* Renter QR Code Card */}
      <div className="rounded-2xl border border-blue-150 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-2.5 text-center sm:text-left">
          <h3 className="text-base font-extrabold text-blue-900 flex items-center gap-2 justify-center sm:justify-start">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Mã QR định danh người thuê cá nhân
          </h3>
          <p className="text-xs text-blue-700 font-medium max-w-xl leading-relaxed">
            Mã QR này được tự động tạo dựa trên số điện thoại liên hệ của bạn (`{userPhone}`). Hãy đưa cho Chủ trọ quét khi tạo hợp đồng trọ để tự động điền hồ sơ của bạn vào hệ thống.
          </p>
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="inline-flex h-8 px-3.5 items-center gap-1.5 rounded-lg bg-[#0b7ea9] hover:bg-[#096b90] text-white text-[10px] font-bold transition shadow-xs"
          >
            <IoQrCodeOutline className="h-3.5 w-3.5" /> Hiển thị mã QR phóng to
          </button>
        </div>
        <div
          onClick={() => setShowQrModal(true)}
          className="flex flex-col items-center gap-1.5 bg-white p-3 rounded-xl border border-blue-100 shadow-xs shrink-0 cursor-pointer hover:bg-slate-50 transition group"
        >
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${userPhone}`}
            alt="Mã QR định danh người thuê"
            className="w-24 h-24 group-hover:scale-105 transition duration-200"
          />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">SĐT: {userPhone}</span>
        </div>
      </div>

      {/* QR Code Enlarged Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative animate-scale-up text-center space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-655 transition"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Mã QR Định Danh</h3>
              <p className="text-xs text-slate-500">Đưa mã QR này cho Chủ trọ quét để liên kết hồ sơ</p>
            </div>

            <div className="mx-auto p-4 bg-white rounded-2xl border border-slate-150 shadow-inner w-fit">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${userPhone}`}
                alt="Mã QR định danh người thuê phóng to"
                className="w-64 h-64 mx-auto"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 font-medium">
              <p>Khách thuê: <span className="font-bold text-slate-800">{userName}</span></p>
              <p>Số điện thoại: <span className="font-bold text-slate-800">{userPhone}</span></p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          Đang tải lịch sử thuê trọ từ database...
        </div>
      ) : roomHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50/50 p-12 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
          <IoDocumentTextOutline className="h-10 w-10 text-slate-300" />
          <span>Bạn chưa có lịch sử thuê trọ nào được ghi nhận trên hệ thống Stayvia.</span>
          <span className="text-xs font-semibold text-slate-400 mt-1 max-w-sm font-medium">Khi chủ nhà trọ lập hợp đồng điện tử hoặc hợp đồng giấy liên kết với số điện thoại của bạn, thông tin thuê trọ sẽ xuất hiện tại đây.</span>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Rooms list (1 col) */}
          <section className="lg:col-span-1 space-y-3.5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Danh sách phòng đã thuê
              </h3>
              <div className="space-y-2.5">
                {roomHistory.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setExpandedContractId(room.contracts[0]?.id || null);
                      }}
                      type="button"
                      className={`w-full text-left p-4 rounded-2xl border transition ${isSelected
                        ? "bg-[#effaff] border-[#0b7ea9] shadow-sm"
                        : "bg-white border-slate-150 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <IoBusinessOutline className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? "text-[#0b7ea9]" : "text-slate-400"}`} />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-[14px] truncate">{room.roomName}</h4>
                          <p className="text-slate-400 text-xs mt-1 truncate">{room.address}</p>
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                              {room.contracts.length} hợp đồng
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Chủ trọ: {room.landlord}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right: Room details and contracts list (2 cols) */}
          <section className="lg:col-span-2">
            {selectedRoom ? (
              <div className="space-y-4">
                {/* Room Header Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedRoom.roomName}</h3>
                  <p className="text-sm text-slate-500">{selectedRoom.address}</p>
                  <p className="text-sm text-slate-600 pt-1">
                    Chủ nhà trọ: <span className="font-bold text-slate-800">{selectedRoom.landlord}</span>
                  </p>
                </div>

                {/* List of Contracts (Accordion Style) */}
                <div className="space-y-3">
                  {selectedRoom.contracts.map((contract) => {
                    const isExpanded = expandedContractId === contract.id;
                    const canSign = contract.type === "electronic" && contract.status === "Chờ khách thuê ký";
                    return (
                      <div
                        key={contract.id}
                        className={`rounded-2xl border transition ${isExpanded
                          ? "bg-white border-slate-200 shadow-sm"
                          : "bg-white border-slate-150 hover:border-slate-200"
                          }`}
                      >
                        {/* Header Row */}
                        <div
                          onClick={() => toggleExpandContract(contract.id)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
                              <IoDocumentTextOutline className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-sm">{contract.id}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${contract.type === "electronic"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-orange-50 text-orange-700"
                                    }`}
                                >
                                  {contract.type === "electronic" ? "Điện tử" : "Giấy"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{contract.period}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${contract.status === "Đã ký kết" || contract.status === "Đang hiệu lực"
                                ? "bg-emerald-100 text-emerald-800"
                                : canSign
                                  ? "bg-amber-100 text-amber-800 animate-pulse"
                                  : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              {contract.status}
                            </span>
                            {isExpanded ? (
                              <IoChevronUpOutline className="h-4 w-4 text-slate-400" />
                            ) : (
                              <IoChevronDownOutline className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Collapsible Body */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
                            {/* Alert for signature if needed */}
                            {canSign && (
                              <div className="p-4 rounded-xl bg-amber-50 border border-amber-150 flex items-start gap-3">
                                <IoShieldCheckmarkOutline className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                  <span className="font-extrabold text-amber-800 text-xs block">
                                    Yêu cầu ký số Hợp đồng Điện tử
                                  </span>
                                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                    Bạn có một hợp đồng điện tử đang chờ xác nhận chữ ký từ bên thuê. Vui lòng kiểm tra kỹ các điều khoản bên dưới trước khi ký kết.
                                  </p>
                                  <button
                                    onClick={() => setSigningContract(contract)}
                                    type="button"
                                    className="h-8 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs px-3"
                                  >
                                    <IoCreateOutline className="h-4 w-4" /> Ký hợp đồng ngay (OTP)
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Info Blocks Grid */}
                            <div className="grid gap-3.5 sm:grid-cols-2 text-xs">
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 space-y-1">
                                <span className="text-slate-400 font-bold block uppercase text-[10px]">Đơn giá thuê</span>
                                <p className="font-black text-slate-800 text-sm">{contract.price}</p>
                                {contract.priceText && <p className="text-[10px] text-slate-500 italic">({contract.priceText})</p>}
                              </div>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 space-y-1">
                                <span className="text-slate-400 font-bold block uppercase text-[10px]">Tiền đặt cọc</span>
                                <p className="font-black text-slate-800 text-sm">{contract.deposit}</p>
                                {contract.depositText && <p className="text-[10px] text-slate-500 italic">({contract.depositText})</p>}
                              </div>
                            </div>

                            {/* Contract content view */}
                            {contract.type === "electronic" ? (
                              /* E-Contract details with PDF action */
                              <div className="space-y-3 pt-2">
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                                  <div className="space-y-1">
                                    <span className="font-bold text-blue-900 block">Văn bản Hợp đồng gốc điện tử</span>
                                    <p className="text-[10px] text-slate-500">Mã băm kiểm chứng SHA-256 an toàn pháp lý tuyệt đối.</p>
                                  </div>
                                  <button
                                    onClick={() => setPdfContract(contract)}
                                    type="button"
                                    className="h-8 inline-flex items-center gap-1 rounded-lg bg-[#effaff] hover:bg-[#dff3f5] text-[#0b7ea9] text-[10px] font-bold transition shadow-xs px-2.5 border border-blue-150"
                                  >
                                    <IoEyeOutline className="h-4 w-4" /> Xem PDF
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Paper Contract View with Upload files */
                              <div className="space-y-4">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  Hợp đồng thuê bằng văn bản giấy ký tay truyền thống. Vui lòng chụp ảnh lại các trang hợp đồng đã ký và tải lên đây để lưu trữ, đối chiếu khi cần thiết.
                                </p>

                                <div className="grid gap-4 md:grid-cols-2">
                                  {/* Tenant Upload Card */}
                                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[160px]">
                                    {contract.paperImageTenant ? (
                                      <div className="w-full h-full flex flex-col items-center justify-between">
                                        <div
                                          className="w-full h-24 rounded-lg bg-cover bg-center cursor-pointer border border-slate-100"
                                          style={{ backgroundImage: `url(${contract.paperImageTenant})` }}
                                          onClick={() => setPreviewImageSrc(contract.paperImageTenant as string)}
                                        />
                                        <p className="text-[11px] font-bold text-slate-700 mt-2">Ảnh bạn đã tải lên</p>
                                        <label className="text-[10px] text-[#0b7ea9] font-bold mt-1 cursor-pointer hover:underline">
                                          Thay đổi ảnh
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleTenantImageUpload(selectedRoom.id, contract.id, e)}
                                            className="hidden"
                                          />
                                        </label>
                                      </div>
                                    ) : (
                                      <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                                        <IoCloudUploadOutline className="h-8 w-8 text-[#0b7ea9] mb-1.5" />
                                        <span className="text-xs font-bold text-slate-800">Tải lên ảnh hợp đồng</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">(Hình ảnh bên thuê chụp)</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleTenantImageUpload(selectedRoom.id, contract.id, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>

                                  {/* Landlord Upload View Only Card */}
                                  <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center text-center min-h-[160px]">
                                    {contract.paperImageLandlord ? (
                                      <div className="w-full h-full flex flex-col items-center justify-between">
                                        <div
                                          className="w-full h-24 rounded-lg bg-cover bg-center cursor-pointer border border-slate-100"
                                          style={{ backgroundImage: `url(${contract.paperImageLandlord})` }}
                                          onClick={() => setPreviewImageSrc(contract.paperImageLandlord as string)}
                                        />
                                        <p className="text-[11px] font-bold text-slate-700 mt-2">Ảnh chủ trọ đã tải lên</p>
                                        <span className="text-[10px] text-slate-400 mt-1 italic">(Chỉ đọc)</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-slate-400">
                                        <IoImageOutline className="h-8 w-8 text-slate-300 mb-1.5" />
                                        <span className="text-xs font-semibold">Chủ trọ chưa tải ảnh lên</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">Đang chờ đối chiếu bản quét của chủ trọ</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400 text-sm h-64 flex flex-col items-center justify-center">
                Chọn một phòng trọ bên cạnh để xem danh sách lịch sử hợp đồng.
              </div>
            )}
          </section>
        </div>
      )}

      {/* Image Preview Modal overlay */}
      {previewImageSrc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImageSrc(null)}
              type="button"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition shadow-md"
            >
              <IoCloseOutline className="h-6 w-6" />
            </button>
            <img src={previewImageSrc} alt="Preview contract paper" className="max-h-[85vh] w-auto mx-auto rounded-2xl border border-slate-100" />
          </div>
        </div>
      )}

      {/* Formal PDF Viewer Overlay Modal */}
      {pdfContract && (
        <div className="fixed inset-0 bg-slate-900/80 flex flex-col z-50 overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:absolute print:inset-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #pdf-print-area, #pdf-print-area * {
                visibility: visible;
              }
              #pdf-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .pdf-page {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 15mm !important;
                min-height: 297mm !important;
                page-break-after: always !important;
                break-after: page !important;
                visibility: visible !important;
                background: white !important;
              }
              .pdf-page * {
                visibility: visible !important;
              }
            }
          `}</style>

          {/* Reader Control Header Bar - hidden on print */}
          <div className="mx-auto max-w-[800px] w-full bg-slate-800 text-white rounded-t-2xl px-4 py-3 flex items-center justify-between border-b border-slate-700 shadow-md print:hidden shrink-0">
            <div className="flex items-center gap-2">
              <IoDocumentTextOutline className="text-red-500 h-5 w-5" />
              <span className="text-xs font-bold truncate tracking-wide">{pdfContract.id}.pdf (Hợp đồng)</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                type="button"
                className="h-8 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 text-xs font-bold text-white transition shadow-xs"
              >
                <IoPrintOutline className="h-4.5 w-4.5" /> In / Tải PDF
              </button>
              <button
                onClick={() => setPdfContract(null)}
                type="button"
                className="text-slate-400 hover:text-white transition p-1"
              >
                <IoCloseOutline className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Wrapper for printable multi-page documents */}
          <div id="pdf-print-area" className="w-full flex flex-col gap-6 print:gap-0 print:bg-white">

            {/* PAGE 1: Clauses 1, 2, 3 */}
            <article
              className="pdf-page mx-auto max-w-[800px] w-full bg-white shadow-2xl p-[15mm] md:p-[20mm] rounded-b-none min-h-[297mm] text-slate-900 relative text-[12px] leading-relaxed print:shadow-none print:p-0 print:rounded-none"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Header */}
              <div className="text-center space-y-0.5">
                <h4 className="font-bold uppercase text-[12px] tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                <h5 className="font-bold text-[11px]">Độc lập – Tự do – Hạnh phúc</h5>
                <div className="w-32 h-[1px] bg-slate-900 mx-auto mt-1" />
                <div className="pt-5 pb-3">
                  <h1 className="text-base font-extrabold uppercase tracking-wide">HỢP ĐỒNG THUÊ PHÒNG TRỌ</h1>
                </div>
              </div>

              {/* Content Clauses - Page 1 */}
              <div className="mt-4 space-y-3.5 text-justify">
                <p>
                  Hôm nay, ngày {pdfContract.createdAt.split("/")[0]} tháng {pdfContract.createdAt.split("/")[1]} năm {pdfContract.createdAt.split("/")[2]}, tại căn nhà số <span className="font-semibold">{pdfContract.address}</span>. Chúng tôi ký tên dưới đây gồm có:
                </p>

                <div>
                  <p className="font-bold">BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):</p>
                  <div className="pl-4 mt-0.5 space-y-0.5">
                    <p>Ông/bà: <span className="font-bold">{pdfContract.landlordName || selectedRoom.landlord || "Nguyễn Văn A"}</span></p>
                    <p>CMND/CCCD số: {pdfContract.landlordCccd || "079075005678"} • cấp tại: {pdfContract.landlordCccdIssuedPlace || "Cục Cảnh sát Quản lý hành chính về trật tự xã hội"}</p>
                    <p>Thường trú tại: {pdfContract.landlordAddress || "Linh Trung, Thủ Đức, TP.HCM"}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold">BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</p>
                  <div className="pl-4 mt-0.5 space-y-0.5">
                    <p>Ông/bà: <span className="font-bold">{pdfContract.renterName}</span></p>
                    <p>CMND/CCCD số: {pdfContract.renterCccd || "079096001234"}</p>
                    <p>Thường trú tại: {pdfContract.renterAddress || "Quận 1, TP.HCM"}</p>
                  </div>
                </div>

                <p>Sau khi thỏa thuận, hai bên thống nhất như sau:</p>

                {/* Clause 1 */}
                <div>
                  <p><span className="font-bold">1. Nội dung thuê phòng trọ</span></p>
                  <p className="pl-4 text-slate-800">
                    Bên A cho Bên B thuê 01 phòng trọ số <span className="font-bold">{pdfContract.roomNumber}</span> tại căn nhà số <span className="font-bold">{pdfContract.address}</span>.
                    Với thời hạn là: <span className="font-bold">{pdfContract.periodMonths}</span> tháng, giá thuê: <span className="font-bold text-red-600">{pdfContract.price}</span> (Bằng chữ: <span className="italic">{pdfContract.priceText}</span>). Chưa bao gồm chi phí: điện sinh hoạt, nước.
                  </p>
                </div>

                {/* Clause 2 */}
                <div>
                  <p><span className="font-bold">2. Trách nhiệm Bên A</span></p>
                  <ul className="pl-6 list-disc space-y-0.5">
                    <li>Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.</li>
                    <li>Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.</li>
                  </ul>
                </div>

                {/* Clause 3 */}
                <div>
                  <p><span className="font-bold">3. Trách nhiệm Bên B</span></p>
                  <ul className="pl-6 list-disc space-y-1.5">
                    <li>Đặt cọc với số tiền là: <span className="font-bold text-slate-800">{pdfContract.deposit}</span> (Bằng chữ: <span className="italic">{pdfContract.depositText}</span>), thanh toán tiền thuê phòng hàng tháng vào ngày 05 + tiền điện + nước.</li>
                    <li>Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.</li>
                    <li>Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.</li>
                    <li>Không được tự ý cải tạo kiến trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất.</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* PAGE 2: Clause 4, Extension Table, Signatures */}
            <article
              className="pdf-page mx-auto max-w-[800px] w-full bg-white shadow-2xl p-[15mm] md:p-[20mm] rounded-b-2xl min-h-[297mm] text-slate-900 relative text-[12px] leading-relaxed print:shadow-none print:p-0 print:rounded-none"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              <div className="space-y-4 text-justify">
                {/* Clause 4 */}
                <div>
                  <p><span className="font-bold">4. Điều khoản thực hiện</span></p>
                  <p className="pl-4">
                    Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê, nếu bên A lấy phòng phải báo cho bên B ít nhất 01 tháng, hoặc ngược lại.
                    <br />
                    Sau thời hạn cho thuê <span className="font-bold">{pdfContract.periodMonths}</span> tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.
                  </p>
                </div>

                {/* Extension Table */}
                <div className="overflow-hidden border border-slate-300 rounded-lg">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead className="bg-slate-50 font-bold border-b border-slate-350">
                      <tr className="text-slate-700">
                        <th className="py-1 px-2 border-r border-slate-300">Số lần gia hạn</th>
                        <th className="py-1 px-2 border-r border-slate-300">Thời gian gia hạn (tháng)</th>
                        <th className="py-1 px-2 border-r border-slate-300">Từ ngày</th>
                        <th className="py-1 px-2 border-r border-slate-300">Đến ngày</th>
                        <th className="py-1 px-2 border-r border-slate-300 text-center">Giá thuê/tháng (triệu đồng)</th>
                        <th className="py-1 px-2 text-center">Ký tên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-center">1</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center">-</td>
                        <td className="py-1.5 px-2 text-center text-slate-400 italic">Chưa phát sinh</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-center">2</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">-</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center">-</td>
                        <td className="py-1.5 px-2 text-center text-slate-400 italic">Chưa phát sinh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* E-contract certification clause */}
                {pdfContract.type === "electronic" && (
                  <div className="p-3.5 rounded-xl border border-blue-150 bg-blue-50/50 text-[10px] text-blue-800 leading-relaxed font-sans">
                    <span className="font-bold block text-xs">Đây là hợp đồng điện tử.</span>
                    <p className="mt-1">
                      Được khởi tạo trực tuyến và ký số xác thực bởi hai bên tuân thủ Luật Giao dịch điện tử 2023.
                      <br />
                      Mã định danh SHA-256 đối chiếu: <code className="bg-white/80 px-1 py-0.5 rounded select-all font-mono text-[9px]">{pdfContract.sha256}</code>
                    </p>
                  </div>
                )}
              </div>

              {/* Signature Blocks at bottom of Page 2 */}
              <div className="mt-8 grid grid-cols-2 gap-8 text-center text-[11px] font-sans">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Bên B (Bên thuê)</span>
                  <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                  {pdfContract.type === "electronic" ? (
                    pdfContract.signerB ? (
                      <div className="pt-6 text-emerald-600 font-bold text-[9px] flex items-center justify-center gap-0.5">
                        <IoShieldCheckmarkOutline className="h-4 w-4" /> SECURE OTP SIGNED: {pdfContract.signerB.replace("Bên B xác thực SMS OTP (", "").replace(")", "")}
                      </div>
                    ) : (
                      <div className="pt-6 text-amber-500 font-bold text-[9px] italic">
                        Chưa ký kết
                      </div>
                    )
                  ) : (
                    <div className="pt-6 text-slate-500 text-[10px] italic">
                      (Ký tay bản giấy)
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-900 block">Bên A (Chủ trọ)</span>
                  <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                  {pdfContract.type === "electronic" ? (
                    <div className="pt-6 text-emerald-600 font-bold text-[9px] flex items-center justify-center gap-0.5">
                      <IoShieldCheckmarkOutline className="h-4 w-4" /> SECURE SIGNED: {pdfContract.signerA?.split(" (")[0] || "Nguyễn Văn A"}
                    </div>
                  ) : (
                    <div className="pt-6 text-slate-500 text-[10px] italic">
                      (Ký tay bản giấy)
                    </div>
                  )}
                </div>
              </div>

              {/* Footnote on the bottom of Page 2 */}
              <div className="absolute bottom-5 left-[15mm] right-[15mm] border-t border-slate-200 pt-3.5 text-[9px] text-slate-400 font-sans text-center">
                Mã định danh xác thực STAYVIA CeCA: {pdfContract.id} - Bản gốc điện tử lưu trữ tại cổng giao dịch điện tử Stayvia.
              </div>
            </article>

          </div>
        </div>
      )}

      {/* Signing OTP Verification Modal Overlay */}
      {signingContract && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <button
              onClick={() => {
                setSigningContract(null);
                setOtpSent(false);
                setOtpCode("");
                setAgreementChecked(false);
                setOtpError("");
              }}
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
            >
              <IoCloseOutline className="h-6 w-6" />
            </button>

            <div className="text-center pb-2 border-b border-slate-150">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Ký Hợp Đồng Trực Tuyến</h3>
              <p className="text-xs text-slate-400 mt-1">Xác thực giao dịch an toàn qua SMS OTP</p>
            </div>

            {!otpSent ? (
              <div className="space-y-4 text-sm text-slate-700">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                  <span className="font-bold text-blue-800 text-xs block">Tóm tắt hợp đồng {signingContract.id}:</span>
                  <div className="text-xs text-slate-600 space-y-1 mt-1">
                    <p>• Phòng thuê: Phòng {signingContract.roomNumber}</p>
                    <p>• Kỳ hạn: {signingContract.periodMonths} tháng ({signingContract.period})</p>
                    <p>• Giá thuê: <span className="font-bold text-red-500">{signingContract.price}</span></p>
                    <p>• Tiền cọc: {signingContract.deposit}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Số điện thoại nhận mã OTP</label>
                  <div className="flex h-11 border border-slate-200 rounded-xl overflow-hidden px-3 bg-slate-50 items-center gap-2">
                    <IoPhonePortraitOutline className="text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 bg-transparent text-slate-800 text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 text-[#0b7ea9] border-slate-300 rounded focus:ring-[#0b7ea9]"
                  />
                  <span className="text-xs text-slate-500 leading-normal">
                    Tôi đã đọc kỹ và đồng ý với tất cả điều khoản trong hợp đồng điện tử này. Tôi thừa nhận chữ ký số của mình có giá trị pháp lý tương đương ký tay theo Luật Giao dịch điện tử.
                  </span>
                </label>

                <button
                  onClick={handleSendOtp}
                  disabled={!agreementChecked}
                  type="button"
                  className="w-full h-11 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Nhận mã xác thực OTP
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-700 text-center">
                <IoPhonePortraitOutline className="h-10 w-10 text-[#0b7ea9] mx-auto animate-bounce" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-950">Nhập mã OTP</p>
                  <p className="text-xs text-slate-400 leading-normal">
                    Mã xác thực đã được gửi về số điện thoại <span className="font-bold text-slate-800">{phoneInput}</span> của bạn.
                  </p>
                  <p className="text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block font-semibold mt-1">
                    Mã xác thực thử nghiệm: 123456
                  </p>
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="______"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center h-12 border-2 border-slate-200 rounded-xl text-lg font-black tracking-widest focus:outline-none focus:border-[#0b7ea9] text-slate-900 bg-slate-50"
                  />
                  {otpError && <p className="text-xs text-red-500 font-medium">{otpError}</p>}
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                      setOtpError("");
                    }}
                    type="button"
                    className="h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    type="button"
                    className="h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <IoCheckmarkCircle className="h-4.5 w-4.5" /> Xác nhận ký
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
