import mongoose, { Schema, models } from "mongoose";

const settingsSchema = new Schema(
  {
    coupleNames: { type: String, default: "EDWARD & DIAN" },
    eventDate: { type: String, default: "2026-10-11T15:15:00" },
    
    // Groom Details
    groom: { type: String, default: "Edward Ridley Tauran" },
    groomNickName: { type: String, default: "Edward" },
    groomInstagram: { type: String, default: "tompel98" },
    groomBio: { type: String, default: "Anak Pertama dari Pasangan Bpk. Jeffri P. Tauran & Ibu D. Erny Tauran/P" },
    groomTitleFront: { type: String, default: "" },
    groomTitleBack: { type: String, default: "" },

    // Bride Details
    bride: { type: String, default: "Mardianti Ekaputri P" },
    brideNickName: { type: String, default: "Dian" },
    brideInstagram: { type: String, default: "dianpangandaheng" },
    brideBio: { type: String, default: "Anak Pertama dari Pasangan Bpk. Ronny Pangandaheng & Agus Sulistiani" },
    brideTitleFront: { type: String, default: "" },
    brideTitleBack: { type: String, default: "" },

    // Bible Verse Slide
    bibleVerse: { type: String, default: "KOLOSE 3:23" },
    bibleVerseContent: { type: String, default: "" },

    // Timeline Slide
    timeline_1: { type: String, default: "JANUARY 2019" },
    timeline_1_content: { type: String, default: "" },
    timeline_2: { type: String, default: "JANUARY 2020" },
    timeline_2_content: { type: String, default: "" },
    timeline_3: { type: String, default: "JANUARY 2023" },
    timeline_3_content: { type: String, default: "" },
    timeline_4: { type: String, default: "" },
    timeline_4_content: { type: String, default: "" },
    timeline_5: { type: String, default: "" },
    timeline_5_content: { type: String, default: "" },
    timelineCount: { type: Number, default: 3 },

    // Holy Matrimony Details
    holyMatrimony: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: "12.00 - 01.00 PM" },
      place: { type: String, default: "GMAHK Bintaro" },
      place_details: { type: String, default: "" },
      googleMapsLink: { type: String, default: "https://goo.gl/maps/7Q6" },
    },

    // Wedding Reception Details
    weddingReception: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: "01.00 - 03.00 PM" },
      place: { type: String, default: "Gereja Katedral Jakarta" },
      place_details: { type: String, default: "" },
      googleMapsLink: { type: String, default: "https://goo.gl/maps/7Q6" },
    },

    // Live Streaming Details
    livestreaming: {
      enabled: { type: Boolean, default: true },
      time: { type: String, default: "12.00" },
      link: { type: String, default: "https://www.youtube.com/watch?v=Q5J" },
      detail: { type: String, default: "" },
    },

    // Prewedding Video Details
    prewedding: {
      enabled: { type: Boolean, default: true },
      link: { type: String, default: "YkO-e-gyp58" },
      detail: { type: String, default: "" },
    },

    // RSVP Section
    rsvp: {
      enabled: { type: Boolean, default: true },
      detail: { type: String, default: "" },
    },

    // Thank You Section
    thankyou: { type: String, default: "Thank You For Your attendance" },
    thankyouDetail: { type: String, default: "" },

    // Media Assets
    musicPath: { type: String, default: "/music/wedding_song.mp3" },
    galleryImages: {
      type: [String],
      default: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80"
      ]
    },
    slideImages: {
      slide1: { type: String, default: "/slide_1.jpg" },
      slide2: { type: String, default: "/slide_2.jpg" },
      slide3: { type: String, default: "/slide_3.jpg" },
      slide4: { type: String, default: "/slide_4.jpg" },
      slide5: { type: String, default: "/slide_5.jpg" },
      slide6: { type: String, default: "/slide_6.jpg" },
      slide7: { type: String, default: "/slide_7.jpg" },
      slide8: { type: String, default: "/slide_8.jpg" },
      slide9: { type: String, default: "/slide_9.jpg" },
      slide10: { type: String, default: "/slide_9.jpg" },
      sideImage: { type: String, default: "/foto_1_samping.jpg" },
    },

    invitationTemplate: {
      type: String,
      default: `Halo {nama},

BREAKING NEWS 📢
Setelah proses "pendakian" panjang, dua traveler kece ini akhirnya sepakat mau explore hidup bareng… selamanya!

Edward Tauran & Dian Pangandaheng
siap-siap summit ke jenjang pernikahan 💍

🗓️ Hari/Tgl: {tanggal}
📍 Basecamp acara: cek di link ya!

Sebelum berangkat, jangan lupa siapin:
✅ Fisik yang prima (buat joged di lokasi)
✅ Perut kosong (biar bisa summit meja prasmanan)
✅ Hati yang penuh bahagia buat kita berdua 🥹

Klik link ini buat lihat itinerary lengkap & titik kumpul (detail lokasi):
👉 {link}

Merupakan suatu kehormatan besar buat kami kalau {nama} berkenan hadir dan jadi bagian dari "summit attack" kami menuju Married Life 

Jangan lupa daftar ulang pendakian alias konfirmasi kehadiran via form RSVP di link undangan ya!

Terima kasih banyak buat waktu, doa, dan semangatnya 🙏🏼
Tuhan memberkati!

Kalau mau bantu isi "logistik" perbekalan hidup baru kami, boleh banget mampir ke:
💰 SMBC 90360127959 a.n. Mardianti Ekaputri P
📱 atau bisa juga langsung scan QRIS yang ada di dalam undangan ya!`,
    },

    // Wedding Gift / Amplop Digital
    weddingGift: {
      enabled: { type: Boolean, default: true },
      qrisImage: { type: String, default: "" },
      qrisOwnerName: { type: String, default: "Edward & Dian" },
      bankAccounts: {
        type: [
          {
            bankName: { type: String, default: "" },
            accountNumber: { type: String, default: "" },
            accountHolderName: { type: String, default: "" }
          }
        ],
        default: [
          {
            bankName: "BRI",
            accountNumber: "0000 0000 000",
            accountHolderName: "Edward Ridley Tauran"
          },
          {
            bankName: "BCA",
            accountNumber: "0000 0000 000",
            accountHolderName: "Mardianti Ekaputri P"
          }
        ]
      }
    },
  },
  { timestamps: true }
);

export const Settings = models.Settings || mongoose.model("Settings", settingsSchema);
export default Settings;
