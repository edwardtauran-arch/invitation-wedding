import { useState, useEffect } from "react";
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchWishes = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/get?page=${pageNumber}&limit=5`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setWishes(data.wishes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes(page);
  }, [page]);

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
        return [newWish, ...filtered].slice(0, 5);
      });
      setTotalPages((prev) => Math.max(prev, 1));
    };

    window.addEventListener("wishSubmitted", handleNewWish);
    return () => window.removeEventListener("wishSubmitted", handleNewWish);
  }, []);

  const handleRefresh = () => fetchWishes(page);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const visibleWishes = wishes.filter((w) => w.message && w.message.trim() !== "");

  return (
    <div className="text-white">
      <div className="flex justify-end mb-2">
        <button
          onClick={handleRefresh}
          className={`text-xs text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          <IoMdRefresh className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="w-full">
        {visibleWishes.length === 0 ? (
          <p className="text-xs">No wishes available</p>
        ) : (
          visibleWishes.map((wish) => (
            <div key={wish._id} className={`mb-2 transition-opacity duration-300 ${wish._id.startsWith("pending_") ? "opacity-70" : "opacity-100"}`}>
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

      <div className="flex justify-between mt-3">
        <button
          onClick={handlePreviousPage}
          className={`text-xs text-white ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={page === 1}
        >
          Sebelumnya
        </button>
        <p className="text-xs">Page {page} of {totalPages}</p>
        <button
          onClick={handleNextPage}
          className={`text-xs text-white ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={page === totalPages}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};

export default WishesList;
