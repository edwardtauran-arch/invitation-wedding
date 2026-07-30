import fs from "fs/promises";
import path from "path";
import Settings from "@/lib/models/Settings";
import Guest from "@/lib/models/Guest";
import Wish from "@/lib/models/Wish";
import connectToDatabase from "@/lib/db";
import mongoose from "mongoose";

const DATA_DIR = path.join(process.cwd(), "lib", "data");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Already exists or can't write
  }
}

async function safeWriteFile(filePath: string, content: string) {
  if (process.env.NODE_ENV !== "production") {
    await fs.writeFile(filePath, content);
  }
}

export async function getDynamicSettings() {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      return settings.toObject();
    } catch (err) {
      console.warn("MongoDB fetch settings failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "settings.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    const defaultSettings = new Settings({});
    const obj = defaultSettings.toObject();
    delete obj._id;
    return { ...obj, ...parsed };
  } catch (e) {
    // If settings.json doesn't exist, create it with default mongoose schema values
    const defaultSettings = new Settings({});
    const obj = defaultSettings.toObject();
    // Strip mongoose ID for clean JSON
    delete obj._id;
    await safeWriteFile(filePath, JSON.stringify(obj, null, 2));
    return obj;
  }
}

export async function updateDynamicSettings(newData: any) {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings(newData);
      } else {
        Object.assign(settings, newData);
      }
      await settings.save();
      return settings.toObject();
    } catch (err) {
      console.warn("MongoDB save settings failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "settings.json");
  await safeWriteFile(filePath, JSON.stringify(newData, null, 2));
  return newData;
}

export async function getDynamicGuests() {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      return await Guest.find().sort({ createdAt: -1 });
    } catch (err) {
      console.warn("MongoDB fetch guests failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function createDynamicGuest(guestData: any) {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      return await Guest.create(guestData);
    } catch (err) {
      console.warn("MongoDB create guest failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  let guests = [];
  try {
    const data = await fs.readFile(filePath, "utf-8");
    guests = JSON.parse(data);
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
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      const updated = await Guest.findByIdAndUpdate(id, guestData, { new: true });
      if (updated) return updated;
    } catch (err) {
      console.warn("MongoDB update guest failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    let guests = JSON.parse(data);
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
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      const deleted = await Guest.findByIdAndDelete(id);
      if (deleted) return deleted;
    } catch (err) {
      console.warn("MongoDB delete guest failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "guests.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    let guests = JSON.parse(data);
    const filtered = guests.filter((g: any) => g._id !== id);
    await safeWriteFile(filePath, JSON.stringify(filtered, null, 2));
    return { _id: id };
  } catch (e) {}
  return null;
}

export async function getDynamicWishes(page: number, limit: number) {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      const wishes = await Wish.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const totalWishes = await Wish.countDocuments();
      return {
        wishes,
        totalPages: Math.ceil(totalWishes / limit),
        currentPage: page,
      };
    } catch (err) {
      console.warn("MongoDB fetch wishes failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const wishes = JSON.parse(data);
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
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      const existingWish = await Wish.findOne({ name: wishData.name });
      if (existingWish) {
        existingWish.attendance = wishData.attendance;
        existingWish.guests = wishData.guests;
        if (wishData.message) {
          existingWish.message = wishData.message;
        }
        await existingWish.save();
        return existingWish;
      }
      return await Wish.create(wishData);
    } catch (err) {
      console.warn("MongoDB create wish failed, using file fallback.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  let wishes: any[] = [];
  try {
    const data = await fs.readFile(filePath, "utf-8");
    wishes = JSON.parse(data);
  } catch (e) {}

  const existingIndex = wishes.findIndex((w: any) => w.name === wishData.name);
  if (existingIndex !== -1) {
    wishes[existingIndex].attendance = wishData.attendance;
    wishes[existingIndex].guests = wishData.guests;
    if (wishData.message) {
      wishes[existingIndex].message = wishData.message;
    }
    wishes[existingIndex].updatedAt = new Date().toISOString();
    
    // Move the updated wish to the top
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
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1 && !id.startsWith("json_")) {
    try {
      await Wish.findByIdAndDelete(id);
      return { _id: id };
    } catch (err) {
      console.warn("MongoDB delete wish failed.", err);
    }
  }

  // Fallback to JSON file
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, "wishes.json");
  try {
    const data = await fs.readFile(filePath, "utf-8");
    let wishes = JSON.parse(data);
    wishes = wishes.filter((w: any) => w._id !== id);
    await safeWriteFile(filePath, JSON.stringify(wishes, null, 2));
    return { _id: id };
  } catch (e) {}
  return null;
}

export async function clearDynamicWishes() {
  const dbStatus = await connectToDatabase();
  if (dbStatus && mongoose.connection.readyState === 1) {
    try {
      await Wish.deleteMany({});
    } catch (err) {
      console.warn("MongoDB clear wishes failed.", err);
    }
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
