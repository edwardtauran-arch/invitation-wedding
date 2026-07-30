import fs from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "lib", "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {}
}

async function safeWriteFile(filePath: string, content: string) {
  if (process.env.NODE_ENV !== "production") {
    await fs.writeFile(filePath, content);
  }
}

// Default settings values (matching the old Mongoose schema defaults)
function getDefaultSettings() {
  return {
    coupleNames: "EDWARD & DIAN",
    eventDate: "2026-10-11T15:15:00",
    groom: "Edward Ridley Tauran",
    groomNickName: "Edward",
    groomInstagram: "tompel98",
    groomBio: "Anak Pertama dari Pasangan Bpk. Jeffri P. Tauran & Ibu D. Erny Tauran/P",
    groomTitleFront: "",
    groomTitleBack: "",
    bride: "Mardianti Ekaputri P",
    brideNickName: "Dian",
    brideInstagram: "dianpangandaheng",
    brideBio: "Anak Pertama dari Pasangan Bpk. Ronny Pangandaheng & Agus Sulistiani",
    brideTitleFront: "",
    brideTitleBack: "",
    bibleVerse: "KOLOSE 3:23",
    bibleVerseContent: "",
    timeline_1: "JANUARY 2019",
    timeline_1_content: "",
    timeline_2: "JANUARY 2020",
    timeline_2_content: "",
    timeline_3: "JANUARY 2023",
    timeline_3_content: "",
    timeline_4: "",
    timeline_4_content: "",
    timeline_5: "",
    timeline_5_content: "",
    timelineCount: 3,
    holyMatrimony: {
      enabled: true,
      time: "12.00 - 01.00 PM",
      place: "GMAHK Bintaro",
      place_details: "",
      googleMapsLink: "https://goo.gl/maps/7Q6",
    },
    weddingReception: {
      enabled: true,
      time: "01.00 - 03.00 PM",
      place: "Gereja Katedral Jakarta",
      place_details: "",
      googleMapsLink: "https://goo.gl/maps/7Q6",
    },
    livestreaming: {
      enabled: true,
      time: "12.00",
      link: "https://www.youtube.com/watch?v=Q5J",
      detail: "",
    },
    prewedding: {
      enabled: true,
      link: "YkO-e-gyp58",
      detail: "",
    },
    rsvp: {
      enabled: true,
      detail: "",
    },
    thankyou: "Thank You For Your attendance",
    thankyouDetail: "",
    musicPath: "/music/wedding_song.mp3",
    galleryImages: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80",
    ],
    slideImages: {
      slide1: "/slide_1.jpg",
      slide2: "/slide_2.jpg",
      slide3: "/slide_3.jpg",
      slide4: "/slide_4.jpg",
      slide5: "/slide_5.jpg",
      slide6: "/slide_6.jpg",
      slide7: "/slide_7.jpg",
      slide8: "/slide_8.jpg",
      slide9: "/slide_9.jpg",
      slide10: "/slide_9.jpg",
      sideImage: "/foto_1_samping.jpg",
    },
    invitationTemplate:
      "Halo *{nama}*,\n\nKami mengundang Anda untuk menghadiri acara pernikahan kami. Berikut link undangan digital Anda:\n{link}\n\nMerupakan suatu kehormatan bagi kami jika Anda berkenan hadir.\n\nTerima kasih!",
    weddingGift: {
      enabled: true,
      qrisImage: "",
      qrisOwnerName: "Edward & Dian",
      bankAccounts: [
        { bankName: "BRI", accountNumber: "0000 0000 000", accountHolderName: "Edward Ridley Tauran" },
        { bankName: "BCA", accountNumber: "0000 0000 000", accountHolderName: "Mardianti Ekaputri P" },
      ],
    },
  };
}

// ============ SETTINGS ============

export async function getDynamicSettings() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("data")
      .limit(1)
      .single();

    if (!error && data) {
      return { ...getDefaultSettings(), ...data.data };
    }
  } catch (err) {
    console.warn("Supabase fetch settings failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "settings.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    return { ...getDefaultSettings(), ...JSON.parse(fileData) };
  } catch (e) {
    const defaults = getDefaultSettings();
    await safeWriteFile(filePath, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

export async function updateDynamicSettings(newData: any) {
  try {
    // Check if a row exists
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("settings")
        .update({ data: newData, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("data")
        .single();
      if (!error && data) return { ...getDefaultSettings(), ...data.data };
    } else {
      const { data, error } = await supabase
        .from("settings")
        .insert({ data: newData })
        .select("data")
        .single();
      if (!error && data) return { ...getDefaultSettings(), ...data.data };
    }
  } catch (err) {
    console.warn("Supabase save settings failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "settings.json");
  await safeWriteFile(filePath, JSON.stringify(newData, null, 2));
  return newData;
}

// ============ GUESTS ============

export async function getDynamicGuests() {
  try {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map Supabase column names to match frontend expected format
      return data.map((g: any) => ({
        _id: g.id,
        name: g.name,
        phone: g.phone,
        status: g.status,
        sentAt: g.sent_at,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      }));
    }
  } catch (err) {
    console.warn("Supabase fetch guests failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch (e) {
    return [];
  }
}

export async function createDynamicGuest(guestData: any) {
  try {
    const { data, error } = await supabase
      .from("guests")
      .insert({
        name: guestData.name,
        phone: guestData.phone || "",
        status: guestData.status || "Belum Dikirim",
      })
      .select()
      .single();

    if (!error && data) {
      return {
        _id: data.id,
        name: data.name,
        phone: data.phone,
        status: data.status,
        sentAt: data.sent_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (err) {
    console.warn("Supabase create guest failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  let guests = [];
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    guests = JSON.parse(fileData);
  } catch (e) {}

  const newGuest = {
    _id: `json_${Date.now()}`,
    ...guestData,
    status: guestData.status || "Belum Dikirim",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  guests.unshift(newGuest);
  await safeWriteFile(filePath, JSON.stringify(guests, null, 2));
  return newGuest;
}

export async function updateDynamicGuest(id: string, guestData: any) {
  // If it's a JSON fallback ID, skip Supabase
  if (!id.startsWith("json_")) {
    try {
      const updatePayload: any = {};
      if (guestData.name !== undefined) updatePayload.name = guestData.name;
      if (guestData.phone !== undefined) updatePayload.phone = guestData.phone;
      if (guestData.status !== undefined) updatePayload.status = guestData.status;
      if (guestData.sentAt || guestData.sent_at) updatePayload.sent_at = guestData.sentAt || guestData.sent_at;
      updatePayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("guests")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return {
          _id: data.id,
          name: data.name,
          phone: data.phone,
          status: data.status,
          sentAt: data.sent_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase update guest failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    let guests = JSON.parse(fileData);
    const index = guests.findIndex((g: any) => g._id === id);
    if (index !== -1) {
      guests[index] = {
        ...guests[index],
        ...guestData,
        updatedAt: new Date().toISOString(),
      };
      await safeWriteFile(filePath, JSON.stringify(guests, null, 2));
      return guests[index];
    }
  } catch (e) {}
  return null;
}

export async function deleteDynamicGuest(id: string) {
  if (!id.startsWith("json_")) {
    try {
      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", id);

      if (!error) return { _id: id };
    } catch (err) {
      console.warn("Supabase delete guest failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    let guests = JSON.parse(fileData);
    const filtered = guests.filter((g: any) => g._id !== id);
    await safeWriteFile(filePath, JSON.stringify(filtered, null, 2));
    return { _id: id };
  } catch (e) {}
  return null;
}

// ============ WISHES / RSVP ============

export async function getDynamicWishes(page: number, limit: number) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("wishes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const totalWishes = count || 0;
      return {
        wishes: data.map((w: any) => ({
          _id: w.id,
          name: w.name,
          attendance: w.attendance,
          guests: w.guests,
          message: w.message,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
        })),
        totalPages: Math.ceil(totalWishes / limit),
        currentPage: page,
      };
    }
  } catch (err) {
    console.warn("Supabase fetch wishes failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    const wishes = JSON.parse(fileData);
    const totalWishes = wishes.length;
    const paginated = wishes.slice((page - 1) * limit, page * limit);
    return {
      wishes: paginated,
      totalPages: Math.ceil(totalWishes / limit),
      currentPage: page,
    };
  } catch (e) {
    return { wishes: [], totalPages: 0, currentPage: page };
  }
}

export async function createDynamicWish(wishData: any) {
  try {
    // Check if wish from same person already exists (upsert logic)
    const { data: existing } = await supabase
      .from("wishes")
      .select("*")
      .eq("name", wishData.name)
      .single();

    if (existing) {
      const updatePayload: any = {
        attendance: wishData.attendance,
        guests: wishData.guests,
        updated_at: new Date().toISOString(),
      };
      if (wishData.message) updatePayload.message = wishData.message;

      const { data, error } = await supabase
        .from("wishes")
        .update(updatePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (!error && data) {
        return {
          _id: data.id,
          name: data.name,
          attendance: data.attendance,
          guests: data.guests,
          message: data.message,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } else {
      const { data, error } = await supabase
        .from("wishes")
        .insert({
          name: wishData.name,
          attendance: wishData.attendance || "Hadir",
          guests: wishData.guests || 1,
          message: wishData.message || "",
        })
        .select()
        .single();

      if (!error && data) {
        return {
          _id: data.id,
          name: data.name,
          attendance: data.attendance,
          guests: data.guests,
          message: data.message,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  } catch (err) {
    console.warn("Supabase create wish failed, using file fallback.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  let wishes: any[] = [];
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    wishes = JSON.parse(fileData);
  } catch (e) {}

  const existingIndex = wishes.findIndex((w: any) => w.name === wishData.name);
  if (existingIndex !== -1) {
    wishes[existingIndex].attendance = wishData.attendance;
    wishes[existingIndex].guests = wishData.guests;
    if (wishData.message) wishes[existingIndex].message = wishData.message;
    wishes[existingIndex].updatedAt = new Date().toISOString();
    const [updatedWish] = wishes.splice(existingIndex, 1);
    wishes.unshift(updatedWish);
    await safeWriteFile(filePath, JSON.stringify(wishes, null, 2));
    return updatedWish;
  }

  const newWish = {
    _id: `json_${Date.now()}`,
    ...wishData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  wishes.unshift(newWish);
  await safeWriteFile(filePath, JSON.stringify(wishes, null, 2));
  return newWish;
}

export async function deleteDynamicWish(id: string) {
  if (!id.startsWith("json_")) {
    try {
      const { error } = await supabase
        .from("wishes")
        .delete()
        .eq("id", id);

      if (!error) return { _id: id };
    } catch (err) {
      console.warn("Supabase delete wish failed.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  try {
    const fileData = await fs.readFile(filePath, "utf-8");
    let wishes = JSON.parse(fileData);
    wishes = wishes.filter((w: any) => w._id !== id);
    await safeWriteFile(filePath, JSON.stringify(wishes, null, 2));
    return { _id: id };
  } catch (e) {}
  return null;
}

export async function clearDynamicWishes() {
  try {
    const { error } = await supabase
      .from("wishes")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows

    if (!error) {
      // Also clear JSON fallback
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, "wishes.json");
      await safeWriteFile(filePath, JSON.stringify([], null, 2));
      return true;
    }
  } catch (err) {
    console.warn("Supabase clear wishes failed.", err);
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  try {
    await safeWriteFile(filePath, JSON.stringify([], null, 2));
    return true;
  } catch (e) {}
  return false;
}
