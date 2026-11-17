export type ItemBadge =
  | "popular"
  | "chef"
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "spicy"
  | "new";

export interface PriceVariation {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  featured?: boolean;
  badges: ItemBadge[];
  variations?: PriceVariation[];
  addonsInfo?: string;
  serves?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export type RestaurantStatus = "active" | "trial" | "blocked";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  segment: string;
  tagline: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  primaryColor: string;
  themeMode: "light" | "dark";
  status: RestaurantStatus;
  monthlyFee: number;
  ownerName: string;
  ownerPhone: string;
  ownerPin: string;
  allowOwnerEdit: boolean;
  address: string;
  city: string;
  openingHours: string;
  isOpenNow: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
  instagram?: string;
  serviceFeeNotice?: string;
  highlightBanner?: string;
  categories: MenuCategory[];
  items: MenuItem[];
  createdAt: string;
}

export interface NfcTagLink {
  code: string;
  label: string;
  targetSlug: string;
  scansCount: number;
  lastUpdated: string;
}

export interface DatabaseSchema {
  restaurants: Restaurant[];
  nfcTags: NfcTagLink[];
}
