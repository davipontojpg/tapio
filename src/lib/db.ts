import fs from "fs";
import path from "path";
import { INITIAL_SEED_DATA } from "@/lib/seed-data";
import { generateId, slugify } from "@/lib/format";
import { DatabaseSchema, NfcTagLink, Restaurant } from "@/types/menu";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(INITIAL_SEED_DATA, null, 2),
      "utf-8"
    );
  }
}

export function getDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed || !Array.isArray(parsed.restaurants)) {
      throw new Error("Invalid DB schema");
    }
    return {
      restaurants: parsed.restaurants,
      nfcTags: Array.isArray(parsed.nfcTags) ? parsed.nfcTags : [],
    };
  } catch {
    saveDb(INITIAL_SEED_DATA);
    return structuredClone(INITIAL_SEED_DATA);
  }
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpFile, DB_FILE);
}

export function resetDb(): DatabaseSchema {
  const fresh = structuredClone(INITIAL_SEED_DATA);
  saveDb(fresh);
  return fresh;
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  const db = getDb();
  return db.restaurants.find((r) => r.slug === slug);
}

export function updateRestaurant(
  slug: string,
  updater: (current: Restaurant) => Restaurant
): Restaurant | null {
  const db = getDb();
  const index = db.restaurants.findIndex((r) => r.slug === slug);
  if (index === -1) return null;

  const updated = updater(db.restaurants[index]);
  db.restaurants[index] = updated;
  saveDb(db);
  return updated;
}

export interface CreateRestaurantInput {
  name: string;
  slug?: string;
  segment?: string;
  tagline?: string;
  city?: string;
  address?: string;
  openingHours?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerPin?: string;
  monthlyFee?: number;
  primaryColor?: string;
  themeMode?: "light" | "dark";
  status?: "active" | "trial" | "blocked";
  allowOwnerEdit?: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
}

export function createRestaurant(input: CreateRestaurantInput): Restaurant {
  const db = getDb();
  const baseSlug = slugify(input.slug || input.name) || generateId("loja");
  let finalSlug = baseSlug;
  let suffix = 2;
  while (db.restaurants.some((r) => r.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const newRestaurant: Restaurant = {
    id: generateId("rest"),
    slug: finalSlug,
    name: input.name.trim(),
    segment: input.segment?.trim() || "Restaurante",
    tagline:
      input.tagline?.trim() || "Sabores preparados na hora para você aproveitar na mesa",
    primaryColor: input.primaryColor || "#c2410c",
    themeMode: input.themeMode || "light",
    status: input.status || "trial",
    monthlyFee: Number(input.monthlyFee ?? 79.9),
    ownerName: input.ownerName?.trim() || "Responsável",
    ownerPhone: input.ownerPhone?.replace(/\D/g, "") || "",
    ownerPin: input.ownerPin?.trim() || "1234",
    allowOwnerEdit: input.allowOwnerEdit ?? true,
    address: input.address?.trim() || "Endereço a definir",
    city: input.city?.trim() || "Brasil",
    openingHours: input.openingHours?.trim() || "Todos os dias • 11h00 às 23h00",
    isOpenNow: true,
    wifiSsid: input.wifiSsid?.trim() || "",
    wifiPassword: input.wifiPassword?.trim() || "",
    serviceFeeNotice: "Taxa de serviço opcional de 10%.",
    categories: [
      { id: generateId("cat"), name: "Entradas", order: 1 },
      { id: generateId("cat"), name: "Pratos Principais", order: 2 },
      { id: generateId("cat"), name: "Bebidas", order: 3 },
      { id: generateId("cat"), name: "Sobremesas", order: 4 },
    ],
    items: [],
    createdAt: new Date().toISOString(),
  };

  db.restaurants.unshift(newRestaurant);
  saveDb(db);
  return newRestaurant;
}

export function deleteRestaurant(slug: string): boolean {
  const db = getDb();
  const initialLen = db.restaurants.length;
  db.restaurants = db.restaurants.filter((r) => r.slug !== slug);
  if (db.restaurants.length === initialLen) return false;
  saveDb(db);
  return true;
}

export function getNfcTag(code: string): NfcTagLink | undefined {
  const db = getDb();
  return db.nfcTags.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

export function incrementNfcScan(code: string): NfcTagLink | null {
  const db = getDb();
  const index = db.nfcTags.findIndex(
    (t) => t.code.toLowerCase() === code.toLowerCase()
  );
  if (index === -1) return null;

  db.nfcTags[index] = {
    ...db.nfcTags[index],
    scansCount: (db.nfcTags[index].scansCount || 0) + 1,
  };
  saveDb(db);
  return db.nfcTags[index];
}

export function upsertNfcTag(input: {
  code: string;
  label?: string;
  targetSlug: string;
}): NfcTagLink {
  const db = getDb();
  const cleanCode = slugify(input.code) || generateId("tag");
  const index = db.nfcTags.findIndex(
    (t) => t.code.toLowerCase() === cleanCode.toLowerCase()
  );
  const now = new Date().toISOString();

  if (index >= 0) {
    db.nfcTags[index] = {
      ...db.nfcTags[index],
      label: input.label ?? db.nfcTags[index].label,
      targetSlug: input.targetSlug,
      lastUpdated: now,
    };
    saveDb(db);
    return db.nfcTags[index];
  }

  const created: NfcTagLink = {
    code: cleanCode,
    label: input.label?.trim() || `Tag NFC ${cleanCode}`,
    targetSlug: input.targetSlug,
    scansCount: 0,
    lastUpdated: now,
  };
  db.nfcTags.push(created);
  saveDb(db);
  return created;
}

export function deleteNfcTag(code: string): boolean {
  const db = getDb();
  const initialLen = db.nfcTags.length;
  db.nfcTags = db.nfcTags.filter((t) => t.code !== code);
  if (db.nfcTags.length === initialLen) return false;
  saveDb(db);
  return true;
}
