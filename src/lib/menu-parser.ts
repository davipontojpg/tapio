import { ItemBadge } from "@/types/menu";

export interface ParsedMenuItem {
  categoryName: string;
  name: string;
  description: string;
  price: number;
  badges: ItemBadge[];
}

export const SAMPLE_IMPORT_TEXT = `# Entradas & Porções
Provolone à Milanesa - Cubos crocantes de provolone com orégano e geleia de pimenta - R$ 42,90
Batata Rústica da Casa - Batatas temperadas com alecrim, páprica e maionese de alho - R$ 32,00

# Pratos na Brasa
Picanha Argentina na Chapa - 400g de picanha fatiada com farofa crocante, vinagrete e pão de alho - R$ 138,00
Parmegiana Clássica - Filé mignon empanado coberto com molho pelati artesanal e mussarela - R$ 79,90
Risoto de Cogumelos Frescos - Arroz arbóreo com mix de shiitake, shimeji e parmesão 12 meses - R$ 68,00

# Bebidas & Chopp
Chopp Pilsen Caneca Zero Grau - 500ml bem tirado com colarinho cremoso - R$ 15,90
Limonada Suíça com Hortelã - Jarra 500ml feita na hora - R$ 16,00
Caipirinha Clássica de Limão - Cachaça artesanal prata ou vodka importada - R$ 26,00

# Sobremesas
Pudim de Leite Condensado - Receita tradicional com calda de caramelo escuro - R$ 22,00`;

function parseBrazilianPrice(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;

  if (cleaned.includes(",") && cleaned.includes(".")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    return parseFloat(normalized) || 0;
  }
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(",", ".")) || 0;
  }
  return parseFloat(cleaned) || 0;
}

export function parseRawMenuText(rawText: string): ParsedMenuItem[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ParsedMenuItem[] = [];
  let currentCategory = "Destaques";

  for (const line of lines) {
    // Detect explicit category header (# Categoria or [Categoria] or ALL CAPS without price)
    if (line.startsWith("#") || (line.startsWith("[") && line.endsWith("]"))) {
      currentCategory = line.replace(/^#+\s*/, "").replace(/^\[|\]$/g, "").trim() || "Geral";
      continue;
    }

    // Extract price from end or anywhere in the line (e.g., R$ 45,90 or 45,90 or R$45)
    const priceMatch = line.match(/(?:R\$\s*)(\d+(?:[.,]\d{1,2})?)|(\d+[.,]\d{2})\s*$/i);
    if (!priceMatch) {
      // Short line without price is likely a category title
      if (line.length <= 42 && !line.includes(" - ")) {
        currentCategory = line.replace(/:$/, "").trim();
      }
      continue;
    }

    const rawPriceStr = priceMatch[1] || priceMatch[2] || "0";
    const price = parseBrazilianPrice(rawPriceStr);
    const priceIndex = line.lastIndexOf(priceMatch[0]);
    const textWithoutPrice = line
      .slice(0, priceIndex)
      .replace(/[-–—|:]\s*$/, "")
      .trim();

    let name = textWithoutPrice;
    let description = "";

    const separatorMatch = textWithoutPrice.match(/\s[-–—|:]\s/);
    if (separatorMatch && separatorMatch.index !== undefined) {
      name = textWithoutPrice.slice(0, separatorMatch.index).trim();
      description = textWithoutPrice
        .slice(separatorMatch.index + separatorMatch[0].length)
        .trim();
    }

    if (!name) continue;

    const lower = `${name} ${description}`.toLowerCase();
    const badges: ItemBadge[] = [];
    if (lower.includes("vegetar") || lower.includes("cogumelo") || lower.includes("rúcula")) {
      badges.push("vegetarian");
    }
    if (lower.includes("picante") || lower.includes("pimenta")) {
      badges.push("spicy");
    }
    if (lower.includes("clássic") || lower.includes("especial") || lower.includes("chef")) {
      badges.push("chef");
    }

    items.push({
      categoryName: currentCategory,
      name,
      description,
      price,
      badges,
    });
  }

  return items;
}
