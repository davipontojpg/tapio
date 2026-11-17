import { NextRequest, NextResponse } from "next/server";
import {
  deleteRestaurant,
  getRestaurantBySlug,
  updateRestaurant,
} from "@/lib/db";
import { generateId } from "@/lib/format";
import { MenuCategory, MenuItem, Restaurant } from "@/types/menu";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const restaurant = getRestaurantBySlug(slug);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("GET /api/restaurants/[slug] error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar restaurante." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    const updated = updateRestaurant(slug, (current: Restaurant) => {
      // Action 1: Quick toggle availability for a single item
      if (body.action === "toggle_item" && body.itemId) {
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === body.itemId
              ? { ...item, available: !item.available }
              : item
          ),
        };
      }

      // Action 2: Add or update single menu item
      if (body.action === "upsert_item" && body.item) {
        const incoming = body.item as Partial<MenuItem>;
        const exists = current.items.some((i) => i.id === incoming.id);
        if (exists) {
          return {
            ...current,
            items: current.items.map((i) =>
              i.id === incoming.id ? { ...i, ...incoming } : i
            ),
          };
        }
        const newItem: MenuItem = {
          id: incoming.id || generateId("item"),
          categoryId:
            incoming.categoryId || current.categories[0]?.id || "cat-default",
          name: incoming.name?.trim() || "Novo Item",
          description: incoming.description?.trim() || "",
          price: Number(incoming.price ?? 0),
          imageUrl: incoming.imageUrl?.trim() || undefined,
          available: incoming.available ?? true,
          featured: incoming.featured ?? false,
          badges: Array.isArray(incoming.badges) ? incoming.badges : [],
          variations: Array.isArray(incoming.variations)
            ? incoming.variations
            : undefined,
          addonsInfo: incoming.addonsInfo?.trim() || undefined,
          serves: incoming.serves?.trim() || undefined,
        };
        return {
          ...current,
          items: [...current.items, newItem],
        };
      }

      // Action 3: Delete menu item
      if (body.action === "delete_item" && body.itemId) {
        return {
          ...current,
          items: current.items.filter((i) => i.id !== body.itemId),
        };
      }

      // Action 4: Upsert category
      if (body.action === "upsert_category" && body.category) {
        const incomingCat = body.category as Partial<MenuCategory>;
        const exists = current.categories.some((c) => c.id === incomingCat.id);
        if (exists) {
          return {
            ...current,
            categories: current.categories.map((c) =>
              c.id === incomingCat.id ? { ...c, ...incomingCat } : c
            ),
          };
        }
        const nextOrder =
          current.categories.reduce((max, c) => Math.max(max, c.order), 0) + 1;
        const newCat: MenuCategory = {
          id: incomingCat.id || generateId("cat"),
          name: incomingCat.name?.trim() || "Nova Categoria",
          description: incomingCat.description?.trim() || undefined,
          order: incomingCat.order ?? nextOrder,
        };
        return {
          ...current,
          categories: [...current.categories, newCat],
        };
      }

      // Action 5: Delete category (and move or remove items)
      if (body.action === "delete_category" && body.categoryId) {
        return {
          ...current,
          categories: current.categories.filter(
            (c) => c.id !== body.categoryId
          ),
          items: current.items.filter((i) => i.categoryId !== body.categoryId),
        };
      }

      // Action 6: Bulk import parsed items from Master Importer
      if (body.action === "bulk_import" && Array.isArray(body.parsedItems)) {
        const categories = [...current.categories];
        const newItems: MenuItem[] = [];

        for (const row of body.parsedItems) {
          const catName = String(row.categoryName || "Geral").trim();
          let cat = categories.find(
            (c) => c.name.toLowerCase() === catName.toLowerCase()
          );
          if (!cat) {
            cat = {
              id: generateId("cat"),
              name: catName,
              order: categories.length + 1,
            };
            categories.push(cat);
          }

          newItems.push({
            id: generateId("item"),
            categoryId: cat.id,
            name: String(row.name || "Produto").trim(),
            description: String(row.description || "").trim(),
            price: Number(row.price || 0),
            available: true,
            badges: Array.isArray(row.badges) ? row.badges : [],
          });
        }

        return {
          ...current,
          categories,
          items: [...current.items, ...newItems],
        };
      }

      // Default: Partial update of restaurant fields (status, settings, info, etc.)
      const { action: _action, id: _id, slug: _slug, ...patch } = body;
      return {
        ...current,
        ...patch,
      };
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Restaurante não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("PATCH /api/restaurants/[slug] error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar restaurante." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const deleted = deleteRestaurant(slug);
    if (!deleted) {
      return NextResponse.json(
        { error: "Restaurante não encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/restaurants/[slug] error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir restaurante." },
      { status: 500 }
    );
  }
}
