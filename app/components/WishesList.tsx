import { useState, useEffect, useRef } from "react";
import { IoMdRefresh } from "react-icons/io";

interface Wish {
  _id: string;
  name: string;
  attendance: string;
  guests: number;
  message: string;
  createdAt: string;
}

const WishesList = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchWishes = async () => {
    setLoading(true);
    try {
      // Ambil semua ucapan sekaligus (limit besar)
      const response = await fetch(`/api/get?page=1&limit=200`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setWishes(data.wishes || []);
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  // ✅ Optimistic: tampil langsung saat Form submit tanpa nunggu server
  useEffect(() => {
    const handleNewWish = (e: Event) => {
      const newWish = (e as CustomEvent<Wish>).detail;
      if (!newWish.message?.trim()) return; // hanya tampil jika ada pesan

      setWishes((prev) => {
        // Hindari duplikat jika sudah ada nama yang sama (pending)
        const filtered = prev.filter(
          (w) => !w._id.startsWith("pending_") || w.name !== newWish.name
        );
        return [newWish, ...filtered];
      });
    };

    window.addEventListener("wishSubmitted", handleNewWish);
    return () => window.removeEventListener("wishSubmitted", handleNewWish);
  }, []);

  const handleRefresh = () => fetchWishes();

  const visibleWishes = wishes.filter((w) => w.message && w.message.trim() !== "");

  return (
    <div className="text-white flex flex-col flex-1 min-h-0">
      {/* Header refresh */}
      <div className="flex justify-end mb-2 shrink-0">
        <button
          onClick={handleRefresh}
          className={`text-xs text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          <IoMdRefresh className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Scrollable wishes list */}
      <div
        ref={scrollRef}
        className="overflow-y-auto flex-1 min-h-0 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}
      >
        {visibleWishes.length === 0 ? (
          <p className="text-xs">{loading ? "Memuat ucapan..." : "Belum ada ucapan"}</p>
        ) : (
          visibleWishes.map((wish) => (
            <div
              key={wish._id}
              className={`mb-2 transition-opacity duration-300 ${
                wish._id.startsWith("pending_") ? "opacity-70" : "opacity-100"
              }`}
            >
              <p className="font-bold font-legan text-[10px] md:text-sm">{wish.name}</p>
              <p className="text-[8px] md:text-xs my-0.5 opacity-50">
                {new Date(wish.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p className="text-[10px] md:text-sm">{wish.message}</p>
              <hr className="my-1.5 border-white/20" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishesList;
