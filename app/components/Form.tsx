import React, { useState } from "react";

interface FormProps {
  guestName?: string;
}

const Form = ({ guestName }: FormProps) => {
  const [attendance, setAttendance] = useState("Hadir");
  const [guests, setGuests] = useState("1");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const data = {
      name: guestName || (formData.get("name") as string),
      attendance,
      guests: attendance === "Tidak Hadir" ? "0" : guests,
      message: message,
    };

    if (!data.name) {
      alert("Name is required!");
      return;
    }

    // ✅ Optimistic: langsung tampil sukses & reset form tanpa nunggu server
    const optimisticWish = {
      _id: `pending_${Date.now()}`,
      name: data.name,
      attendance: data.attendance,
      guests: Number(data.guests),
      message: data.message,
      createdAt: new Date().toISOString(),
    };

    // Dispatch event ke WishesList untuk tampil langsung
    window.dispatchEvent(
      new CustomEvent("wishSubmitted", { detail: optimisticWish })
    );

    // Reset form langsung
    setMessage("");
    setAttendance("Hadir");
    setGuests("1");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);

    // Fire-and-forget ke server di background
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {
      // Silent fail — data masih tampil optimistically
    });
  };

  return (
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
          className={`block w-full p-2 text-sm font-medium text-center rounded-md shadow-sm transition-colors duration-300 ${
            submitted
              ? "bg-green-500 text-white border border-green-500"
              : "text-black bg-white border border-transparent"
          }`}
        >
          {submitted ? "✓ Ucapan Terkirim!" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default Form;
