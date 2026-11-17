import Link from "next/link";
import { redirect } from "next/navigation";
import { Nfc } from "lucide-react";
import { getNfcTag, incrementNfcScan } from "@/lib/db";

export const dynamic = "force-dynamic";

interface NfcRedirectProps {
  params: Promise<{ code: string }>;
}

export default async function NfcRedirectPage({ params }: NfcRedirectProps) {
  const { code } = await params;
  const existing = getNfcTag(code);

  if (existing && existing.targetSlug) {
    incrementNfcScan(code);
    redirect(`/${existing.targetSlug}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
          <Nfc className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold">Plaquinha NFC não vinculada</h1>
        <p className="text-sm text-slate-400">
          O código <code className="text-violet-300 font-mono">/m/{code}</code>{" "}
          ainda não foi associado a nenhum restaurante no Painel Master.
        </p>
        <Link
          href="/master"
          className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-sm font-bold transition"
        >
          Configurar no Painel Master
        </Link>
      </div>
    </main>
  );
}
