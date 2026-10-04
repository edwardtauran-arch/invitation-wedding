import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface FormProps {
  guestName?: string;
}

interface WishPayload {
  name: string;
  attendance: string;
  guests: string;
  message: string;
}

interface ExistingWish {
  name: string;
  attendance: string;
  guests: number;
  message: string;
  updatedAt?: string;
  createdAt?: string;
}

const Form = ({ guestName }: FormProps) => {
  const [attendance, setAttendance] = useState("Hadir");
  const [guests, setGuests] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false); // guard race condition

  // Popup konfirmasi jika tamu sudah pernah RSVP
  const [existingWish, setExistingWish] = useState<ExistingWish | null>(null);
  const [pendingData, setPendingData] = useState<WishPayload | null>(null);

  const resetSubmitting = () => {
    setIsSubmitting(false);
    submittingRef.current = false;
  };

  // Kirim data ke server + update daftar ucapan
  const sendWish = async (data: WishPayload) => {
    const optimisticWish = {
      _id: `pending_${Date.now()}`,
      name: data.name,
      attendance: data.attendance,
      guests: Number(data.guests),
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    window.dispatchEvent(
      new CustomEvent("wishSubmitted", { detail: optimisticWish })
    );

    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Silent fail — data masih tampil optimistically
    } finally {
      setMessage("");
      setAttendance("Hadir");
      setGuests("1");
      setSubmitted(true);
      resetSubmitting();
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent double-submit
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    const form = e.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data: WishPayload = {
      name: guestName || (formData.get("name") as string),
      attendance,
      guests: attendance === "Tidak Hadir" ? "0" : guests,
      message: message,
    };

    if (!data.name) {
      alert("Name is required!");
      resetSubmitting();
      return;
    }

    // Cek dulu di database apakah sudah pernah RSVP
    try {
      const res = await fetch(
        `/api/check-wish?name=${encodeURIComponent(data.name)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const result = await res.json();
        if (result.exists && result.wish) {
          setExistingWish(result.wish);
          setPendingData(data);
          return; // tunggu konfirmasi user di popup
        }
      }
    } catch {
      // Kalau cek gagal, lanjut submit (server tetap upsert, tidak dobel)
    }

    await sendWish(data);
  };

  const handleConfirmUpdate = async () => {
    const data = pendingData;
    setExistingWish(null);
    setPendingData(null);
    if (data) await sendWish(data);
    else resetSubmitting();
  };

  const handleCancelUpdate = () => {
    setExistingWish(null);
    setPendingData(null);
    resetSubmitting();
  };

  const confirmModal =
    existingWish && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={handleCancelUpdate}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rsvp-confirm-title"
              className="w-full max-w-sm rounded-xl border border-white/20 bg-neutral-900/95 p-5 text-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="rsvp-confirm-title" className="text-base md:text-lg font-semibold text-center">
                Kamu sudah RSVP 🙏
              </h3>
              <p className="mt-1 text-center text-xs text-white/60">
                Berikut data yang sudah kamu kirim sebelumnya:
              </p>

              <div className="mt-4 space-y-2 rounded-lg bg-white/5 p-3 text-xs md:text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-white/60">Nama</span>
                  <span className="font-medium text-right">{existingWish.name}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-white/60">Kehadiran</span>
                  <span
                    className={`font-medium ${
                      existingWish.attendance === "Hadir" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {existingWish.attendance}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-white/60">Jumlah Tamu</span>
                  <span className="font-medium">{existingWish.guests} orang</span>
                </div>
                <div className="border-t border-white/10 pt-2">
                  <span className="text-white/60">Ucapan</span>
                  <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap italic text-white/90">
                    {existingWish.message?.trim() ? `"${existingWish.message}"` : "— belum ada ucapan —"}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs md:text-sm">
                Apakah kamu ingin mengubahnya dengan data yang baru?
              </p>
              {!pendingData?.message?.trim() && existingWish.message?.trim() && (
                <p className="mt-1 text-center text-[10px] text-white/50">
                  (Ucapan baru kosong, ucapan lama akan tetap dipertahankan)
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="rsvp-confirm-cancel"
                  onClick={handleCancelUpdate}
                  className="rounded-md border border-white/30 p-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="rsvp-confirm-update"
                  onClick={handleConfirmUpdate}
                  className="rounded-md bg-white p-2 text-sm font-medium text-black transition-colors hover:bg-white/80"
                >
                  Ya, Ubah
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
    {confirmModal}
    <form onSubmit={handleSubmit} className="mt-2 space-y-3">
      {/* Form fields */}
      <div>
        <label htmlFor="name" className="block text-[10px] md:text-sm font-medium text-white">
          Nama
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={guestName || ""}
          readOnly={!!guestName}
          className={`block w-full p-1.5 md:p-2 mt-1 bg-white/10 text-white border border-gray-300/50 rounded-md shadow-sm focus:border-indigo-500 text-xs md:text-sm ${guestName ? "opacity-70 cursor-not-allowed" : ""}`}
          required
        />
      </div>

      <div>
        <label htmlFor="attendance" className="block text-[10px] md:text-sm font-medium text-white">
          Kehadiran
        </label>
        <select
          name="attendance"
          id="attendance"
          value={attendance}
          onChange={(e) => setAttendance(e.target.value)}
          className="block w-full p-1.5 md:p-2 mt-1 bg-white/10 text-white border border-gray-300/50 rounded-md shadow-sm focus:border-indigo-500 text-xs md:text-sm"
          required
        >
          <option className="text-black" value="Hadir">Hadir</option>
          <option className="text-black" value="Tidak Hadir">Tidak Hadir</option>
        </select>
      </div>

      <div>
        <label htmlFor="guests" className="block text-[10px] md:text-sm font-medium text-white">
          Jumlah Tamu
        </label>
        {attendance === "Tidak Hadir" ? (
          <input
            type="number"
            value="0"
            disabled
            className="block w-full p-1.5 md:p-2 mt-1 bg-white/10 text-white border border-gray-300/50 rounded-md shadow-sm opacity-50 cursor-not-allowed text-xs md:text-sm"
          />
        ) : (
          <select
            name="guests"
            id="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="block w-full p-1.5 md:p-2 mt-1 bg-white/10 text-white border border-gray-300/50 rounded-md shadow-sm focus:border-indigo-500 text-xs md:text-sm"
            required
          >
            <option className="text-black" value="1">1</option>
            <option className="text-black" value="2">2</option>
          </select>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-white">
          Ucapan
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="block w-full p-2 mt-1 bg-white/10 text-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`block w-full p-2 text-sm font-medium text-center rounded-md shadow-sm transition-colors duration-300 ${
            isSubmitting
              ? "bg-white/50 text-black/50 border border-transparent cursor-not-allowed"
              : submitted
              ? "bg-green-500 text-white border border-green-500"
              : "text-black bg-white border border-transparent"
          }`}
        >
          {isSubmitting ? (existingWish ? "Menunggu konfirmasi..." : "⏳ Mengirim...") : submitted ? "✓ Ucapan Terkirim!" : "Submit"}
        </button>
      </div>
    </form>
    </>
  );
};

export default Form;
