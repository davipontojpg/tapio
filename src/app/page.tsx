import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Nfc,
  QrCode,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { MenuImage } from "@/components/MenuImage";
import { getDb } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { restaurants, nfcTags } = getDb();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-lg shadow-lg shadow-orange-600/20">
              T
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">
                Tápio
              </span>
              <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                QR Code &amp; NFC na Mesa
              </span>
            </div>
          </div>

          <Link
            href="/master"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-sm font-bold transition shadow-lg shadow-orange-600/25"
          >
            Abrir Painel Master
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-orange-300">
            <Sparkles className="w-3.5 h-3.5" />
            Sistema completo de 3 camadas • 100% funcional localmente
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Cardápio digital na mesa,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              sem complicação de delivery.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Gerencie todos os seus restaurantes clientes no Painel Master,
            cadastre cardápios em segundos, entregue plaquinhas com QR Code +
            NFC e deixe o dono ativar ou esgotar pratos com 1 toque no celular.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/master"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/25 transition"
            >
              <Store className="w-4 h-4" />
              Entrar no Painel Master (Você)
            </Link>

            {nfcTags[0] && (
              <Link
                href={`/m/${nfcTags[0].code}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition"
              >
                <Nfc className="w-4 h-4 text-violet-300" />
                Testar Link NFC (/m/{nfcTags[0].code})
              </Link>
            )}
          </div>
        </section>

        {/* Os 3 Módulos */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-lg">1. Seu Painel Master</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Controle mensalidades, ative ou bloqueie cardápios, libere ou
              trave a edição do lojista, importe cardápios em lote e imprima
              plaquinhas de mesa.
            </p>
            <Link
              href="/master"
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 pt-1"
            >
              Acessar /master <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-lg">2. Painel do Lojista</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Feito para o dono mexer no celular: botão gigante de{" "}
              <strong className="text-white">Esgotado Hoje</strong>, alteração
              rápida de preços, variações de tamanho e senha do Wi-Fi da loja.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 pt-1">
              Rota /painel/[slug] • Protegido por PIN
            </span>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-lg">3. Cardápio na Mesa</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Abre na hora sem login. Tema claro/escuro, cópia de Wi-Fi em 1
              toque, tradução PT/EN/ES e o{" "}
              <strong className="text-white">Caderninho da Mesa</strong> para
              mostrar ao garçom e dividir a conta.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 pt-1">
              Rota /[slug] ou /m/[tag-nfc]
            </span>
          </div>
        </section>

        {/* Lojas de Demonstração Prontas para Testar */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                Estabelecimentos Prontos para Testar
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Clique para abrir a vitrine do cliente na mesa ou o painel de
                edição do restaurante.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-white/25 transition"
              >
                <div>
                  <div className="h-32 relative overflow-hidden">
                    <MenuImage
                      src={rest.coverUrl}
                      alt={rest.name}
                      className="w-full h-full object-cover"
                      fallbackBg="bg-slate-800"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        rest.status === "active"
                          ? "bg-emerald-500 text-white"
                          : rest.status === "trial"
                          ? "bg-blue-500 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {rest.status === "active"
                        ? "Ativo"
                        : rest.status === "trial"
                        ? "Demo"
                        : "Bloqueado"}
                    </span>
                  </div>

                  <div className="p-5 -mt-8 relative">
                    <div
                      className="w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-lg mb-3"
                      style={{ borderColor: rest.primaryColor }}
                    >
                      <MenuImage
                        src={rest.logoUrl}
                        alt={rest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-extrabold text-base text-white">
                      {rest.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {rest.segment} •{" "}
                      {rest.themeMode === "dark" ? "Tema Escuro" : "Tema Claro"}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {rest.items.length} itens • Mensalidade{" "}
                      {formatBRL(rest.monthlyFee)} • PIN:{" "}
                      <span className="font-mono text-slate-300">
                        {rest.ownerPin}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex flex-col gap-2">
                  <Link
                    href={`/${rest.slug}`}
                    target="_blank"
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 transition hover:opacity-90"
                    style={{ backgroundColor: rest.primaryColor }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir Cardápio na Mesa (/{rest.slug})
                  </Link>
                  <Link
                    href={`/painel/${rest.slug}`}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Painel do Lojista (PIN: {rest.ownerPin})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
