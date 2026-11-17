import { ItemBadge } from "@/types/menu";

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const BADGE_META: Record<
  ItemBadge,
  {
    label: { pt: string; en: string; es: string };
    emoji: string;
    colorClass: string;
  }
> = {
  popular: {
    label: { pt: "Mais Pedido", en: "Popular", es: "Más Pedido" },
    emoji: "🔥",
    colorClass: "bg-orange-100 text-orange-800 border-orange-200",
  },
  chef: {
    label: { pt: "Sugestão do Chef", en: "Chef's Choice", es: "Sugerencia del Chef" },
    emoji: "👨‍🍳",
    colorClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  vegetarian: {
    label: { pt: "Vegetariano", en: "Vegetarian", es: "Vegetariano" },
    emoji: "🌱",
    colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  vegan: {
    label: { pt: "Vegano", en: "Vegan", es: "Vegano" },
    emoji: "🌿",
    colorClass: "bg-green-100 text-green-800 border-green-200",
  },
  gluten_free: {
    label: { pt: "Sem Glúten", en: "Gluten-Free", es: "Sin Gluten" },
    emoji: "🌾",
    colorClass: "bg-sky-100 text-sky-800 border-sky-200",
  },
  spicy: {
    label: { pt: "Picante", en: "Spicy", es: "Picante" },
    emoji: "🌶️",
    colorClass: "bg-red-100 text-red-800 border-red-200",
  },
  new: {
    label: { pt: "Novidade", en: "New", es: "Nuevo" },
    emoji: "✨",
    colorClass: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

export const SUGGESTED_IMAGES = [
  {
    label: "Pizza Artesanal",
    url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Burger na Brasa",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Massa / Pasta",
    url: "https://images.unsplash.com/photo-1621996346565-e3d3a9f3e76a?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Drink / Taça",
    url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Café & Croissant",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  },
  {
    label: "Sobremesa",
    url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
  },
];
