export const config = {
    coupleNames: process.env.NEXT_PUBLIC_COUPLE_NAMES || "Default Names",
    eventDate: process.env.NEXT_PUBLIC_EVENT_DATE || "2025-01-01T00:00:00",
    groom: process.env.NEXT_PUBLIC_GROOM_NAME || "Default Groom",
    groomNickName: process.env.NEXT_PUBLIC_GROOM_NICKNAME || "Default Nickname",
    groomInstagram: process.env.NEXT_PUBLIC_GROOM_INSTAGRAM || "Default Instagram",
    groomBio: process.env.NEXT_PUBLIC_GROOM_BIO || "Default Bio",
    bride: process.env.NEXT_PUBLIC_BRIDE_NAME || "Default Bride",
    brideNickName: process.env.NEXT_PUBLIC_BRIDE_NICKNAME || "Default Nickname",
    brideInstagram: process.env.NEXT_PUBLIC_BRIDE_INSTAGRAM || "Default Instagram",
    brideBio: process.env.NEXT_PUBLIC_BRIDE_BIO || "Default Bio",
    bibleVerse: process.env.NEXT_PUBLIC_BIBLE_VERSE || "Default Bible Verse",
    bibleVerseContent: process.env.NEXT_PUBLIC_BIBLE_VERSE_CONTENT || "Default Bible Verse Content",
    timeline_1: process.env.NEXT_PUBLIC_YEAR_1 || "Default Timeline 1",
    timeline_1_content: process.env.NEXT_PUBLIC_YEAR_1_CONTENT || "Default Timeline 1 Content",
    timeline_2: process.env.NEXT_PUBLIC_YEAR_2 || "Default Timeline 2",
    timeline_2_content: process.env.NEXT_PUBLIC_YEAR_2_CONTENT || "Default Timeline 2 Content",
    timeline_3: process.env.NEXT_PUBLIC_YEAR_3 || "Default Timeline 3",
    timeline_3_content: process.env.NEXT_PUBLIC_YEAR_3_CONTENT || "Default Timeline 3 Content",
    holyMatrimony: {
        enabled: process.env.NEXT_PUBLIC_HOLY_MATRIMONY === 'true',
        time: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_TIME || "00:00",
        place: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_PLACE || "Default Church",
        place_details: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_PLACE_DETAILS || "Default Street",
        googleMapsLink: process.env.NEXT_PUBLIC_HOLY_MATRIMONY_GOOGLE_MAPS || "https://maps.app.goo.gl/vPmfWux29qYYfkJTA",
    },
    weddingReception: {
        enabled: process.env.NEXT_PUBLIC_WEDDING_RECEPTION === 'true',
        time: process.env.NEXT_PUBLIC_WEDDING_RECEPTION_TIME || "00:00",
        place: process.env.NEXT_PUBLIC_WEDDING_RECEPTION_PLACE || "Default Venue",
        place_details: process.env.NEXT_PUBLIC_WEDDING_RECEPTION_PLACE_DETAILS || "Default Street",
        googleMapsLink: process.env.NEXT_PUBLIC_WEDDING_RECEPTION_GOOGLE_MAPS || "https://maps.app.goo.gl/fQGiC37iEx6fcuNq8",
    },
    livestreaming: {
        enabled: process.env.NEXT_PUBLIC_LIVE_STREAMING === 'true',
        time: process.env.NEXT_PUBLIC_LIVE_STREAMING_TIME || "00:00",
        link: process.env.NEXT_PUBLIC_LIVE_STREAMING_LINK || "#",
        detail: process.env.NEXT_PUBLIC_LIVE_STREAMING_DETAIL || "Default Livestreaming Detail",
    },
    prewedding: {
        enabled: process.env.NEXT_PUBLIC_PREWEDDING === 'true',
        link: process.env.NEXT_PUBLIC_PREWEDDING_CODE_LINK_EMBED || "#",
        detail: process.env.NEXT_PUBLIC_PREWEDDING_DETAIL || "Default Prewedding Detail",
    },
    rsvp: {
        enabled: process.env.NEXT_PUBLIC_RSVP === 'true',
        detail: process.env.NEXT_PUBLIC_RSVP_DETAIL || "Default RSVP Detail",
    },
    thankyou: process.env.NEXT_PUBLIC_THANKYOU || "Default Thank You",
    thankyouDetail: process.env.NEXT_PUBLIC_THANKYOU_DETAIL || "Default Thank You Detail",
    galleryImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80"
    ],
    weddingGift: {
        enabled: true,
        qrisImage: "",
        qrisOwnerName: "Edward & Dian",
        bankAccounts: [
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
};
