import mongoose, { Schema, models } from "mongoose";

const settingsSchema = new Schema(
  {
    coupleNames: { type: String, default: "Mikha & Clara" },
    eventDate: { type: String, default: "2024-12-21T00:00:00" },
    
    // Groom Details
    groom: { type: String, default: "Mikha Satria Sihotang" },
    groomNickName: { type: String, default: "Mikha" },
    groomInstagram: { type: String, default: "mikhasatria" },
    groomBio: { type: String, default: "" },
    groomTitleFront: { type: String, default: "" },
    groomTitleBack: { type: String, default: "" },

    // Bride Details
    bride: { type: String, default: "Clara Sagala" },
    brideNickName: { type: String, default: "Clara" },
    brideInstagram: { type: String, default: "clarasagala" },
    brideBio: { type: String, default: "" },
    brideTitleFront: { type: String, default: "" },
    brideTitleBack: { type: String, default: "" },

    // Bible Verse Slide
    bibleVerse: { type: String, default: "Eccelestians 4:9-12" },
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

    // Invitation Message Template (for WhatsApp invites)
    invitationTemplate: {
      type: String,
      default: "Halo *{nama}*,\n\nKami mengundang Anda untuk menghadiri acara pernikahan kami. Berikut link undangan digital Anda:\n{link}\n\nMerupakan suatu kehormatan bagi kami jika Anda berkenan hadir.\n\nTerima kasih!",
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
