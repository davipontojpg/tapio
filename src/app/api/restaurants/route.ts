import { NextRequest, NextResponse } from "next/server";
import { createRestaurant, getDb, resetDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json(db);
  } catch (error) {
    console.error("GET /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar restaurantes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.action === "reset_demo") {
      const fresh = resetDb();
      return NextResponse.json(fresh);
    }

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "O nome do restaurante é obrigatório." },
        { status: 400 }
      );
    }

    const created = createRestaurant(body);
    return NextResponse.json({ restaurant: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/restaurants error:", error);
    return NextResponse.json(
      { error: "Erro ao criar restaurante." },
      { status: 500 }
    );
  }
}
