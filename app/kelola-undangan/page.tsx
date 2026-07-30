"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  FaSave, FaPlus, FaTrash, FaWhatsapp, FaCopy, FaEdit, 
  FaMusic, FaImage, FaUsers, FaComments, FaCogs, FaCheckCircle, 
  FaInfoCircle, FaFileCsv, FaEye, FaEyeSlash, FaHourglassHalf, FaExternalLinkAlt,
  FaLock, FaSignOutAlt, FaCalendarAlt, FaSync, FaTimesCircle, FaBars
} from "react-icons/fa";

interface Settings {
  _id?: string;
  coupleNames: string;
  eventDate: string;
  groom: string;
  groomNickName: string;
  groomInstagram: string;
  groomBio: string;
  groomTitleFront?: string;
  groomTitleBack?: string;
  bride: string;
  brideNickName: string;
  brideInstagram: string;
  brideBio: string;
  brideTitleFront?: string;
  brideTitleBack?: string;
  bibleVerse: string;
  bibleVerseContent: string;
  timeline_1: string;
  timeline_1_content: string;
  timeline_2: string;
  timeline_2_content: string;
  timeline_3: string;
  timeline_3_content: string;
  timeline_4?: string;
  timeline_4_content?: string;
  timeline_5?: string;
  timeline_5_content?: string;
  timelineCount?: number;
  holyMatrimony: {
    enabled: boolean;
    time: string;
    place: string;
    place_details: string;
    googleMapsLink: string;
  };
  weddingReception: {
    enabled: boolean;
    time: string;
    place: string;
    place_details: string;
    googleMapsLink: string;
  };
  livestreaming: {
    enabled: boolean;
    time: string;
    link: string;
    detail: string;
  };
  prewedding: {
    enabled: boolean;
    link: string;
    detail: string;
  };
  rsvp: {
    enabled: boolean;
    detail: string;
  };
  thankyou: string;
  thankyouDetail: string;
  musicPath: string;
  slideImages: {
    slide1: string;
    slide2: string;
    slide3: string;
    slide4: string;
    slide5: string;
    slide6: string;
    slide7: string;
    slide8: string;
    slide9: string;
    slide10: string;
    sideImage: string;
  };
  invitationTemplate: string;
  galleryImages?: string[];
  weddingGift?: {
    enabled: boolean;
    qrisImage: string;
    qrisOwnerName: string;
    bankAccounts: {
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
    }[];
  };
}

interface Guest {
  _id: string;
  name: string;
  phone: string;
  status: "Belum Dikirim" | "Terkirim";
  sentAt?: string;
}

interface Wish {
  _id: string;
  name: string;
  attendance: string;
  guests: number;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // App data states
  const [settings, setSettings] = useState<Settings | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  
  // Bulk selection states
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [selectedRsvps, setSelectedRsvps] = useState<string[]>([]);
  const [selectedWishes, setSelectedWishes] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<"settings" | "guests" | "rsvp" | "wishes">("settings");
  
  // Settings tab sub-sections
  const [settingsSection, setSettingsSection] = useState<"general" | "loveJourney" | "groomBride" | "events" | "media" | "template" | "weddingGift">("general");

  // Guest list filters and search
  const [guestSearch, setGuestSearch] = useState("");
  const [guestFilter, setGuestFilter] = useState<"all" | "Belum Dikirim" | "Terkirim">("all");

  // Edit/Add Guest Modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [currentEditingGuest, setCurrentEditingGuest] = useState<Partial<Guest> | null>(null);

  // Bulk Add Guest Modal state
  const [isBulkGuestModalOpen, setIsBulkGuestModalOpen] = useState(false);
  const [bulkGuestText, setBulkGuestText] = useState("");
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const handleSaveBulkGuests = async () => {
    if (!bulkGuestText.trim()) return;
    setIsSavingBulk(true);
    const names = bulkGuestText.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    let successCount = 0;
    
    try {
      for (const name of names) {
        const res = await fetch("/api/admin/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone: "" }),
        });
        if (res.ok) successCount++;
      }
      
      showToast(`${successCount} tamu berhasil ditambahkan!`, "success");
      setBulkGuestText("");
      setIsBulkGuestModalOpen(false);
      fetchInitialData(true);
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan saat menambahkan tamu bulk.", "error");
    } finally {
      setIsSavingBulk(false);
    }
  };


  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditNavOpen, setIsEditNavOpen] = useState(false);

  // Toast notification system
  const [toasts, setToasts] = useState<{id: number; message: string; type: "success" | "error" | "info"}[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Custom confirm modal
  const [confirmModal, setConfirmModal] = useState<{open: boolean; message: string; onConfirm: () => void} | null>(null);

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ open: true, message, onConfirm });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (settings) {
      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: "UPDATE_PREVIEW",
          settings: settings
        }, "*");
      }
    }
  }, [settings]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/check-auth");
      if (res.ok) {
        setIsAuthenticated(true);
        fetchInitialData(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setLoading(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setLoading(true);
        fetchInitialData(false);
      } else {
        const errData = await res.json();
        setLoginError(errData.error || "Password salah!");
      }
    } catch (err) {
      setLoginError("Koneksi gagal!");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setSettings(null);
        setGuests([]);
        setWishes([]);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInitialData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // 1. Fetch settings
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      // 2. Fetch guests
      const guestsRes = await fetch("/api/admin/guests");
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData);
      }

      // 3. Fetch Wishes
      const wishesRes = await fetch("/api/get?limit=1000"); // fetch all wishes
      if (wishesRes.ok) {
        const wishesData = await wishesRes.json();
        setWishes(wishesData.wishes || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleDeleteWish = async (id: string) => {
    showConfirm("Yakin ingin menghapus ucapan ini?", async () => {
      try {
        const res = await fetch(`/api/admin/wishes/${id}`, { method: "DELETE" });
        if (res.ok) {
          setWishes(prev => prev.filter(w => w._id !== id));
          showToast("Ucapan berhasil dihapus.", "success");
        } else {
          showToast("Gagal menghapus ucapan.", "error");
        }
      } catch (e) {
        console.error(e);
        showToast("Terjadi kesalahan saat menghapus.", "error");
      }
    });
  };

  const handleClearWishes = async () => {
    showConfirm("⚠️ PERINGATAN: Hapus SEMUA ucapan? Tindakan ini tidak dapat dibatalkan!", async () => {
      try {
        const res = await fetch("/api/admin/wishes", { method: "DELETE" });
        if (res.ok) {
          setWishes([]);
          showToast("Semua ucapan berhasil dihapus.", "success");
        } else {
          showToast("Gagal menghapus semua ucapan.", "error");
        }
      } catch (e) {
        console.error(e);
        showToast("Terjadi kesalahan.", "error");
      }
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        showToast("Pengaturan undangan berhasil disimpan! ✨", "success");
      } else {
        showToast("Gagal menyimpan pengaturan.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateField = (path: string, value: any) => {
    if (!settings) return;
    setSettings((prev: any) => {
      const updated = { ...prev };
      const keys = path.split(".");
      if (keys.length === 3) {
        updated[keys[0]] = {
          ...updated[keys[0]],
          [keys[1]]: {
            ...updated[keys[0]][keys[1]],
            [keys[2]]: value,
          },
        };
      } else if (keys.length === 2) {
        updated[keys[0]] = {
          ...updated[keys[0]],
          [keys[1]]: value,
        };
      } else {
        updated[path] = value;
      }
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleUpdateField(path, data.url);
        showToast(`File ${file.name} berhasil diunggah!`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Gagal mengunggah file.", "error");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Error mengunggah file.", "error");
    }
  };

  const handleAddBankAccount = () => {
    if (!settings) return;
    const currentGift = settings.weddingGift || { enabled: true, qrisImage: "", qrisOwnerName: "", bankAccounts: [] };
    const newAccounts = [...(currentGift.bankAccounts || []), { bankName: "BCA", accountNumber: "", accountHolderName: "" }];
    handleUpdateField("weddingGift.bankAccounts", newAccounts);
  };

  const handleUpdateBankAccount = (index: number, field: string, value: any) => {
    if (!settings) return;
    const currentGift = settings.weddingGift || { enabled: true, qrisImage: "", qrisOwnerName: "", bankAccounts: [] };
    const newAccounts = (currentGift.bankAccounts || []).map((acc: any, idx: number) => {
      if (idx === index) {
        return { ...acc, [field]: value };
      }
      return acc;
    });
    handleUpdateField("weddingGift.bankAccounts", newAccounts);
  };

  const handleDeleteBankAccount = (index: number) => {
    if (!settings) return;
    const currentGift = settings.weddingGift || { enabled: true, qrisImage: "", qrisOwnerName: "", bankAccounts: [] };
    const newAccounts = (currentGift.bankAccounts || []).filter((_: any, idx: number) => idx !== index);
    handleUpdateField("weddingGift.bankAccounts", newAccounts);
  };

  const handleQRISUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleUpdateField("weddingGift.qrisImage", data.url);
        showToast("Gambar QRIS berhasil diunggah!", "success");
      } else {
        showToast("Gagal mengunggah QRIS.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error mengunggah QRIS.", "error");
    }
  };

  const handleDeleteQRIS = () => {
    handleUpdateField("weddingGift.qrisImage", "");
  };

  const handleUpdateGalleryImage = (index: number, value: string) => {
    if (!settings) return;
    setSettings((prev: any) => {
      const updatedImages = [...(prev.galleryImages || [])];
      while (updatedImages.length < 9) {
        updatedImages.push("");
      }
      updatedImages[index] = value;
      return {
        ...prev,
        galleryImages: updatedImages
      };
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        handleUpdateGalleryImage(index, data.url);
        showToast(`Foto ${file.name} berhasil diunggah!`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Gagal mengunggah foto.", "error");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Error mengunggah foto.", "error");
    }
  };

  // Guest Management Methods
  const handleOpenGuestModal = (guest: Partial<Guest> | null = null) => {
    setCurrentEditingGuest(guest || { name: "", phone: "", status: "Belum Dikirim" });
    setIsGuestModalOpen(true);
  };

  const handleSaveGuest = async () => {
    if (!currentEditingGuest || !currentEditingGuest.name) {
      showToast("Nama tamu harus diisi!", "error");
      return;
    }

    try {
      const isEdit = !!currentEditingGuest._id;
      const url = isEdit ? `/api/admin/guests/${currentEditingGuest._id}` : "/api/admin/guests";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEditingGuest),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setGuests(prev => prev.map(g => g._id === saved._id ? saved : g));
          showToast("Data tamu berhasil diperbarui.", "success");
        } else {
          setGuests(prev => [saved, ...prev]);
          showToast("Tamu baru berhasil ditambahkan! 🎉", "success");
        }
        setIsGuestModalOpen(false);
        setCurrentEditingGuest(null);
      } else {
        showToast("Gagal menyimpan data tamu.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error menyimpan tamu.", "error");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus tamu ini?", async () => {
      try {
        const res = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
        if (res.ok) {
          setGuests(prev => prev.filter(g => g._id !== id));
          showToast("Tamu berhasil dihapus.", "success");
        } else {
          showToast("Gagal menghapus tamu.", "error");
        }
      } catch (error) {
        console.error(error);
        showToast("Terjadi kesalahan saat menghapus.", "error");
      }
    });
  };

  const handleBulkDeleteGuests = async () => {
    if (selectedGuests.length === 0) return;
    showConfirm(`Apakah Anda yakin ingin menghapus ${selectedGuests.length} tamu?`, async () => {
      try {
        const res = await fetch("/api/admin/guests/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedGuests }),
        });
        if (res.ok) {
          setGuests(prev => prev.filter(g => !selectedGuests.includes(g._id)));
          setSelectedGuests([]);
          showToast(`${selectedGuests.length} tamu berhasil dihapus.`, "success");
        } else {
          showToast("Gagal menghapus tamu.", "error");
        }
      } catch (error) {
        console.error(error);
        showToast("Terjadi kesalahan saat menghapus massal.", "error");
      }
    });
  };

  const handleBulkDeleteWishes = async (ids: string[], setSelection: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (ids.length === 0) return;
    showConfirm(`Apakah Anda yakin ingin menghapus ${ids.length} data?`, async () => {
      try {
        const res = await fetch("/api/admin/wishes/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        if (res.ok) {
          setWishes(prev => prev.filter(w => !ids.includes(w._id)));
          setSelection([]);
          showToast(`${ids.length} data berhasil dihapus.`, "success");
        } else {
          showToast("Gagal menghapus data.", "error");
        }
      } catch (error) {
        console.error(error);
        showToast("Terjadi kesalahan saat menghapus massal.", "error");
      }
    });
  };

  const formatPhoneNumber = (phone: string) => {
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return clean;
  };

  const getWhatsAppLink = (guest: Guest) => {
    if (!settings) return "";
    const origin = window.location.origin;
    const inviteLink = `${origin}/?to=${encodeURIComponent(guest.name.toLowerCase()).replace(/%20/g, '+')}`;
    
    let msg = settings.invitationTemplate || "";
    msg = msg.replace(/{nama}/g, guest.name);
    msg = msg.replace(/{link}/g, inviteLink);
    
    return `https://api.whatsapp.com/send?phone=${formatPhoneNumber(guest.phone)}&text=${encodeURIComponent(msg)}`;
  };

  const handleSendWhatsApp = async (guest: Guest) => {
    const waLink = getWhatsAppLink(guest);
    window.open(waLink, "_blank");

    try {
      const res = await fetch(`/api/admin/guests/${guest._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Terkirim", sentAt: new Date().toISOString() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setGuests(prev => prev.map(g => g._id === guest._id ? updated : g));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyLink = (name: string) => {
    const origin = window.location.origin;
    const inviteLink = `${origin}/?to=${encodeURIComponent(name.toLowerCase()).replace(/%20/g, '+')}`;
    navigator.clipboard.writeText(inviteLink);
    showToast("Link undangan berhasil disalin! 📋", "success");
  };

  // Wishes/RSVP export
  const exportWishesToCSV = () => {
    if (wishes.length === 0) return;
    
    const headers = ["Nama", "Kehadiran", "Jumlah Tamu", "Ucapan", "Tanggal"];
    const rows = wishes.map(w => [
      w.name,
      w.attendance,
      w.guests.toString(),
      w.message.replace(/"/g, '""'),
      new Date(w.createdAt).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rsvp_wishes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Guests list
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(guestSearch.toLowerCase()) || 
                          guest.phone.includes(guestSearch);
    const matchesFilter = guestFilter === "all" || guest.status === guestFilter;
    return matchesSearch && matchesFilter;
  });

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white font-legan">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm tracking-widest text-[#8c8c8c] uppercase animate-pulse">Menghubungkan Sesi...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center p-4 font-legan">
        <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          
          <div className="text-center space-y-2 mb-8">
            <div className="h-12 w-12 bg-white text-black font-bold flex items-center justify-center rounded-xl text-xl shadow-lg mx-auto mb-4">
              <FaLock className="w-5 h-5 text-neutral-950" />
            </div>
            <h1 className="font-ovo text-xl tracking-wider uppercase">DASHBOARD AKSES</h1>
            <p className="text-xs text-neutral-400 tracking-wider">Silakan masukkan password untuk mengelola undangan pernikahan.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Kata Sandi (Password)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-white transition-all text-sm tracking-widest text-center font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {loginError && (
                <p className="text-red-400 text-xs mt-2 text-center bg-red-950/20 border border-red-900/20 py-1.5 rounded-lg font-mono">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 transition font-bold rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-x-2 shadow-lg"
            >
              {loggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-black border-black/20 rounded-full animate-spin"></div>
                  <span>Verifikasi...</span>
                </>
              ) : (
                <span>Masuk Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Weddingly Security System</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD (AUTHENTICATED)
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white pb-20 font-legan">
      {/* HEADER NAVBAR */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="h-9 w-9 bg-white text-black font-bold flex items-center justify-center rounded-lg text-lg shadow-lg">
              W
            </div>
            <div>
              <h1 className="font-ovo text-lg tracking-wider">WEDDINGLY ADMIN</h1>
              <p className="text-[10px] text-neutral-400 tracking-widest -mt-1 font-mono uppercase">Control Room</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-2">
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                activeTab === "settings"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <FaCogs className="w-4 h-4" />
              <span>Pengaturan Undangan</span>
            </button>

            <button
              onClick={() => setActiveTab("guests")}
              className={`flex items-center gap-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                activeTab === "guests"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <FaUsers className="w-4 h-4" />
              <span>Daftar Tamu</span>
            </button>

            <button
              onClick={() => setActiveTab("rsvp")}
              className={`flex items-center gap-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                activeTab === "rsvp"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <FaCheckCircle className="w-4 h-4" />
              <span>RSVP</span>
            </button>

            <button
              onClick={() => setActiveTab("wishes")}
              className={`flex items-center gap-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                activeTab === "wishes"
                  ? "bg-white text-black font-semibold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <FaComments className="w-4 h-4" />
              <span>Ucapan</span>
              {wishes.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] h-5 px-1.5 flex items-center justify-center rounded-full font-bold">
                  {wishes.length}
                </span>
              )}
            </button>

            <span className="w-[1px] h-6 bg-neutral-800 mx-2"></span>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-x-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all duration-300 border border-neutral-800"
              title="Lihat Undangan (Buka Tab Baru)"
            >
              <FaEye className="w-4 h-4" />
              <span>Lihat Undangan</span>
            </a>

            <span className="w-[1px] h-6 bg-neutral-800 mx-2"></span>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-sm transition-all"
              title="Keluar (Logout)"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </nav>

          {/* Mobile Menu Button (Garis 3) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-400 hover:text-white p-2 rounded-lg focus:outline-none transition-all duration-200"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <FaTimesCircle className="w-6 h-6 text-white" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`lg:hidden border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-xl px-6 py-4 space-y-3 transition-all duration-300 ease-in-out origin-top overflow-hidden ${
            isMobileMenuOpen 
              ? "max-h-[500px] opacity-100 translate-y-0 visible" 
              : "max-h-0 opacity-0 -translate-y-4 invisible"
          }`}
        >
          <button
            onClick={() => {
              setActiveTab("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-x-3 w-full px-4 py-3 rounded-lg text-sm transition-all ${
              activeTab === "settings"
                ? "bg-white text-black font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <FaCogs className="w-5 h-5" />
            <span>Pengaturan Undangan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("guests");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-x-3 w-full px-4 py-3 rounded-lg text-sm transition-all ${
              activeTab === "guests"
                ? "bg-white text-black font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <FaUsers className="w-5 h-5" />
            <span>Daftar Tamu</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("rsvp");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-x-3 w-full px-4 py-3 rounded-lg text-sm transition-all ${
              activeTab === "rsvp"
                ? "bg-white text-black font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <FaCheckCircle className="w-5 h-5" />
            <span>RSVP</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("wishes");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center gap-x-3 w-full px-4 py-3 rounded-lg text-sm transition-all ${
              activeTab === "wishes"
                ? "bg-white text-black font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <FaComments className="w-5 h-5" />
            <span>Ucapan</span>
            {wishes.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] h-5 px-1.5 flex items-center justify-center rounded-full font-bold ml-auto">
                {wishes.length}
              </span>
            )}
          </button>

          <hr className="border-neutral-800" />

          <a
            href="/"
            target="_blank"
            className="flex items-center gap-x-3 w-full px-4 py-3 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all border border-neutral-800"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaEye className="w-5 h-5" />
            <span>Lihat Undangan</span>
          </a>

          <button
            onClick={() => {
              setIsLogoutModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-sm transition-all"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm tracking-widest text-[#8c8c8c] uppercase animate-pulse">Memuat Data...</p>
          </div>
        ) : (
          <>
        {/* TAB 1: SETTINGS / CUSTOMIZATION */}
        {activeTab === "settings" && settings && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Mobile View Navigation Toggle for settingsSection */}
            <div className="lg:hidden flex items-center justify-between bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-xl backdrop-blur-md w-full">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Navigasi Edit</span>
                <span className="text-sm font-semibold text-white uppercase tracking-wider mt-0.5">
                  {settingsSection === "general" && "Umum & Tanggal"}
                  {settingsSection === "loveJourney" && "Kisah Cinta (Love Journey)"}
                  {settingsSection === "groomBride" && "Mempelai (Groom & Bride)"}
                  {settingsSection === "events" && "Acara & Maps"}
                  {settingsSection === "media" && "Lagu & Foto (Media)"}
                  {settingsSection === "template" && "Template Undangan WA"}
                  {settingsSection === "weddingGift" && "Hadiah / Amplop Digital"}
                </span>
              </div>
              <button
                onClick={() => setIsEditNavOpen(true)}
                className="flex items-center gap-x-2 bg-white text-black hover:bg-neutral-200 transition font-bold px-4 py-2 rounded-lg text-xs shadow-md"
              >
                <FaBars className="w-3.5 h-3.5" />
                <span>Pilih Bagian</span>
              </button>
            </div>

            {/* Drawer Overlay for Mobile Settings Navigation */}
            <div className={`fixed inset-0 z-50 lg:hidden flex transition-all duration-300 ${
              isEditNavOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
            }`}>
              {/* Backdrop */}
              <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                  isEditNavOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setIsEditNavOpen(false)}
              />
              
              {/* Drawer Content */}
              <div className={`relative flex flex-col w-80 max-w-[80vw] h-full bg-neutral-950 border-r border-neutral-800/80 p-6 shadow-2xl transition-transform duration-300 ease-in-out ${
                isEditNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm uppercase text-neutral-400 font-bold tracking-wider">Navigasi Edit</h3>
                  <button 
                    onClick={() => setIsEditNavOpen(false)}
                    className="text-neutral-400 hover:text-white p-1"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2">
                  <button
                    onClick={() => {
                      setSettingsSection("general");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "general"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Umum & Tanggal
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("loveJourney");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "loveJourney"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Kisah Cinta (Love Journey)
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("groomBride");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "groomBride"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Mempelai (Groom & Bride)
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("events");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "events"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Acara & Maps
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("media");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "media"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Lagu & Foto (Media)
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("template");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "template"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Template Undangan WA
                  </button>
                  <button
                    onClick={() => {
                      setSettingsSection("weddingGift");
                      setIsEditNavOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                      settingsSection === "weddingGift"
                        ? "bg-white text-black font-semibold shadow-md"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    Hadiah / Amplop Digital
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar navigation for settings - DESKTOP ONLY */}
            <div className="hidden lg:block lg:col-span-3 space-y-2">
              <h3 className="text-xs uppercase text-neutral-400 font-bold px-3 mb-4 tracking-wider">Navigasi Edit</h3>
              <button
                onClick={() => setSettingsSection("general")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "general"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Umum & Tanggal
              </button>
              <button
                onClick={() => setSettingsSection("loveJourney")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "loveJourney"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Kisah Cinta (Love Journey)
              </button>
              <button
                onClick={() => setSettingsSection("groomBride")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "groomBride"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Mempelai (Groom & Bride)
              </button>
              <button
                onClick={() => setSettingsSection("events")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "events"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Acara & Maps
              </button>
              <button
                onClick={() => setSettingsSection("media")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "media"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Lagu & Foto (Media)
              </button>
              <button
                onClick={() => setSettingsSection("template")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "template"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Template Undangan WA
              </button>
              <button
                onClick={() => setSettingsSection("weddingGift")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  settingsSection === "weddingGift"
                    ? "bg-neutral-800 text-white font-medium border-l-2 border-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                }`}
              >
                Hadiah / Amplop Digital
              </button>
            </div>

            {/* Form settings */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-md">
                
                {/* SECTION: GENERAL */}
                {settingsSection === "general" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-ovo border-b border-neutral-800 pb-3 text-white uppercase tracking-wider">Informasi Umum & Tanggal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Nama Pasangan (Main Title)</label>
                        <input
                          type="text"
                          value={settings.coupleNames}
                          onChange={(e) => handleUpdateField("coupleNames", e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Tanggal Pernikahan (Format Countdown)</label>
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={settings.eventDate ? settings.eventDate.substring(0, 16) : ""}
                            onChange={(e) => handleUpdateField("eventDate", e.target.value)}
                            onClick={(e) => {
                              try {
                                (e.target as any).showPicker();
                              } catch (err) {}
                            }}
                            style={{ colorScheme: "dark" }}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-white transition-all text-sm cursor-pointer"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            <FaCalendarAlt className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300">Bible Verse Slide</h3>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Ayat Alkitab / Kutipan</label>
                        <input
                          type="text"
                          value={settings.bibleVerse}
                          onChange={(e) => handleUpdateField("bibleVerse", e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-all text-sm mb-4"
                        />
                        <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">Isi Kutipan</label>
                        <textarea
                          rows={4}
                          value={settings.bibleVerseContent}
                          onChange={(e) => handleUpdateField("bibleVerseContent", e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION: LOVE JOURNEY (KISAH CINTA) */}
                {settingsSection === "loveJourney" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <h2 className="text-xl font-ovo text-white uppercase tracking-wider">Timeline Kisah Cinta</h2>
                      
                      {/* Add Button (limited to 5) */}
                      {(!settings.timelineCount || settings.timelineCount < 5) && (
                        <button
                          type="button"
                          onClick={() => {
                            const newCount = Math.min((settings.timelineCount || 3) + 1, 5);
                            handleUpdateField("timelineCount", newCount);
                          }}
                          className="flex items-center gap-x-1.5 bg-white text-black hover:bg-neutral-200 transition font-bold px-3 py-1.5 rounded-lg text-xs shadow-md"
                        >
                          <FaPlus />
                          <span>Tambah Kisah</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {Array.from({ length: settings.timelineCount || 3 }).map((_, idx) => {
                        const num = idx + 1;
                        const timelineKey = `timeline_${num}`;
                        const contentKey = `timeline_${num}_content`;
                        return (
                          <div
                            key={num}
                            className="p-4 bg-neutral-950/40 border border-neutral-800/40 rounded-xl space-y-3 relative group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                                Kisah #{num}
                              </span>
                              
                              {/* Delete Button (can delete if count > 1) */}
                              {(settings.timelineCount || 3) > 1 && num === (settings.timelineCount || 3) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCount = Math.max((settings.timelineCount || 3) - 1, 1);
                                    // Clear fields of the deleted section
                                    handleUpdateField(timelineKey, "");
                                    handleUpdateField(contentKey, "");
                                    handleUpdateField("timelineCount", newCount);
                                  }}
                                  className="text-red-400 hover:text-red-300 text-xs flex items-center gap-x-1 transition font-medium"
                                  title="Hapus section cerita ini"
                                >
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-1">
                                <label className="block text-[10px] text-neutral-400 mb-1">Tahun / Waktu (Contoh: JANUARI 2021)</label>
                                <input
                                  type="text"
                                  value={(settings as any)[timelineKey] || ""}
                                  onChange={(e) => handleUpdateField(timelineKey, e.target.value)}
                                  placeholder={`Tahun ${num}`}
                                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] text-neutral-400 mb-1">Isi Cerita</label>
                                <textarea
                                  rows={2}
                                  value={(settings as any)[contentKey] || ""}
                                  onChange={(e) => handleUpdateField(contentKey, e.target.value)}
                                  placeholder={`Cerita kisah ke-${num}...`}
                                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTION: GROOM & BRIDE */}
                {settingsSection === "groomBride" && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-ovo border-b border-neutral-800 pb-3 text-white uppercase tracking-wider">Profil Mempelai</h2>
                    
                    {/* GROOM */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-[#a3a3a3] flex items-center gap-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Mempelai Laki-Laki (Groom)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Nama Lengkap</label>
                          <input
                            type="text"
                            value={settings.groom}
                            onChange={(e) => handleUpdateField("groom", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Nama Panggilan</label>
                          <input
                            type="text"
                            value={settings.groomNickName}
                            onChange={(e) => handleUpdateField("groomNickName", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Instagram Username</label>
                          <input
                            type="text"
                            value={settings.groomInstagram}
                            onChange={(e) => handleUpdateField("groomInstagram", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Gelar Depan (Gelar Sebelum Nama)</label>
                          <input
                            type="text"
                            value={settings.groomTitleFront || ""}
                            onChange={(e) => handleUpdateField("groomTitleFront", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Contoh: Dr., Ir."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Gelar Belakang (Gelar Setelah Nama)</label>
                          <input
                            type="text"
                            value={settings.groomTitleBack || ""}
                            onChange={(e) => handleUpdateField("groomTitleBack", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Contoh: S.T., M.Kom."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Biografi Ringkas</label>
                        <textarea
                          rows={3}
                          value={settings.groomBio}
                          onChange={(e) => handleUpdateField("groomBio", e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* BRIDE */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-[#a3a3a3] flex items-center gap-x-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span> Mempelai Perempuan (Bride)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Nama Lengkap</label>
                          <input
                            type="text"
                            value={settings.bride}
                            onChange={(e) => handleUpdateField("bride", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Nama Panggilan</label>
                          <input
                            type="text"
                            value={settings.brideNickName}
                            onChange={(e) => handleUpdateField("brideNickName", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Instagram Username</label>
                          <input
                            type="text"
                            value={settings.brideInstagram}
                            onChange={(e) => handleUpdateField("brideInstagram", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Gelar Depan (Gelar Sebelum Nama)</label>
                          <input
                            type="text"
                            value={settings.brideTitleFront || ""}
                            onChange={(e) => handleUpdateField("brideTitleFront", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Contoh: dr., Ir."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Gelar Belakang (Gelar Setelah Nama)</label>
                          <input
                            type="text"
                            value={settings.brideTitleBack || ""}
                            onChange={(e) => handleUpdateField("brideTitleBack", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            placeholder="Contoh: S.Ked, M.Si"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-400 mb-1">Biografi Ringkas</label>
                        <textarea
                          rows={3}
                          value={settings.brideBio}
                          onChange={(e) => handleUpdateField("brideBio", e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* THANK YOU DETAIL */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300">Penutup & Ucapan Terima Kasih</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Judul Penutup</label>
                          <input
                            type="text"
                            value={settings.thankyou}
                            onChange={(e) => handleUpdateField("thankyou", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1">Deskripsi Penutup</label>
                          <input
                            type="text"
                            value={settings.thankyouDetail}
                            onChange={(e) => handleUpdateField("thankyouDetail", e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION: EVENTS & MAPS */}
                {settingsSection === "events" && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-ovo border-b border-neutral-800 pb-3 text-white uppercase tracking-wider">Jadwal Acara & Live Streaming</h2>
                    
                    {/* HOLY MATRIMONY */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-neutral-300">Pemberkatan / Holy Matrimony</h3>
                        <label className="flex items-center gap-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={settings.holyMatrimony.enabled}
                            onChange={(e) => handleUpdateField("holyMatrimony.enabled", e.target.checked)}
                            className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Aktifkan Section</span>
                        </label>
                      </div>
                      
                      {settings.holyMatrimony.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Waktu Acara</label>
                            <input
                              type="text"
                              value={settings.holyMatrimony.time}
                              onChange={(e) => handleUpdateField("holyMatrimony.time", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Nama Tempat</label>
                            <input
                              type="text"
                              value={settings.holyMatrimony.place}
                              onChange={(e) => handleUpdateField("holyMatrimony.place", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-400 mb-1">Alamat Lengkap</label>
                            <input
                              type="text"
                              value={settings.holyMatrimony.place_details}
                              onChange={(e) => handleUpdateField("holyMatrimony.place_details", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-400 mb-1">Google Maps Link</label>
                            <input
                              type="text"
                              value={settings.holyMatrimony.googleMapsLink}
                              onChange={(e) => handleUpdateField("holyMatrimony.googleMapsLink", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WEDDING RECEPTION */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-neutral-300">Resepsi Pernikahan (Wedding Reception)</h3>
                        <label className="flex items-center gap-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={settings.weddingReception.enabled}
                            onChange={(e) => handleUpdateField("weddingReception.enabled", e.target.checked)}
                            className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Aktifkan Section</span>
                        </label>
                      </div>

                      {settings.weddingReception.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Waktu Acara</label>
                            <input
                              type="text"
                              value={settings.weddingReception.time}
                              onChange={(e) => handleUpdateField("weddingReception.time", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Nama Tempat</label>
                            <input
                              type="text"
                              value={settings.weddingReception.place}
                              onChange={(e) => handleUpdateField("weddingReception.place", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-400 mb-1">Alamat Lengkap</label>
                            <input
                              type="text"
                              value={settings.weddingReception.place_details}
                              onChange={(e) => handleUpdateField("weddingReception.place_details", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-400 mb-1">Google Maps Link</label>
                            <input
                              type="text"
                              value={settings.weddingReception.googleMapsLink}
                              onChange={(e) => handleUpdateField("weddingReception.googleMapsLink", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LIVE STREAMING */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-neutral-300">Live Streaming Pernikahan</h3>
                        <label className="flex items-center gap-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={settings.livestreaming.enabled}
                            onChange={(e) => handleUpdateField("livestreaming.enabled", e.target.checked)}
                            className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Aktifkan Section</span>
                        </label>
                      </div>

                      {settings.livestreaming.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Jam Streaming</label>
                            <input
                              type="text"
                              value={settings.livestreaming.time}
                              onChange={(e) => handleUpdateField("livestreaming.time", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Link Streaming Youtube/Zoom</label>
                            <input
                              type="text"
                              value={settings.livestreaming.link}
                              onChange={(e) => handleUpdateField("livestreaming.link", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-neutral-400 mb-1">Deskripsi Live Streaming</label>
                            <input
                              type="text"
                              value={settings.livestreaming.detail}
                              onChange={(e) => handleUpdateField("livestreaming.detail", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PREWEDDING VIDEO */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase text-neutral-300">Video Prewedding (Embed)</h3>
                        <label className="flex items-center gap-x-2 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={settings.prewedding.enabled}
                            onChange={(e) => handleUpdateField("prewedding.enabled", e.target.checked)}
                            className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Aktifkan Section</span>
                        </label>
                      </div>

                      {settings.prewedding.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/40">
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Youtube Video Code (Contoh: YkO-e-gyp58)</label>
                            <input
                              type="text"
                              value={settings.prewedding.link}
                              onChange={(e) => handleUpdateField("prewedding.link", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-400 mb-1">Keterangan / Caption Video</label>
                            <input
                              type="text"
                              value={settings.prewedding.detail}
                              onChange={(e) => handleUpdateField("prewedding.detail", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION: MEDIA (MUSIC & IMAGES) */}
                {settingsSection === "media" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-ovo border-b border-neutral-800 pb-3 text-white uppercase tracking-wider">Unggah Lagu & Foto</h2>
                    
                    {/* BACKGROUND MUSIC */}
                    <div className="p-4 bg-neutral-950/40 rounded-xl border border-neutral-800/40 space-y-4">
                      <div className="flex items-center gap-x-2 text-neutral-300 font-semibold text-sm">
                        <FaMusic /> <span>Musik Latar (Background Music)</span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="text-xs text-neutral-400">
                          <p>File audio yang diputar otomatis ketika undangan dibuka.</p>
                          <p className="mt-1 font-mono text-neutral-300">File Aktif: {settings.musicPath}</p>
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="audio/mp3"
                            id="music-uploader"
                            onChange={(e) => handleFileUpload(e, "musicPath")}
                            className="hidden"
                          />
                          <label
                            htmlFor="music-uploader"
                            className="bg-neutral-800 hover:bg-neutral-700 text-xs px-4 py-2 rounded-lg cursor-pointer inline-block transition font-semibold"
                          >
                            Pilih File MP3
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SLIDES IMAGES */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300 flex items-center gap-x-2">
                        <FaImage /> <span>Gambar & Foto Galeri Slide</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* SIDE IMAGE */}
                        <div className="bg-neutral-950/40 border border-neutral-800/40 p-4 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-xs font-semibold text-neutral-400 block mb-2 uppercase">Desktop Side Banner</span>
                            <div className="w-full h-32 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden mb-3">
                              {settings.slideImages.sideImage ? (
                                <img src={settings.slideImages.sideImage} alt="side" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-neutral-600 text-xs">No Image Loaded</span>
                              )}
                            </div>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            id="side-image-uploader"
                            onChange={(e) => handleFileUpload(e, "slideImages.sideImage")}
                            className="hidden"
                          />
                          <label
                            htmlFor="side-image-uploader"
                            className="w-full text-center bg-neutral-800 hover:bg-neutral-700 text-xs py-1.5 rounded-lg cursor-pointer transition font-medium"
                          >
                            Ubah Foto Samping
                          </label>
                        </div>

                        {/* SLIDES GENERATOR LOOP */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                          const slideKey = `slide${num}`;
                          const slideVal = (settings.slideImages as any)[slideKey];
                          return (
                            <div key={num} className="bg-neutral-950/40 border border-neutral-800/40 p-4 rounded-xl flex flex-col justify-between">
                              <div>
                                <span className="text-xs font-semibold text-neutral-400 block mb-2 uppercase">Slide Background {num}</span>
                                <div className="w-full h-32 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden mb-3">
                                  {slideVal ? (
                                    <img src={slideVal} alt={`Slide ${num}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-neutral-600 text-xs">No Image Loaded</span>
                                  )}
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                id={`slide-${num}-uploader`}
                                onChange={(e) => handleFileUpload(e, `slideImages.${slideKey}`)}
                                className="hidden"
                              />
                              <label
                                htmlFor={`slide-${num}-uploader`}
                                className="w-full text-center bg-neutral-800 hover:bg-neutral-700 text-xs py-1.5 rounded-lg cursor-pointer transition font-medium"
                              >
                                Ubah Background
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* GALERI FOTO */}
                    <div className="border-t border-neutral-800/60 pt-6 space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-neutral-300 flex items-center gap-x-2">
                        <FaImage /> <span>Foto Galeri (Foto 1 - 9)</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                          const galleryImages = settings.galleryImages || [];
                          const imgVal = galleryImages[idx] || "";
                          return (
                            <div key={idx} className="bg-neutral-950/40 border border-neutral-800/40 p-4 rounded-xl flex flex-col justify-between animate-fadeIn">
                              <div>
                                <span className="text-xs font-semibold text-neutral-400 block mb-2 uppercase">Foto Galeri {idx + 1}</span>
                                <div className="w-full h-32 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden mb-3">
                                  {imgVal ? (
                                    <img src={imgVal} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-neutral-600 text-xs">No Image Loaded</span>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={imgVal}
                                  onChange={(e) => handleUpdateGalleryImage(idx, e.target.value)}
                                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-white focus:outline-none focus:border-white transition-all text-xs font-mono"
                                  placeholder="URL Gambar..."
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`gallery-${idx}-uploader`}
                                  onChange={(e) => handleGalleryUpload(e, idx)}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`gallery-${idx}-uploader`}
                                  className="w-full text-center bg-neutral-800 hover:bg-neutral-700 text-xs py-1.5 rounded-lg cursor-pointer transition font-medium block"
                                >
                                  Ubah Foto
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION: INVITATION MESSAGE TEMPLATE */}
                {settingsSection === "template" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-ovo border-b border-neutral-800 pb-3 text-white uppercase tracking-wider">Template Pesan WhatsApp</h2>
                    
                    <div className="bg-neutral-950/50 border border-neutral-800/80 p-4 rounded-xl text-xs space-y-2 leading-relaxed text-neutral-300">
                      <p className="font-semibold flex items-center gap-x-2 text-white">
                        <FaInfoCircle className="text-blue-400 text-sm" /> PETUNJUK PENGGUNAAN TAG TEMPLATE:
                      </p>
                      <p>Gunakan tag dinamis berikut di dalam template pesan Anda. Tag akan otomatis diganti ketika pesan dikirimkan:</p>
                      <ul className="list-disc pl-4 space-y-1 font-mono text-neutral-400">
                        <li><strong className="text-white">{"{nama}"}</strong> : Nama dari tamu (misal: Budi Santoso)</li>
                        <li><strong className="text-white">{"{link}"}</strong> : Link undangan tamu tersebut (misal: http://domain.com/?to=Budi%20Santoso)</li>
                      </ul>
                      <p className="mt-2 text-neutral-500">Anda dapat memformat pesan menggunakan cetak tebal (*teks*), miring (_teks_), atau coret (~teks~) yang didukung oleh WhatsApp.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide">Template Pesan Undang</label>
                      <textarea
                        rows={12}
                        value={settings.invitationTemplate}
                        onChange={(e) => handleUpdateField("invitationTemplate", e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white font-mono leading-relaxed"
                        placeholder="Tulis template pesan di sini..."
                      />
                    </div>
                  </div>
                )}

                {/* SECTION: WEDDING GIFT / AMPLOP DIGITAL */}
                {settingsSection === "weddingGift" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                      <h2 className="text-xl font-ovo text-white uppercase tracking-wider">Hadiah & Amplop Digital</h2>
                      <label className="flex items-center gap-x-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={settings.weddingGift?.enabled ?? true}
                          onChange={(e) => handleUpdateField("weddingGift.enabled", e.target.checked)}
                          className="rounded bg-neutral-950 border-neutral-800 text-white focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Aktifkan Section</span>
                      </label>
                    </div>

                    {(settings.weddingGift?.enabled ?? true) && (
                      <div className="space-y-8 animate-fadeIn">
                        {/* QRIS UPLOAD SECTION */}
                        <div className="p-4 bg-neutral-950/40 border border-neutral-800/40 rounded-xl space-y-4">
                          <h3 className="text-sm font-semibold uppercase text-neutral-300 flex items-center gap-x-2">
                            <span>1. Pengaturan QRIS</span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-4 flex flex-col items-center justify-center">
                              {/* Strict 1:1 image frame constraint */}
                              <div className="w-40 h-40 rounded-xl bg-neutral-900 border-2 border-dashed border-neutral-800 flex items-center justify-center overflow-hidden relative group p-2">
                                {settings.weddingGift?.qrisImage ? (
                                  <img
                                    src={settings.weddingGift.qrisImage}
                                    alt="QRIS Preview"
                                    className="w-full h-full object-contain aspect-square rounded-lg"
                                  />
                                ) : (
                                  <span className="text-neutral-600 text-xs text-center px-4">QRIS Belum Diunggah</span>
                                )}
                              </div>
                            </div>

                            <div className="md:col-span-8 space-y-4">
                              <div>
                                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wide">Nama Pemilik Akun QRIS</label>
                                <input
                                  type="text"
                                  value={settings.weddingGift?.qrisOwnerName || ""}
                                  onChange={(e) => handleUpdateField("weddingGift.qrisOwnerName", e.target.value)}
                                  placeholder="Contoh: Edward & Dian"
                                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  id="qris-uploader"
                                  onChange={handleQRISUpload}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="qris-uploader"
                                  className="bg-white text-black hover:bg-neutral-200 transition font-bold px-4 py-2 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                                >
                                  Upload / Ganti Gambar QRIS
                                </label>
                                {settings.weddingGift?.qrisImage && (
                                  <button
                                    type="button"
                                    onClick={handleDeleteQRIS}
                                    className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/20 transition font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
                                  >
                                    Hapus QRIS
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BANK ACCOUNTS SECTION */}
                        <div className="p-4 bg-neutral-950/40 border border-neutral-800/40 rounded-xl space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold uppercase text-neutral-300 flex items-center gap-x-2">
                              <span>2. Rekening Bank Transfer</span>
                            </h3>
                            <button
                              type="button"
                              onClick={handleAddBankAccount}
                              className="flex items-center gap-x-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition"
                            >
                              <FaPlus className="w-3.5 h-3.5" />
                              <span>Tambah Bank</span>
                            </button>
                          </div>

                          <div className="space-y-4">
                            {(settings.weddingGift?.bankAccounts || []).length === 0 ? (
                              <p className="text-xs text-neutral-500 text-center py-4">Belum ada rekening bank yang ditambahkan.</p>
                            ) : (
                              (settings.weddingGift?.bankAccounts || []).map((acc: any, idx: number) => (
                                <div key={idx} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4 relative group animate-fadeIn">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Rekening #{idx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBankAccount(idx)}
                                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-x-1 transition font-medium"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-[10px] text-neutral-400 mb-1 uppercase">Nama Bank</label>
                                      <select
                                        value={acc.bankName || ""}
                                        onChange={(e) => handleUpdateBankAccount(idx, "bankName", e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                                      >
                                        <option value="BCA">BCA</option>
                                        <option value="BRI">BRI</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="BNI">BNI</option>
                                        <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                                        {acc.bankName && acc.bankName !== "BCA" && acc.bankName !== "BRI" && acc.bankName !== "Mandiri" && acc.bankName !== "BNI" && acc.bankName !== "BSI" && acc.bankName !== "Lainnya" && (
                                          <option value={acc.bankName}>{acc.bankName}</option>
                                        )}
                                        <option value="Lainnya">Lainnya (Tulis Manual)</option>
                                      </select>
                                      {acc.bankName !== "BCA" && acc.bankName !== "BRI" && acc.bankName !== "Mandiri" && acc.bankName !== "BNI" && acc.bankName !== "BSI" && (
                                        <input
                                          type="text"
                                          value={acc.bankName === "Lainnya" ? "" : (acc.bankName || "")}
                                          onChange={(e) => handleUpdateBankAccount(idx, "bankName", e.target.value)}
                                          placeholder="Tulis Nama Bank..."
                                          className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-1.5 mt-2 text-xs text-white animate-fadeIn"
                                        />
                                      )}
                                    </div>

                                    <div>
                                      <label className="block text-[10px] text-neutral-400 mb-1 uppercase">Nomor Rekening</label>
                                      <input
                                        type="text"
                                        value={acc.accountNumber || ""}
                                        onChange={(e) => handleUpdateBankAccount(idx, "accountNumber", e.target.value)}
                                        placeholder="Nomor rekening bank..."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] text-neutral-400 mb-1 uppercase">Nama Pemilik Rekening</label>
                                      <input
                                        type="text"
                                        value={acc.accountHolderName || ""}
                                        onChange={(e) => handleUpdateBankAccount(idx, "accountHolderName", e.target.value)}
                                        placeholder="Nama A/n..."
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM SAVE BUTTON FOR SETTINGS */}
                <div className="border-t border-neutral-800/80 mt-8 pt-6 flex justify-end">
                  <button
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={savingSettings}
                    className="flex items-center gap-x-2 bg-white text-black hover:bg-neutral-200 transition font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {savingSettings ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-black border-black/20 rounded-full animate-spin"></div>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Preview (Mobile Device mockup) */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live Preview</span>
                  </span>
                  
                  <button
                    onClick={() => {
                      const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
                      if (iframe) iframe.src = iframe.src;
                    }}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-x-1 transition font-medium"
                    title="Refresh Preview"
                  >
                    <span>Refresh</span>
                  </button>
                </div>

                {/* iPhone Mockup Frame */}
                <div className="relative mx-auto border-neutral-800 bg-neutral-950 border-[10px] rounded-[2rem] h-[580px] w-[270px] shadow-2xl overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-neutral-950 z-20 flex justify-center items-center">
                    <div className="w-20 h-2 bg-black rounded-full"></div>
                  </div>
                  
                  <div 
                    className="absolute top-0 left-0 origin-top-left bg-black"
                    style={{ 
                      width: '375px', 
                      height: '840px', 
                      transform: 'scale(0.666667)' 
                    }}
                  >
                    <iframe
                      id="preview-iframe"
                      src="/?preview=true"
                      onLoad={() => {
                        if (settings) {
                          const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
                          if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage({
                              type: "UPDATE_PREVIEW",
                              settings: settings
                            }, "*");
                          }
                        }
                      }}
                      className="w-full h-full border-none pt-4"
                    ></iframe>
                  </div>
                </div>
                <p className="text-[10px] text-center text-neutral-500 uppercase tracking-wider">Tampilan pratinjau mobile (Bypass timer)</p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: GUEST MANAGEMENT */}
        {activeTab === "guests" && (
          <div className="space-y-6">
            
            {/* Header controls for Guests */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-ovo text-white uppercase tracking-wider">Daftar Undangan Tamu</h2>
                <p className="text-xs text-neutral-400">Total Tamu: {guests.length} | Terkirim: {guests.filter(g => g.status === "Terkirim").length} | Belum Dikirim: {guests.filter(g => g.status === "Belum Dikirim").length}</p>
              </div>

              <div className="flex gap-x-2">
                <button
                  onClick={() => fetchInitialData(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-x-2 bg-neutral-900/60 hover:bg-neutral-800 text-white border border-neutral-700 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md disabled:opacity-50"
                >
                  <FaSync className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden md:inline">{isRefreshing ? "Menyegarkan..." : "Refresh"}</span>
                </button>
                <button
                  onClick={() => handleOpenGuestModal()}
                  className="flex items-center gap-x-2 bg-white text-black hover:bg-neutral-200 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                >
                  <FaPlus />
                  <span>Tambah Tamu</span>
                </button>
                <button
                  onClick={() => {
                    setBulkGuestText("");
                    setIsBulkGuestModalOpen(true);
                  }}
                  className="flex items-center gap-x-2 bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-600 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                >
                  <FaPlus />
                  <span>Tambah Banyak (Bulk)</span>
                </button>
                {selectedGuests.length > 0 && (
                  <button
                    onClick={handleBulkDeleteGuests}
                    className="flex items-center gap-x-2 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Hapus {selectedGuests.length} Data</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filters and search bar */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
              <div className="w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="Cari nama atau nomor telepon..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-all text-sm"
                />
              </div>

              <div className="flex gap-x-2 w-full md:w-auto">
                <button
                  onClick={() => setGuestFilter("all")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs transition ${
                    guestFilter === "all" ? "bg-white text-black font-semibold" : "text-neutral-400 bg-neutral-950 border border-neutral-800 hover:text-white"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setGuestFilter("Belum Dikirim")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs transition ${
                    guestFilter === "Belum Dikirim" ? "bg-white text-black font-semibold" : "text-neutral-400 bg-neutral-950 border border-neutral-800 hover:text-white"
                  }`}
                >
                  Belum Dikirim
                </button>
                <button
                  onClick={() => setGuestFilter("Terkirim")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs transition ${
                    guestFilter === "Terkirim" ? "bg-white text-black font-semibold" : "text-neutral-400 bg-neutral-950 border border-neutral-800 hover:text-white"
                  }`}
                >
                  Terkirim
                </button>
              </div>
            </div>

            {/* Guests Table */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/40 text-neutral-400 font-semibold">
                      <th className="px-6 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={filteredGuests.length > 0 && selectedGuests.length === filteredGuests.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGuests(filteredGuests.map(g => g._id));
                            } else {
                              setSelectedGuests([]);
                            }
                          }}
                          className="rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                        />
                      </th>
                      <th className="px-6 py-4">Nama Tamu</th>
                      <th className="px-6 py-4">Nomor WhatsApp</th>
                      <th className="px-6 py-4">Link Undangan</th>
                      <th className="px-6 py-4 text-center">Status Kirim</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-legan">
                          Tidak ada data tamu yang cocok dengan filter atau pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((guest) => {
                        const guestInviteUrl = `/?to=${encodeURIComponent(guest.name.toLowerCase()).replace(/%20/g, '+')}`;
                        return (
                          <tr key={guest._id} className="hover:bg-neutral-950/20 transition-all">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedGuests.includes(guest._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGuests(prev => [...prev, guest._id]);
                                  } else {
                                    setSelectedGuests(prev => prev.filter(id => id !== guest._id));
                                  }
                                }}
                                className="rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-white">{guest.name}</td>
                            <td className="px-6 py-4 text-neutral-300 font-mono">{guest.phone}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-x-2 group">
                                <span className="text-xs text-neutral-400 truncate max-w-[200px] font-mono">
                                  {guestInviteUrl}
                                </span>
                                <button
                                  onClick={() => handleCopyLink(guest.name)}
                                  className="text-neutral-500 hover:text-white transition p-1"
                                  title="Copy Link"
                                >
                                  <FaCopy className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={guestInviteUrl}
                                  target="_blank"
                                  className="text-neutral-500 hover:text-white transition p-1"
                                  title="View Invitation"
                                >
                                  <FaExternalLinkAlt className="w-3 h-3" />
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {guest.status === "Terkirim" ? (
                                <span className="inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <FaCheckCircle className="w-3 h-3" />
                                  <span>Terkirim</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <FaHourglassHalf className="w-3 h-3 animate-pulse" />
                                  <span>Belum Dikirim</span>
                                </span>
                              )}
                              {guest.sentAt && (
                                <span className="block text-[10px] text-neutral-500 mt-1 font-mono">
                                  {new Date(guest.sentAt).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-x-2">
                                <button
                                  onClick={() => handleSendWhatsApp(guest)}
                                  className="flex items-center gap-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition shadow shadow-emerald-700/25"
                                  title="Kirim Undangan WA"
                                >
                                  <FaWhatsapp className="w-3.5 h-3.5" />
                                  <span>Kirim</span>
                                </button>

                                <button
                                  onClick={() => handleOpenGuestModal(guest)}
                                  className="p-2 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 transition"
                                  title="Edit Tamu"
                                >
                                  <FaEdit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteGuest(guest._id)}
                                  className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-900 rounded-lg transition"
                                  title="Hapus Tamu"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RSVP */}
        {activeTab === "rsvp" && (
          <div className="space-y-8">
            
            {/* RSVP SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-ovo text-white uppercase tracking-wider">Kehadiran (RSVP)</h2>
                  <p className="text-xs text-neutral-400">Total Tamu Merespon: {wishes.length}</p>
                </div>
                <div className="flex gap-x-2">
                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-x-2 bg-neutral-900/60 hover:bg-neutral-800 text-white border border-neutral-700 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md disabled:opacity-50"
                  >
                    <FaSync className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="hidden md:inline">{isRefreshing ? "Menyegarkan..." : "Refresh"}</span>
                  </button>
                  {wishes.length > 0 && (
                    <button
                      onClick={exportWishesToCSV}
                      className="flex items-center gap-x-2 bg-white text-black hover:bg-neutral-200 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                    >
                      <FaFileCsv className="w-4 h-4" />
                      <span>Ekspor Ke CSV</span>
                    </button>
                  )}
                  {selectedRsvps.length > 0 && (
                    <button
                      onClick={() => handleBulkDeleteWishes(selectedRsvps, setSelectedRsvps)}
                      className="flex items-center gap-x-2 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span>Hapus {selectedRsvps.length} Data</span>
                    </button>
                  )}
                </div>
              </div>

              {/* RSVP Counters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Hadir</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {wishes.filter(w => w.attendance === "Hadir").reduce((sum, w) => sum + (Number(w.guests) || 0), 0)}
                    </p>
                  </div>
                  <FaCheckCircle className="text-green-500 w-8 h-8 opacity-50" />
                </div>
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Tidak Hadir</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {wishes.filter(w => w.attendance === "Tidak Hadir").length}
                    </p>
                  </div>
                  <FaTimesCircle className="text-red-500 w-8 h-8 opacity-50" />
                </div>
              </div>

              {/* RSVP Table */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden backdrop-blur-md p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                        <th className="pb-3 font-semibold w-12">
                          <input
                            type="checkbox"
                            checked={wishes.length > 0 && selectedRsvps.length === wishes.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRsvps(wishes.map(w => w._id));
                              } else {
                                setSelectedRsvps([]);
                              }
                            }}
                            className="rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                          />
                        </th>
                        <th className="pb-3 font-semibold w-1/3">Nama</th>
                        <th className="pb-3 font-semibold">Kehadiran</th>
                        <th className="pb-3 font-semibold">Jumlah Tamu</th>
                        <th className="pb-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-sm text-neutral-300">
                      {wishes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-neutral-500">Belum ada respon RSVP</td>
                        </tr>
                      ) : (
                        wishes.map((wish) => (
                          <tr key={`rsvp-${wish._id}`} className="hover:bg-neutral-800/20 transition-colors">
                            <td className="py-3">
                              <input
                                type="checkbox"
                                checked={selectedRsvps.includes(wish._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRsvps(prev => [...prev, wish._id]);
                                  } else {
                                    setSelectedRsvps(prev => prev.filter(id => id !== wish._id));
                                  }
                                }}
                                className="rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                              />
                            </td>
                            <td className="py-3 font-medium text-white">{wish.name}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                wish.attendance === "Hadir" ? "bg-green-500/20 text-green-400" :
                                wish.attendance === "Tidak Hadir" ? "bg-red-500/20 text-red-400" :
                                wish.attendance === "Masih Ragu" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-neutral-500/20 text-neutral-400"
                              }`}>
                                {wish.attendance}
                              </span>
                            </td>
                            <td className="py-3">{wish.guests} Orang</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleDeleteWish(wish._id)}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-900 rounded-lg transition"
                                title="Hapus RSVP"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WISHES */}
        {activeTab === "wishes" && (
          <div className="space-y-8">

            {/* WISHES SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-ovo text-white uppercase tracking-wider">Ucapan & Doa Restu</h2>
                </div>
                <div className="flex gap-x-2">
                  <button
                    onClick={() => fetchInitialData(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-x-2 bg-neutral-900/60 hover:bg-neutral-800 text-white border border-neutral-700 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md disabled:opacity-50"
                  >
                    <FaSync className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    <span className="hidden md:inline">{isRefreshing ? "Menyegarkan..." : "Refresh"}</span>
                  </button>
                  {wishes.length > 0 && (
                    <button
                      onClick={selectedWishes.length > 0 ? () => handleBulkDeleteWishes(selectedWishes, setSelectedWishes) : handleClearWishes}
                      className="flex items-center gap-x-2 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition font-bold px-4 py-2 rounded-lg text-sm shadow-md"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span className="hidden md:inline">{selectedWishes.length > 0 ? `Hapus ${selectedWishes.length} Data` : "Hapus Semua"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Wishes list */}
              <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden backdrop-blur-md p-6">
                <div className="mb-4 flex items-center">
                  <label className="flex items-center gap-x-2 text-sm text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wishes.filter(w => w.message && w.message.trim() !== "").length > 0 && selectedWishes.length === wishes.filter(w => w.message && w.message.trim() !== "").length}
                      onChange={(e) => {
                        const validWishes = wishes.filter(w => w.message && w.message.trim() !== "");
                        if (e.target.checked) {
                          setSelectedWishes(validWishes.map(w => w._id));
                        } else {
                          setSelectedWishes([]);
                        }
                      }}
                      className="rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                    />
                    <span>Pilih Semua Ucapan</span>
                  </label>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 divide-y divide-neutral-800/60">
                  {wishes.filter(w => w.message && w.message.trim() !== "").length === 0 ? (
                    <p className="text-neutral-500 text-center py-10">Belum ada ucapan yang masuk.</p>
                  ) : (
                    wishes.filter(w => w.message && w.message.trim() !== "").map((wish, index) => (
                      <div key={wish._id} className={`pt-4 ${index === 0 ? "pt-0" : ""} flex flex-col md:flex-row md:items-center justify-between gap-4 group`}>
                        <div className="flex items-start gap-x-4">
                          <input
                            type="checkbox"
                            checked={selectedWishes.includes(wish._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWishes(prev => [...prev, wish._id]);
                              } else {
                                setSelectedWishes(prev => prev.filter(id => id !== wish._id));
                              }
                            }}
                            className="mt-1 rounded bg-neutral-900 border-neutral-700 text-neutral-500 focus:ring-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-x-2">
                              <strong className="text-white text-sm">{wish.name}</strong>
                            </div>
                          <p className="text-xs text-neutral-400 font-mono">
                            {new Date(wish.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-300 italic pt-1">
                            &ldquo;{wish.message}&rdquo;
                          </p>
                        </div>
                        </div>
                        <div className="shrink-0 flex items-center">
                          <button
                            onClick={() => handleDeleteWish(wish._id)}
                            className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-900 rounded-lg transition"
                            title="Hapus Ucapan"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

      </main>

      {/* GUEST ADD/EDIT MODAL */}
      {isGuestModalOpen && currentEditingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-ovo text-base text-white uppercase tracking-wider">
                {currentEditingGuest._id ? "Edit Data Tamu" : "Tambah Tamu Undangan"}
              </h3>
              <button
                onClick={() => setIsGuestModalOpen(false)}
                className="text-neutral-500 hover:text-white transition text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wide">Nama Tamu</label>
                <input
                  type="text"
                  value={currentEditingGuest.name || ""}
                  onChange={(e) => setCurrentEditingGuest(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition text-sm font-legan"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wide">Nomor WhatsApp <span className="text-neutral-500 lowercase normal-case">(Opsional)</span></label>
                <input
                  type="text"
                  value={currentEditingGuest.phone || ""}
                  onChange={(e) => setCurrentEditingGuest(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition text-sm font-mono"
                  placeholder="Contoh: 08123456789 atau 628123456789"
                />
                <span className="block text-[10px] text-neutral-500 mt-1">Saran: Gunakan format angka tanpa spasi atau karakter khusus.</span>
              </div>
            </div>

            <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-x-2">
              <button
                onClick={() => setIsGuestModalOpen(false)}
                className="px-4 py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs transition font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGuest}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs transition font-bold shadow"
              >
                Simpan Tamu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK GUEST ADD MODAL */}
      {isBulkGuestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-ovo text-base text-white uppercase tracking-wider">
                Tambah Banyak Tamu (Bulk)
              </h3>
              <button
                onClick={() => setIsBulkGuestModalOpen(false)}
                className="text-neutral-500 hover:text-white transition text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wide">Daftar Nama Tamu</label>
                <p className="text-[11px] text-neutral-500 mb-2 leading-relaxed">
                  Masukkan nama tamu, pisahkan setiap nama dengan enter (baris baru). Contoh:<br/>
                  Steven Mandey & Sheryl Karnoto<br/>
                  Amanda Rumenser & Brian
                </p>
                <textarea
                  value={bulkGuestText}
                  onChange={(e) => setBulkGuestText(e.target.value)}
                  className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition text-sm font-legan resize-none"
                  placeholder="Steven Mandey & Sheryl Karnoto&#10;Amanda Rumenser & Brian&#10;Reyvaldi Manulang & Gaileen"
                ></textarea>
              </div>
            </div>

            <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-x-2">
              <button
                onClick={() => setIsBulkGuestModalOpen(false)}
                className="px-4 py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs transition font-semibold"
                disabled={isSavingBulk}
              >
                Batal
              </button>
              <button
                onClick={handleSaveBulkGuests}
                disabled={isSavingBulk}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs transition font-bold shadow disabled:opacity-50"
              >
                {isSavingBulk ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVE SETTINGS CONFIRMATION MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-ovo text-base text-white uppercase tracking-wider flex items-center gap-x-2">
                <FaLock className="text-amber-500 w-4 h-4" />
                <span>Konfirmasi Simpan</span>
              </h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-neutral-500 hover:text-white transition text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-[#CCCCCC] leading-relaxed">
                Apakah Anda yakin ingin menyimpan seluruh perubahan pengaturan undangan pernikahan ini? Perubahan akan langsung diterapkan pada halaman undangan tamu.
              </p>
            </div>

            <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-x-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs transition font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsSaveModalOpen(false);
                  handleSaveSettings();
                }}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs transition font-bold shadow"
              >
                Ya, Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN SAVING LOADING OVERLAY */}
      {savingSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-t-white border-white/20 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm tracking-widest text-[#8c8c8c] uppercase animate-pulse">Menyimpan pengaturan...</p>
          </div>
        </div>
      )}
      {/* LOGOUT CONFIRMATION MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-ovo text-base text-white uppercase tracking-wider flex items-center gap-x-2">
                <FaLock className="text-red-500 w-4 h-4" />
                <span>Konfirmasi Keluar</span>
              </h3>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-neutral-500 hover:text-white transition text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-[#CCCCCC] leading-relaxed">
                Apakah Anda yakin ingin keluar dari dashboard kelola? Sesi Anda akan berakhir dan Anda perlu memasukkan password lagi untuk mengakses halaman ini.
              </p>
            </div>

            <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-x-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs transition font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition font-bold shadow"
              >
                Ya, Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION STACK ── */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-md
              animate-[slideInRight_0.35s_ease-out]
              ${toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-700/60 text-emerald-300"
                : toast.type === "error"
                  ? "bg-red-950/90 border-red-700/60 text-red-300"
                  : "bg-neutral-900/90 border-neutral-700/60 text-neutral-200"
              }`}
          >
            <span className="text-lg">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* ── CUSTOM CONFIRM MODAL ── */}
      {confirmModal?.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-6 py-5">
              <p className="text-white text-sm leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="border-t border-neutral-800 px-6 py-4 flex justify-end gap-x-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2 border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs transition font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition font-bold shadow"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
