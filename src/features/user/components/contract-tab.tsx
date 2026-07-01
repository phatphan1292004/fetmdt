"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoDownloadOutline,
  IoShieldCheckmarkOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoAddOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoPrintOutline,
  IoDocumentTextOutline,
  IoQrCodeOutline
} from "react-icons/io5";
import { USER_CONTRACT_TEMPLATE, DEPOSIT_TEMPLATE, generateDocxBlob } from "./contract-templates";

type CreatedContract = {
  id: string;
  type: "electronic" | "paper";
  renterName: string;
  renterCccd?: string;
  renterAddress?: string;
  landlordName?: string;
  landlordCccd?: string;
  landlordAddress?: string;
  landlordCccdIssuedPlace?: string;
  roomNumber: string;
  address: string;
  price: string;
  priceText?: string;
  deposit: string;
  depositText?: string;
  periodMonths: string;
  period: string;
  status: string;
  createdAt: string;
  sha256?: string;
  paperImageLandlord?: string | null;
  paperImageTenant?: string | null;
  signerA?: string;
  signerB?: string;
};

const INITIAL_CONTRACTS: CreatedContract[] = [
  {
    id: "HD-DT-2026-001",
    type: "electronic",
    renterName: "Nguyễn Văn B",
    renterCccd: "079096001234",
    renterAddress: "Quận 1, TP.HCM",
    landlordName: "Nguyễn Văn A",
    landlordCccd: "079075005678",
    landlordAddress: "Linh Trung, Thủ Đức, TP.HCM",
    landlordCccdIssuedPlace: "Cục Cảnh sát Quản lý hành chính về trật tự xã hội",
    roomNumber: "102",
    address: "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
    price: "3.500.000 đ/tháng",
    priceText: "Ba triệu năm trăm nghìn đồng",
    deposit: "3.500.000 đ",
    depositText: "Ba triệu năm trăm nghìn đồng",
    periodMonths: "12",
    period: "01/01/2026 - 31/12/2026",
    status: "Đã ký kết",
    createdAt: "01/01/2026",
    sha256: "8e92f7038cb123e42f9e4e69b0fa525287349ab902e4d0d082fa2c9e782a44bb",
    signerA: "Nguyễn Văn A (Ký số Smart-ID - 01/01/2026 09:15)",
    signerB: "Nguyễn Văn B (Ký số Smart-ID - 01/01/2026 10:30)",
  },
  {
    id: "HD-G-2025-012",
    type: "paper",
    renterName: "Nguyễn Văn B",
    roomNumber: "102",
    address: "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
    price: "3.200.000 đ/tháng",
    deposit: "3.200.000 đ",
    period: "01/01/2025 - 31/12/2025",
    status: "Đã hết hạn",
    createdAt: "01/01/2025",
    paperImageLandlord: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60",
    paperImageTenant: null,
  },
];

function docSoTien(so: number): string {
  if (so === 0) return "Không đồng";
  const rule = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  
  function docBlock3(n: number, showZero: boolean): string {
    const tram = Math.floor(n / 100);
    const chuc = Math.floor((n % 100) / 10);
    const donvi = n % 10;
    let res = "";
    if (tram > 0 || showZero) {
      res += rule[tram] + " trăm ";
    }
    if (chuc === 0 && donvi === 0) return res;
    if (chuc === 0 && donvi > 0) {
      res += "lẻ " + rule[donvi];
    } else if (chuc === 1) {
      res += "mười ";
      if (donvi === 5) res += "lăm";
      else if (donvi > 0) res += rule[donvi];
    } else {
      res += rule[chuc] + " mươi ";
      if (donvi === 1) res += "mốt";
      else if (donvi === 5) res += "lăm";
      else if (donvi > 0) res += rule[donvi];
    }
    return res;
  }

  let text = "";
  const trieu = Math.floor(so / 1000000);
  const nghin = Math.floor((so % 1000000) / 1000);
  const dong = so % 1000;
  
  if (trieu > 0) {
    text += docBlock3(trieu, false) + " triệu ";
  }
  if (nghin > 0) {
    text += docBlock3(nghin, trieu > 0) + " nghìn ";
  }
  if (dong > 0) {
    text += docBlock3(dong, trieu > 0 || nghin > 0) + " đồng";
  } else {
    text += "đồng";
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\s+/g, " ").trim();
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateEndDate = (startDateStr: string, monthsStr: string) => {
  if (!startDateStr) return "";
  const d = new Date(startDateStr);
  if (Number.isNaN(d.getTime())) return "";
  const months = parseInt(monthsStr, 10);
  if (Number.isNaN(months) || months <= 0) return "";
  
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function ContractTab() {
  const [contracts, setContracts] = useState<CreatedContract[]>([]);
  
  // Dashboard Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"list" | "create" | "paper-upload">("list");

  // Electronic form states
  const [renterName, setRenterName] = useState("");
  const [renterCccd, setRenterCccd] = useState("079096001234");
  const [renterPhone, setRenterPhone] = useState("");
  const [renterAddress, setRenterAddress] = useState("Quận 1, TP.HCM");
  const [landlordName, setLandlordName] = useState("Nguyễn Văn A");
  const [landlordCccd, setLandlordCccd] = useState("079075005678");
  const [landlordAddress, setLandlordAddress] = useState("Linh Trung, Thủ Đức, TP.HCM");
  const [landlordCccdIssuedPlace, setLandlordCccdIssuedPlace] = useState("Cục Cảnh sát Quản lý hành chính về trật tự xã hội");
  const [roomNumber, setRoomNumber] = useState("102");
  const [address, setAddress] = useState("Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM");
  const [price, setPrice] = useState("");
  const [priceText, setPriceText] = useState("");
  const [deposit, setDeposit] = useState("");
  const [depositText, setDepositText] = useState("");
  const [periodMonths, setPeriodMonths] = useState("12");
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(calculateEndDate(getTodayString(), "12"));

  // Paper upload states
  const [uploadRoom, setUploadRoom] = useState("Phòng 102");
  const [uploadRenter, setUploadRenter] = useState("");
  const [paperPrice, setPaperPrice] = useState("");
  const [paperPeriod, setPaperPeriod] = useState("");
  const [paperImage, setPaperImage] = useState<string | null>(null);

  // Preview overlays
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [pdfContract, setPdfContract] = useState<CreatedContract | null>(null);
  const [previewTemplateType, setPreviewTemplateType] = useState<"lease" | "deposit" | null>(null);

  // Creation modes
  const [createMode, setCreateMode] = useState<"custom" | "post">("custom");
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [selectedPaperPostId, setSelectedPaperPostId] = useState<string>("");
  
  // QR scanning states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerType, setScannerType] = useState<"electronic" | "paper">("electronic");
  const [scannedRenterName, setScannedRenterName] = useState<string | null>(null);
  const [scannedRenterCccd, setScannedRenterCccd] = useState<string | null>(null);
  const [scannedRenterPhone, setScannedRenterPhone] = useState<string | null>(null);

  // Phone search states
  const [scannerTab, setScannerTab] = useState<"qr" | "phone">("qr");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Dynamic JSQR loading on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).jsQR) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch landlord profile to set legal representative default fields
  useEffect(() => {
    fetch("/api/v1/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const profile = data.data;
          if (profile.fullName) setLandlordName(profile.fullName);
          if (profile.identityCard) setLandlordCccd(profile.identityCard);
          if (profile.permanentAddress) setLandlordAddress(profile.permanentAddress);
          else if (profile.preferredArea) setLandlordAddress(profile.preferredArea);
          if (profile.identityCardIssuedPlace) setLandlordCccdIssuedPlace(profile.identityCardIssuedPlace);
        }
      })
      .catch((err) => console.error("Error fetching landlord profile:", err));
  }, []);

  // Automatically update end date when start date or lease duration changes
  useEffect(() => {
    if (startDate && periodMonths) {
      const calculated = calculateEndDate(startDate, periodMonths);
      setEndDate(calculated);
    }
  }, [startDate, periodMonths]);
  const fetchContracts = async () => {
    try {
      const res = await fetch("/api/v1/user/contracts");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        // Map _id as string to match CreatedContract representation (id)
        const mapped = data.data.map((c: any) => ({
          ...c,
          id: c.id || c._id,
        }));
        setContracts(mapped);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [activeSubTab]);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsQR = (window as any).jsQR;
          if (jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code && code.data) {
              const scannedText = code.data.trim();
              stopCamera();
              setShowScannerModal(false);
              handleScannedPhone(scannedText);
              return;
            }
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Không thể khởi động camera. Vui lòng cấp quyền truy cập camera!");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (showScannerModal && scannerTab === "qr") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showScannerModal, scannerTab]);

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (activeSubTab === "create" || activeSubTab === "paper-upload") {
      setLoadingPosts(true);
      fetch("/api/v1/user/posts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setUserPosts(data.data);
          }
        })
        .catch((err) => console.error("Error fetching user posts:", err))
        .finally(() => setLoadingPosts(false));
    }
  }, [activeSubTab]);

  const handlePostSelect = (postId: string) => {
    setSelectedPostId(postId);
    if (!postId) return;
    const post = userPosts.find((p) => p._id === postId);
    if (post) {
      // Parse room number from post title if format is e.g. "Phòng 102"
      const match = post.title.match(/(?:Phòng|phòng|phong|P\.)\s*(\d+[A-Za-z]?)/i);
      const extractedRoom = match ? match[1] : "102";

      setRoomNumber(extractedRoom);
      setAddress(post.address || "");

      const priceNum = post.price || 0;
      setPrice(priceNum.toString());
      setPriceText(docSoTien(priceNum));

      const depositNum = post.deposit || priceNum;
      setDeposit(depositNum.toString());
      setDepositText(docSoTien(depositNum));
    }
  };

  const handlePhoneSearch = async () => {
    setSearchError("");
    setSearchResult(null);
    const sanitizedPhone = searchPhone.trim();
    if (!sanitizedPhone) {
      setSearchError("Vui lòng nhập số điện thoại khách thuê!");
      return;
    }
    
    try {
      const res = await fetch(`/api/v1/user/search?phone=${encodeURIComponent(sanitizedPhone)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSearchError(data.message || "Không tìm thấy khách thuê đăng ký số điện thoại này trên hệ thống!");
        return;
      }
      setSearchResult(data.data);
    } catch (err) {
      console.error("Search phone error:", err);
      setSearchError("Đã xảy ra lỗi kết nối khi tìm kiếm thông tin.");
    }
  };

  const handleScannedPhone = async (phone: string) => {
    try {
      const res = await fetch(`/api/v1/user/search?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const renter = data.data;
        if (scannerType === "electronic") {
          setRenterName(renter.fullName);
          setRenterCccd(renter.cccd);
          setRenterAddress(renter.address);
          setRenterPhone(renter.phone);
        } else {
          setScannedRenterName(renter.fullName);
          setScannedRenterCccd(renter.cccd);
          setScannedRenterPhone(renter.phone);
        }
      } else {
        if (scannerType === "electronic") {
          setRenterName(phone);
          setRenterPhone(phone);
        } else {
          setScannedRenterName(phone);
        }
      }
    } catch (err) {
      console.error("Scanned phone fetch error:", err);
      if (scannerType === "electronic") {
        setRenterName(phone);
        setRenterPhone(phone);
      } else {
        setScannedRenterName(phone);
      }
    }
  };

  const openScanner = (type: "electronic" | "paper") => {
    setScannerType(type);
    setScannerTab("qr");
    setSearchPhone("");
    setSearchResult(null);
    setSearchError("");
    setShowScannerModal(true);
  };

  const handleDownloadTemplate = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWordTemplate = async (filename: string, templateType: "lease" | "deposit") => {
    try {
      const blob = await generateDocxBlob(templateType);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate DOCX file", err);
    }
  };

  const handleCreateEContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renterName.trim() || !price.trim() || !deposit.trim() || !startDate || !endDate) return;

    const randomHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const signerA = `Chủ trọ ${landlordName.trim()} (Ký số Smart-ID - ${formattedDate} 22:50)`;

    try {
      const res = await fetch("/api/v1/user/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "electronic",
          renterName: renterName.trim(),
          renterPhone: renterPhone.trim() || "0987654321",
          renterCccd: renterCccd.trim(),
          renterAddress: renterAddress.trim(),
          landlordName: landlordName.trim(),
          landlordCccd: landlordCccd.trim(),
          landlordAddress: landlordAddress.trim(),
          landlordCccdIssuedPlace: landlordCccdIssuedPlace.trim(),
          roomNumber: roomNumber.trim(),
          address: address.trim(),
          price: `${Number(price).toLocaleString("vi-VN")} đ/tháng`,
          priceNumber: Number(price),
          priceText: priceText.trim() || "Chưa ghi chữ",
          deposit: `${Number(deposit).toLocaleString("vi-VN")} đ`,
          depositNumber: Number(deposit),
          depositText: depositText.trim() || "Chưa ghi chữ",
          periodMonths: periodMonths.trim(),
          period: `${startDate.split("-").reverse().join("/")} - ${endDate.split("-").reverse().join("/")}`,
          startDate,
          endDate,
          status: "Chờ khách thuê ký",
          sha256: randomHash,
          signerA,
          postId: selectedPostId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const savedContract = {
          ...data.data,
          id: data.data._id,
        };
        setContracts((prev) => [savedContract, ...prev]);
        setPdfContract(savedContract);
        setPreviewTemplateType(null);

        // Reset fields
        setRenterName("");
        setRenterPhone("");
        setPrice("");
        setPriceText("");
        setDeposit("");
        setDepositText("");
      } else {
        alert(data.message || "Không thể tạo hợp đồng điện tử!");
      }
    } catch (err) {
      console.error("Create contract error:", err);
      alert("Đã xảy ra lỗi khi tạo hợp đồng.");
    }
  };

  const handlePaperImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaperImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPaperContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaperPostId || !paperImage) return;

    if (!scannedRenterName) {
      alert("Vui lòng quét mã QR của khách thuê để liên kết vào hợp đồng giấy trước khi tải lên!");
      return;
    }

    const post = userPosts.find((p) => p._id === selectedPaperPostId);
    if (!post) return;

    const match = post.title.match(/(?:Phòng|phòng|phong|P\.)\s*(\d+[A-Za-z]?)/i);
    const extractedRoom = match ? match[1] : "102";

    try {
      const res = await fetch("/api/v1/user/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "paper",
          renterName: scannedRenterName,
          renterPhone: scannedRenterPhone || "0987654321",
          renterCccd: scannedRenterCccd || "",
          renterAddress: "",
          landlordName: landlordName.trim(),
          landlordCccd: landlordCccd.trim(),
          landlordAddress: landlordAddress.trim(),
          landlordCccdIssuedPlace: landlordCccdIssuedPlace.trim(),
          roomNumber: extractedRoom,
          address: post.address || "Số 12 Đường số 17, Linh Trung, Thủ Đức, TP.HCM",
          price: `${Number(post.price || 0).toLocaleString("vi-VN")} đ/tháng`,
          priceNumber: Number(post.price || 0),
          priceText: docSoTien(Number(post.price || 0)),
          deposit: `${Number(post.deposit || post.price || 0).toLocaleString("vi-VN")} đ`,
          depositNumber: Number(post.deposit || post.price || 0),
          depositText: docSoTien(Number(post.deposit || post.price || 0)),
          periodMonths: 12,
          period: "01/01/2026 - 31/12/2026",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-12-31"),
          status: "Đã tải lên ảnh",
          paperImageLandlord: paperImage,
          postId: post._id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const savedContract = {
          ...data.data,
          id: data.data._id,
        };
        setContracts((prev) => [savedContract, ...prev]);
        setActiveSubTab("list");

        // Reset
        setSelectedPaperPostId("");
        setPaperImage(null);
        setScannedRenterName(null);
        setScannedRenterCccd(null);
        setScannedRenterPhone(null);
      } else {
        alert(data.message || "Không thể tải lên hợp đồng giấy!");
      }
    } catch (err) {
      console.error("Upload paper contract error:", err);
      alert("Đã xảy ra lỗi khi tải lên hợp đồng.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] print:hidden">
        <h2 className="text-2xl font-extrabold text-slate-900">Tạo & Quản Lý Hợp Đồng</h2>
        <p className="mt-1.5 text-slate-600 text-[15px] leading-relaxed">
          Tạo và quản lý các giao dịch thuê trọ. Hệ thống hỗ trợ phát hành Hợp đồng điện tử tuân thủ Luật Giao dịch điện tử 2023 (Hiệu lực từ 01/07/2024), hoặc quản lý bản hợp đồng giấy đã ký kết qua hình thức tải lên ảnh chụp đối chiếu.
        </p>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 rounded-2xl gap-1 print:hidden">
        <button
          onClick={() => setActiveSubTab("list")}
          type="button"
          className={`flex-1 py-2 text-center text-sm font-bold rounded-xl transition ${
            activeSubTab === "list"
              ? "bg-white text-slate-950 shadow-xs border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Danh sách hợp đồng
        </button>
        <button
          onClick={() => setActiveSubTab("create")}
          type="button"
          className={`flex-1 py-2 text-center text-sm font-bold rounded-xl transition ${
            activeSubTab === "create"
              ? "bg-white text-slate-950 shadow-xs border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tạo Hợp đồng điện tử
        </button>
        <button
          onClick={() => setActiveSubTab("paper-upload")}
          type="button"
          className={`flex-1 py-2 text-center text-sm font-bold rounded-xl transition ${
            activeSubTab === "paper-upload"
              ? "bg-white text-slate-950 shadow-xs border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Tải lên ảnh Hợp đồng giấy
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 print:hidden">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2">
          {/* Sub-Tab 1: List Contracts */}
          {activeSubTab === "list" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                Danh sách hợp đồng đã lập
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-2">Mã số</th>
                      <th className="py-2.5 px-2">Khách thuê</th>
                      <th className="py-2.5 px-2">Phòng</th>
                      <th className="py-2.5 px-2">Loại</th>
                      <th className="py-2.5 px-2">Trạng thái</th>
                      <th className="py-2.5 px-2 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {contracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-2 font-bold text-slate-950">{c.id}</td>
                        <td className="py-3 px-2">{c.renterName}</td>
                        <td className="py-3 px-2 text-slate-500">Phòng {c.roomNumber}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.type === "electronic" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {c.type === "electronic" ? "Điện tử" : "Giấy"}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              c.status === "Đã ký kết"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "Chờ khách thuê ký"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center space-x-2">
                          {c.type === "electronic" ? (
                            <button
                              onClick={() => {
                                setPdfContract(c);
                                setPreviewTemplateType(null);
                              }}
                              type="button"
                              className="inline-flex h-7 px-2.5 items-center gap-1 rounded bg-[#effaff] hover:bg-[#dff3f5] text-[#0b7ea9] text-[10px] font-bold transition shadow-xs"
                            >
                              <IoEyeOutline className="h-3.5 w-3.5" /> Xem PDF
                            </button>
                          ) : c.paperImageLandlord ? (
                            <button
                              onClick={() => setPreviewSrc(c.paperImageLandlord as string)}
                              type="button"
                              className="inline-flex h-7 px-2.5 items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition shadow-xs"
                            >
                              <IoImageOutline className="h-3.5 w-3.5" /> Xem ảnh
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Chưa tải ảnh</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Sub-Tab 2: Create E-Contract */}
          {activeSubTab === "create" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                Soạn hợp đồng điện tử mới
              </h3>

              <form onSubmit={handleCreateEContract} className="space-y-4">
                {/* Method selector */}
                <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 gap-1 w-full sm:w-fit">
                  <button
                    onClick={() => {
                      setCreateMode("custom");
                      setSelectedPostId("");
                    }}
                    type="button"
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      createMode === "custom"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    1. Tạo hợp đồng tùy chỉnh
                  </button>
                  <button
                    onClick={() => setCreateMode("post")}
                    type="button"
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                      createMode === "post"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    2. Chọn từ tin đăng (các phòng)
                  </button>
                </div>

                {/* If selected Post, render select dropdown */}
                {createMode === "post" && (
                  <div className="p-4 rounded-xl bg-[#effaff] border border-blue-150 space-y-2 mb-4 animate-fade-in">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide">
                      Chọn phòng từ tin đăng của bạn
                    </label>
                    <select
                      value={selectedPostId}
                      onChange={(e) => handlePostSelect(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] bg-white text-slate-800 font-bold"
                    >
                      <option value="">-- Nhấp để chọn phòng trọ --</option>
                      {loadingPosts ? (
                        <option disabled>Đang tải danh sách tin đăng từ database...</option>
                      ) : userPosts.length === 0 ? (
                        <option disabled>Không tìm thấy tin đăng nào của bạn</option>
                      ) : (
                        userPosts.map((post) => {
                          const match = post.title.match(/(?:Phòng|phòng|phong|P\.)\s*(\d+[A-Za-z]?)/i);
                          const extractedRoom = match ? match[1] : "Chưa rõ số phòng";
                          return (
                            <option key={post._id} value={post._id}>
                              {post.title} (Phòng {extractedRoom} - {Number(post.price || 0).toLocaleString("vi-VN")} đ/tháng)
                            </option>
                          );
                        })
                      )}
                    </select>
                    {selectedPostId && (
                      <p className="text-[11px] text-blue-700 font-semibold italic">
                        ✓ Đã tự động điền các thông tin: Mã phòng, Địa chỉ, Giá thuê, Giá chữ, Tiền cọc, Cọc chữ!
                      </p>
                    )}
                  </div>
                )}

                {/* Renter QR/Phone Linking Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Định danh khách thuê (Bên B)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Liên kết tài khoản người dùng để xác thực hợp đồng trực tuyến.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openScanner("electronic")}
                    className="inline-flex h-9 px-4 items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shrink-0 self-start sm:self-center"
                  >
                    <IoQrCodeOutline className="h-4 w-4" /> Liên kết khách thuê
                  </button>
                </div>

                {renterName && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs mb-4 animate-fade-in">
                    <div>
                      <p className="font-bold text-emerald-800">✓ Đã định danh thành công: {renterName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">CCCD: {renterCccd} | Địa chỉ: {renterAddress}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRenterName("");
                        setRenterCccd("");
                        setRenterAddress("");
                      }}
                      className="text-[10px] text-red-500 hover:underline font-semibold"
                    >
                      Gỡ liên kết
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ tên người thuê (Bên B)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ông/bà Nguyễn Văn B..."
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã số phòng thuê</label>
                    <input
                      type="text"
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CMND/CCCD Bên B</label>
                    <input
                      type="text"
                      placeholder="Nhập số CMND/CCCD của người thuê..."
                      value={renterCccd}
                      onChange={(e) => setRenterCccd(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại Bên B</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập số điện thoại người thuê..."
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ căn nhà cho thuê</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thường trú của Bên B</label>
                    <input
                      type="text"
                      value={renterAddress}
                      onChange={(e) => setRenterAddress(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thời hạn thuê (Tháng)</label>
                    <input
                      type="number"
                      required
                      value={periodMonths}
                      onChange={(e) => setPeriodMonths(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá thuê phòng (VNĐ/tháng)</label>
                    <input
                      type="number"
                      required
                      placeholder="3500000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá thuê bằng chữ</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ba triệu năm trăm nghìn đồng"
                      value={priceText}
                      onChange={(e) => setPriceText(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiền đặt cọc (VNĐ)</label>
                    <input
                      type="number"
                      required
                      placeholder="3500000"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiền cọc bằng chữ</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Ba triệu năm trăm nghìn đồng"
                      value={depositText}
                      onChange={(e) => setDepositText(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày bắt đầu thuê</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày kết thúc thuê</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ tên Bên A (Chủ trọ)</label>
                    <input
                      type="text"
                      required
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CMND/CCCD Bên A</label>
                    <input
                      type="text"
                      required
                      value={landlordCccd}
                      onChange={(e) => setLandlordCccd(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nơi cấp CCCD Bên A</label>
                    <input
                      type="text"
                      required
                      value={landlordCccdIssuedPlace}
                      onChange={(e) => setLandlordCccdIssuedPlace(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thường trú của Bên A</label>
                    <input
                      type="text"
                      required
                      value={landlordAddress}
                      onChange={(e) => setLandlordAddress(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="h-10 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <IoAddOutline className="h-5 w-5" /> Tạo & Xem trước PDF
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Sub-Tab 3: Upload Paper Contract */}
          {activeSubTab === "paper-upload" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                Tải lên ảnh chụp hợp đồng giấy đã ký
              </h3>

              <form onSubmit={handleUploadPaperContract} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn tin đăng phòng trọ áp dụng</label>
                  <select
                    required
                    value={selectedPaperPostId}
                    onChange={(e) => setSelectedPaperPostId(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] bg-white text-slate-800 font-bold"
                  >
                    <option value="">-- Nhấp để chọn phòng trọ từ tin đăng --</option>
                    {loadingPosts ? (
                      <option disabled>Đang tải danh sách tin đăng từ database...</option>
                    ) : userPosts.length === 0 ? (
                      <option disabled>Không tìm thấy tin đăng nào của bạn</option>
                    ) : (
                      userPosts.map((post) => {
                        const match = post.title.match(/(?:Phòng|phòng|phong|P\.)\s*(\d+[A-Za-z]?)/i);
                        const extractedRoom = match ? match[1] : "Chưa rõ số phòng";
                        return (
                          <option key={post._id} value={post._id}>
                            {post.title} (Phòng {extractedRoom} - {Number(post.price || 0).toLocaleString("vi-VN")} đ/tháng)
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                {/* QR Link Renter Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Định danh khách thuê (Bên B)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Liên kết khách thuê định danh vào hợp đồng trọ giấy.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openScanner("paper")}
                    className="inline-flex h-9 px-4 items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs shrink-0 self-start sm:self-center"
                  >
                    <IoQrCodeOutline className="h-4 w-4" /> Liên kết khách thuê
                  </button>
                </div>

                {scannedRenterName ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs animate-fade-in">
                    <div>
                      <p className="font-bold text-emerald-800">✓ Đã định danh thành công: {scannedRenterName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">CCCD: {scannedRenterCccd} | SĐT: {scannedRenterPhone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScannedRenterName(null);
                        setScannedRenterCccd(null);
                        setScannedRenterPhone(null);
                      }}
                      className="text-[10px] text-red-500 hover:underline font-semibold"
                    >
                      Gỡ liên kết
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Chưa liên kết khách thuê cho hợp đồng giấy này. Vui lòng bấm nút đỏ để liên kết trước khi tiếp tục.
                  </p>
                )}

                {/* Upload Image Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ảnh chụp bản ký kết của chủ trọ</label>
                  <div className="rounded-xl border border-dashed border-slate-350 bg-slate-50 p-6 text-center flex flex-col items-center justify-center relative min-h-[160px]">
                    {paperImage ? (
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-32 h-24 rounded-lg bg-cover bg-center border border-slate-200 shadow-sm cursor-pointer"
                          style={{ backgroundImage: `url(${paperImage})` }}
                          onClick={() => setPreviewSrc(paperImage)}
                        />
                        <p className="text-xs text-slate-500 mt-2">Ảnh hợp đồng đã chọn</p>
                        <button
                          type="button"
                          onClick={() => setPaperImage(null)}
                          className="text-xs text-red-500 hover:underline mt-1 font-semibold"
                        >
                          Xóa ảnh chọn lại
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                        <IoCloudUploadOutline className="h-10 w-10 text-[#0b7ea9] mb-1.5" />
                        <span className="text-xs font-bold text-slate-800">Nhấp để tải lên hình ảnh hợp đồng</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">(Hỗ trợ JPG, PNG, WEBP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePaperImageSelect}
                          className="hidden"
                          required
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="h-10 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <IoCloudUploadOutline className="h-5 w-5" /> Tải lên hợp đồng giấy
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Right Side Templates & Inspector (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Văn bản pháp lý mẫu
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải xuống mẫu chuẩn để thảo luận hợp đồng giấy hoặc xem trước PDF:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-100 transition space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Mẫu hợp đồng thuê phòng</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mẫu quy định điều khoản chính quyền</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadWordTemplate("Mau_Hop_Dong_Thue_Phong.docx", "lease")}
                    type="button"
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition"
                  >
                    <IoDownloadOutline className="h-3 w-3" /> Tải về (.docx)
                  </button>
                  <button
                    onClick={() => {
                      setPreviewTemplateType("lease");
                      setPdfContract(null);
                    }}
                    type="button"
                    className="flex-1 py-1.5 px-2 bg-[#effaff] hover:bg-[#dff3f5] text-[#0b7ea9] font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition border border-blue-100"
                  >
                    <IoEyeOutline className="h-3 w-3" /> Xem PDF
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-100 transition space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Mẫu hợp đồng cọc giữ phòng</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Đặt chỗ trước khi ký thuê chính thức</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadWordTemplate("Mau_Hop_Dong_Dat_Coc.docx", "deposit")}
                    type="button"
                    className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition"
                  >
                    <IoDownloadOutline className="h-3 w-3" /> Tải về (.docx)
                  </button>
                  <button
                    onClick={() => {
                      setPreviewTemplateType("deposit");
                      setPdfContract(null);
                    }}
                    type="button"
                    className="flex-1 py-1.5 px-2 bg-[#effaff] hover:bg-[#dff3f5] text-[#0b7ea9] font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition border border-blue-100"
                  >
                    <IoEyeOutline className="h-3 w-3" /> Xem PDF
                  </button>
                </div>
              </div>
            </div>
          </section>


        </div>
      </div>

      {/* Image Preview Overlay Modal */}
      {previewSrc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2 animate-fade-in">
            <button
              onClick={() => setPreviewSrc(null)}
              type="button"
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition shadow-md"
            >
              <IoCloseOutline className="h-6 w-6" />
            </button>
            <img src={previewSrc} alt="Preview paper contract" className="max-h-[85vh] w-auto mx-auto rounded-2xl border border-slate-100" />
          </div>
        </div>
      )}

      {/* Formal PDF Viewer Overlay Modal (For Created Contracts) */}
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
                    <p>Ông/bà: <span className="font-bold">{pdfContract.landlordName || "Nguyễn Văn A"}</span></p>
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

      {/* PDF Blank Templates Preview Modal Overlay */}
      {previewTemplateType && (
        <div className="fixed inset-0 bg-slate-900/80 flex flex-col z-50 overflow-y-auto p-4 md:p-8 print:p-0 print:bg-white print:absolute print:inset-0">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #pdf-print-area-template, #pdf-print-area-template * {
                visibility: visible;
              }
              #pdf-print-area-template {
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
              <span className="text-xs font-bold truncate tracking-wide">
                {previewTemplateType === "lease" ? "Mau_Hop_Dong_Thue_Phong.pdf" : "Mau_Hop_Dong_Dat_Coc.pdf"} (Xem trước)
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                type="button"
                className="h-8 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 text-xs font-bold text-white transition shadow-xs"
              >
                <IoPrintOutline className="h-4.5 w-4.5" /> In bản mẫu
              </button>
              <button
                onClick={() => setPreviewTemplateType(null)}
                type="button"
                className="text-slate-400 hover:text-white transition p-1"
              >
                <IoCloseOutline className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Wrapper for printable multi-page documents */}
          <div id="pdf-print-area-template" className="w-full flex flex-col gap-6 print:gap-0 print:bg-white">
            
            {previewTemplateType === "lease" ? (
              <>
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
                      Hôm nay, ngày.........tháng …..năm 20…., tại căn nhà số..................Chúng tôi ký tên dưới đây gồm có:
                    </p>

                    <div>
                      <p className="font-bold">BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):</p>
                      <div className="pl-4 mt-0.5 space-y-0.5">
                        <p>Ông/bà (tên chủ hợp đồng) ................................................................</p>
                        <p>CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................</p>
                        <p>Thường trú tại: ...............................................................................................</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold">BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</p>
                      <div className="pl-4 mt-0.5 space-y-0.5">
                        <p>Ông/bà................................................................</p>
                        <p>CMND/CCCD số................................cấp ngày ..........................nơi cấp ................................</p>
                        <p>Thường trú tại: ...............................................................................................</p>
                      </div>
                    </div>

                    <p>Sau khi thỏa thuận, hai bên thống nhất như sau:</p>

                    {/* Clause 1 */}
                    <div>
                      <p><span className="font-bold">1. Nội dung thuê phòng trọ</span></p>
                      <p className="pl-4 text-slate-800">
                        Bên A cho Bên B thuê 01 phòng trọ số............. tại căn nhà số............................................Với thời hạn là:................ tháng, giá thuê:..........................đồng (Bằng chữ ......................................). Chưa bao gồm chi phí: điện sinh hoạt, nước.
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
                        <li>Đặt cọc với số tiền là............................đồng (Bằng chữ ......................................), thanh toán tiền thuê phòng hàng tháng vào ngày ……. + tiền điện + nước.</li>
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
                        Sau thời hạn cho thuê ….. tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.
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
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300 text-center"> </td>
                            <td className="py-1.5 px-2 text-center text-slate-300 italic">Ký tên</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2 border-r border-slate-300 font-bold text-center">2</td>
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300"> </td>
                            <td className="py-1.5 px-2 border-r border-slate-300 text-center"> </td>
                            <td className="py-1.5 px-2 text-center text-slate-300 italic">Ký tên</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signature Blocks at bottom of Page 2 */}
                  <div className="mt-16 grid grid-cols-2 gap-8 text-center text-[11px] font-sans">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">Bên B (Bên thuê)</span>
                      <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 block">Bên A (Chủ trọ)</span>
                      <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                    </div>
                  </div>

                  {/* Footnote on the bottom of Page 2 */}
                  <div className="absolute bottom-5 left-[15mm] right-[15mm] border-t border-slate-200 pt-3.5 text-[9px] text-slate-400 font-sans text-center">
                    Mẫu Hợp Đồng Thuê Phòng Trọ Hành Chính Stayvia - Lưu hành nội bộ đối chiếu.
                  </div>
                </article>
              </>
            ) : (
              /* DEPOSIT TEMPLATE PREVIEW */
              <article
                className="pdf-page mx-auto max-w-[800px] w-full bg-white shadow-2xl p-[15mm] md:p-[20mm] rounded-b-2xl min-h-[297mm] text-slate-900 relative text-[12px] leading-relaxed print:shadow-none print:p-0 print:rounded-none"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                {/* Header */}
                <div className="text-center space-y-0.5">
                  <h4 className="font-bold uppercase text-[12px] tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                  <h5 className="font-bold text-[11px]">Độc lập – Tự do – Hạnh phúc</h5>
                  <div className="w-32 h-[1px] bg-slate-900 mx-auto mt-1" />
                  <div className="pt-6 pb-4">
                    <h1 className="text-base font-extrabold uppercase tracking-wide">HỢP ĐỒNG ĐẶT CỌC GIỮ CHỖ THUÊ PHÒNG</h1>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-justify">
                  <p>
                    Hôm nay, ngày ...... tháng ...... năm 202... Chúng tôi gồm:
                  </p>

                  <div>
                    <p className="font-bold">BÊN NHẬN ĐẶT CỌC (BÊN A):</p>
                    <div className="pl-4 mt-1 space-y-1">
                      <p>Họ và tên: .................................................................................................................................</p>
                      <p>Số CCCD: .................................................................................................................................</p>
                      <p>Số điện thoại: ...............................................................................................................................</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold">BÊN ĐẶT CỌC (BÊN B):</p>
                    <div className="pl-4 mt-1 space-y-1">
                      <p>Họ và tên: .................................................................................................................................</p>
                      <p>Số CCCD: .................................................................................................................................</p>
                      <p>Số điện thoại: ...............................................................................................................................</p>
                    </div>
                  </div>

                  <p>Hai bên thỏa thuận ký kết hợp đồng đặt cọc giữ chỗ thuê phòng với nội dung sau:</p>

                  <div className="space-y-2">
                    <p>
                      1. Bên B tự nguyện đặt cọc cho Bên A số tiền: ........................................ VNĐ (Bằng chữ: ........................................) để giữ chỗ thuê phòng số: ....... tại địa chỉ: ................................................................
                    </p>
                    <p>
                      2. Giá thuê phòng thỏa thuận chính thức khi ký hợp đồng là: ........................................ VNĐ/tháng.
                    </p>
                    <p>
                      3. Thời hạn đặt giữ chỗ là từ ngày ..../..../202... đến ngày ..../..../202... (Ngày ký hợp đồng chính thức).
                    </p>
                    <p>
                      4. Xử lý tiền đặt cọc giữ chỗ:
                      <br />
                      - Đến ngày hẹn, nếu Bên B ký hợp đồng thì số tiền đặt cọc này được chuyển thành tiền cọc thuê phòng.
                      <br />
                      - Nếu Bên A không cho Bên B thuê phòng như cam kết, Bên A phải trả lại tiền cọc giữ chỗ và bồi thường cho Bên B số tiền tương đương số tiền đã cọc.
                      <br />
                      - Nếu Bên B từ chối ký hợp đồng thuê mà không có lý do chính đáng, Bên B sẽ mất số tiền đặt cọc này.
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-16 grid grid-cols-2 gap-8 text-center text-[11px] font-sans">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">ĐẠI DIỆN BÊN A</span>
                    <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">ĐẠI DIỆN BÊN B</span>
                    <span className="text-[9px] text-slate-400 block">(Ký, ghi rõ họ tên)</span>
                  </div>
                </div>

                {/* Footnote */}
                <div className="absolute bottom-5 left-[15mm] right-[15mm] border-t border-slate-200 pt-3.5 text-[9px] text-slate-400 font-sans text-center">
                  Mẫu Hợp Đồng Đặt Cọc Giữ Chỗ Stayvia - Lưu hành nội bộ đối chiếu.
                </div>
              </article>
            )}

          </div>
        </div>
      )}
      {/* QR Scanner / Phone Lookup Simulation Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl relative animate-scale-up space-y-4">
            <button
              onClick={() => setShowScannerModal(false)}
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 justify-center">
                <IoQrCodeOutline className="h-5 w-5 text-[#0b7ea9]" />
                Liên kết tài khoản Khách Thuê
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lựa chọn phương thức kết nối khách thuê vào biểu mẫu hợp đồng.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 gap-1 w-full">
              <button
                onClick={() => setScannerTab("qr")}
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  scannerTab === "qr"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Quét mã QR
              </button>
              <button
                onClick={() => {
                  setScannerTab("phone");
                  setSearchPhone("");
                  setSearchResult(null);
                  setSearchError("");
                }}
                type="button"
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  scannerTab === "phone"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                2. Tìm theo Số điện thoại
              </button>
            </div>

            {/* Tab 1: QR Scanning Code */}
            {scannerTab === "qr" && (
              <div className="space-y-4 animate-fade-in">
                {/* Camera Video Stream Frame */}
                <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-slate-350 bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Green scanner line */}
                  <div 
                    className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981] z-10"
                    style={{
                      top: "0%",
                      animation: "scan 2s linear infinite",
                    }}
                  />
                  <style>{`
                    @keyframes scan {
                      0% { top: 0%; }
                      50% { top: 100%; }
                      100% { top: 0%; }
                    }
                  `}</style>
                  
                  {/* Overlay focus box corners */}
                  <div className="absolute w-48 h-48 border-2 border-white/30 rounded-xl flex items-center justify-center pointer-events-none">
                    <IoQrCodeOutline className="h-28 w-28 text-white/20 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-400 absolute bottom-3 font-semibold tracking-wide">
                    {cameraActive ? "Đang quét mã QR từ camera..." : "Đang khởi động camera..."}
                  </span>
                </div>

                {/* Simulated options */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const testRenter = {
                        fullName: "Nguyễn Văn B",
                        cccd: "079096001234",
                        address: "Quận 1, TP.HCM",
                        phone: "0987654321"
                      };
                      
                      if (scannerType === "electronic") {
                        setRenterName(testRenter.fullName);
                        setRenterCccd(testRenter.cccd);
                        setRenterAddress(testRenter.address);
                        setRenterPhone(testRenter.phone);
                      } else {
                        setScannedRenterName(testRenter.fullName);
                        setScannedRenterCccd(testRenter.cccd);
                        setScannedRenterPhone(testRenter.phone);
                      }
                      setShowScannerModal(false);
                    }}
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    Giả lập Quét QR (Khách B - Nguyễn Văn B)
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const testRenter = {
                        fullName: "Lê Văn C",
                        cccd: "079095009876",
                        address: "Quận 3, TP.HCM",
                        phone: "0912345678"
                      };
                      
                      if (scannerType === "electronic") {
                        setRenterName(testRenter.fullName);
                        setRenterCccd(testRenter.cccd);
                        setRenterAddress(testRenter.address);
                        setRenterPhone(testRenter.phone);
                      } else {
                        setScannedRenterName(testRenter.fullName);
                        setScannedRenterCccd(testRenter.cccd);
                        setScannedRenterPhone(testRenter.phone);
                      }
                      setShowScannerModal(false);
                    }}
                    className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    Giả lập Quét QR (Khách C - Lê Văn C)
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Phone Search Code */}
            {scannerTab === "phone" && (
              <div className="space-y-4 py-2 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nhập số điện thoại khách thuê</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: 0987654321, 0912345678..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="flex-1 h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handlePhoneSearch}
                      className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                    >
                      Tìm kiếm
                    </button>
                  </div>
                </div>

                {searchError && (
                  <p className="text-xs text-red-500 font-semibold">{searchError}</p>
                )}

                {searchResult && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-3 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-extrabold text-emerald-800">✓ Đã tìm thấy tài khoản hợp lệ</h4>
                      <div className="mt-2 space-y-1 text-xs text-slate-600 font-medium">
                        <p>Họ tên: <span className="font-bold text-slate-800">{searchResult.fullName}</span></p>
                        <p>SĐT: <span className="font-bold text-slate-800">{searchResult.phone}</span></p>
                        <p>CCCD: <span className="font-bold text-slate-800">{searchResult.cccd}</span></p>
                        <p>Thường trú: <span className="font-bold text-slate-800">{searchResult.address}</span></p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (scannerType === "electronic") {
                          setRenterName(searchResult.fullName);
                          setRenterCccd(searchResult.cccd);
                          setRenterAddress(searchResult.address);
                          setRenterPhone(searchResult.phone);
                        } else {
                          setScannedRenterName(searchResult.fullName);
                          setScannedRenterCccd(searchResult.cccd);
                          setScannedRenterPhone(searchResult.phone);
                        }
                        setShowScannerModal(false);
                      }}
                      className="w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Liên kết tài khoản vào hợp đồng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
