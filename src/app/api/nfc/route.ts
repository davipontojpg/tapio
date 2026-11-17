import { NextRequest, NextResponse } from "next/server";
import { deleteNfcTag, getDb, upsertNfcTag } from "@/lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json({ nfcTags: db.nfcTags });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.code || !body?.targetSlug) {
      return NextResponse.json(
        { error: "Informe o código curto da tag e o restaurante destino." },
        { status: 400 }
      );
    }
    const tag = upsertNfcTag({
      code: String(body.code),
      label: body.label ? String(body.label) : undefined,
      targetSlug: String(body.targetSlug),
    });
    return NextResponse.json({ tag });
  } catch (error) {
    console.error("POST /api/nfc error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar tag NFC." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Código ausente" }, { status: 400 });
  }
  const deleted = deleteNfcTag(code);
  return NextResponse.json({ deleted });
}
