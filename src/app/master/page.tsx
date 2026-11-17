"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  KeyRound,
  Lock,
  MessageCircle,
  Nfc,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Store,
  Trash2,
  Unlock,
  Wallet,
  Zap,
} from "lucide-react";
import { MenuImage } from "@/components/MenuImage";
import { QrCodeModal } from "@/components/QrCodeModal";
import { formatBRL, slugify } from "@/lib/format";
import { parseRawMenuText, SAMPLE_IMPORT_TEXT } from "@/lib/menu-parser";
import { NfcTagLink, Restaurant, RestaurantStatus } from "@/types/menu";

type MasterTab = "restaurants" | "nfc" | "importer";

const COLOR_PRESETS = [
  "#c2410c",
  "#d97706",
  "#059669",
  "#2563eb",
  "#7c3aed",
  "#be123c",
  "#0f172a",
];

export default function MasterDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nfcTags, setNfcTags] = useState<NfcTagLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MasterTab>("restaurants");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RestaurantStatus>("all");
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [qrRestaurant, setQrRestaurant] = useState<Restaurant | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New Restaurant Form
  const [newForm, setNewForm] = useState({
    name: "",
    slug: "",
    segment: "Restaurante",
    city: "",
    address: "",
    ownerName: "",
    ownerPhone: "",
    ownerPin: "1234",
    monthlyFee: "89.90",
    primaryColor: "#c2410c",
    themeMode: "light" as "light" | "dark",
    status: "trial" as RestaurantStatus,
    allowOwnerEdit: true,
    wifiSsid: "",
    wifiPassword: "",
  });

  // NFC Form
  const [newTagCode, setNewTagCode] = useState("");
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagTarget, setNewTagTarget] = useState("");

  // Importer State
  const [importTargetSlug, setImportTargetSlug] = useState("");
  const [rawMenuText, setRawMenuText] = useState("");
  const [importing, setImporting] = useState(false);

  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    loadAll();
  }, []);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/restaurants", { cache: "no-store" });
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      setNfcTags(data.nfcTags || []);
      if (data.restaurants?.length && !importTargetSlug) {
        setImportTargetSlug(data.restaurants[0].slug);
      }
      if (data.restaurants?.length && !newTagTarget) {
        setNewTagTarget(data.restaurants[0].slug);
      }
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => {
    const active = restaurants.filter((r) => r.status === "active");
    const trial = restaurants.filter((r) => r.status === "trial");
    const blocked = restaurants.filter((r) => r.status === "blocked");
    const mrr = active.reduce((sum, r) => sum + (Number(r.monthlyFee) || 0), 0);
    return {
      total: restaurants.length,
      activeCount: active.length,
      trialCount: trial.length,
      blockedCount: blocked.length,
      mrr,
    };
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
      );
    });
  }, [restaurants, searchQuery, statusFilter]);

  const parsedItems = useMemo(() => parseRawMenuText(rawMenuText), [rawMenuText]);

  async function handleStatusChange(slug: string, status: RestaurantStatus) {
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { restaurant } = await res.json();
      setRestaurants((prev) =>
        prev.map((r) => (r.slug === slug ? restaurant : r))
      );
      notify(
        status === "blocked"
          ? `Cardápio "${restaurant.name}" bloqueado.`
          : `Status atualizado para ${
              status === "active" ? "Ativo" : "Demonstração"
            }.`
      );
    }
  }

  async function handleToggleOwnerEdit(slug: string, allowOwnerEdit: boolean) {
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowOwnerEdit }),
    });
    if (res.ok) {
      const { restaurant } = await res.json();
      setRestaurants((prev) =>
        prev.map((r) => (r.slug === slug ? restaurant : r))
      );
      notify(
        allowOwnerEdit
          ? `Acesso do lojista liberado para "${restaurant.name}".`
          : `Edição bloqueada para o lojista em "${restaurant.name}".`
      );
    }
  }

  async function handleDeleteRestaurant(slug: string, name: string) {
    if (!confirm(`Tem certeza que deseja remover "${name}"?`)) return;
    const res = await fetch(`/api/restaurants/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setRestaurants((prev) => prev.filter((r) => r.slug !== slug));
      notify(`Restaurante "${name}" removido.`);
    }
  }

  async function handleCreateRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newForm,
        monthlyFee: parseFloat(newForm.monthlyFee) || 79.9,
      }),
    });
    if (res.ok) {
      const { restaurant } = await res.json();
      setRestaurants((prev) => [restaurant, ...prev]);
      setShowNewModal(false);
      setImportTargetSlug(restaurant.slug);
      setNewForm({
        name: "",
        slug: "",
        segment: "Restaurante",
        city: "",
        address: "",
        ownerName: "",
        ownerPhone: "",
        ownerPin: "1234",
        monthlyFee: "89.90",
        primaryColor: "#c2410c",
        themeMode: "light",
        status: "trial",
        allowOwnerEdit: true,
        wifiSsid: "",
        wifiPassword: "",
      });
      notify(`"${restaurant.name}" cadastrado com sucesso!`);
    }
  }

  async function handleUpdateNfcTarget(code: string, targetSlug: string) {
    const res = await fetch("/api/nfc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, targetSlug }),
    });
    if (res.ok) {
      const { tag } = await res.json();
      setNfcTags((prev) => prev.map((t) => (t.code === tag.code ? tag : t)));
      notify(`Plaquinha /m/${tag.code} agora aponta para /${targetSlug}!`);
    }
  }

  async function handleCreateNfcTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagCode.trim() || !newTagTarget) return;
    const res = await fetch("/api/nfc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newTagCode,
        label: newTagLabel || `Tag NFC ${newTagCode}`,
        targetSlug: newTagTarget,
      }),
    });
    if (res.ok) {
      await loadAll();
      setNewTagCode("");
      setNewTagLabel("");
      notify("Nova tag NFC cadastrada!");
    }
  }

  async function handleBulkImport() {
    if (!importTargetSlug || parsedItems.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/restaurants/${importTargetSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_import",
          parsedItems,
        }),
      });
      if (res.ok) {
        const { restaurant } = await res.json();
        setRestaurants((prev) =>
          prev.map((r) => (r.slug === importTargetSlug ? restaurant : r))
        );
        setRawMenuText("");
        notify(
          `${parsedItems.length} itens importados para "${restaurant.name}"!`
        );
        setActiveTab("restaurants");
      }
    } finally {
      setImporting(false);
    }
  }

  async function handleResetDemo() {
    if (
      !confirm(
        "Restaurar os 3 restaurantes e tags NFC originais de demonstração?"
      )
    )
      return;
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_demo" }),
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurants(data.restaurants || []);
      setNfcTags(data.nfcTags || []);
      notify("Dados de demonstração restaurados!");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white font-black flex items-center justify-center shadow-sm">
                T
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-none">
                  Tápio <span className="text-orange-600">Master</span>
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Painel Administrativo Central &amp; Gestão de Clientes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              title="Restaurar dados iniciais"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar Demo
            </button>
            <button
              onClick={() => setActiveTab("importer")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 transition"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Importar Cardápio</span>
              <span className="sm:hidden">Importar</span>
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Novo Restaurante
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Métricas do Negócio */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Receita Mensal (MRR)</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {formatBRL(metrics.mrr)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.activeCount} loja(s) pagante(s) ativa(s)
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total de Clientes</span>
              <Store className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {metrics.total}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.blockedCount} bloqueado(s) no momento
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Em Demonstração</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
              {metrics.trialCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Prontos para apresentar ao dono
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Tags NFC Ativas</span>
              <Nfc className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {nfcTags.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Redirecionamento dinâmico em /m/
            </p>
          </div>
        </section>

        {/* Navegação por Abas */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "restaurants"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Store className="w-4 h-4" />
            Restaurantes ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab("nfc")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "nfc"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Nfc className="w-4 h-4" />
            Central NFC Dinâmica ({nfcTags.length})
          </button>
          <button
            onClick={() => setActiveTab("importer")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              activeTab === "importer"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importador Rápido de Cardápio
          </button>
        </div>

        {/* ABA 1: RESTAURANTES */}
        {activeTab === "restaurants" && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome do restaurante, cidade, responsável ou link..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                {(
                  [
                    { id: "all", label: "Todos" },
                    { id: "active", label: "Ativos" },
                    { id: "trial", label: "Demo" },
                    { id: "blocked", label: "Bloqueados" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      statusFilter === f.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                Carregando restaurantes...
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                Nenhum restaurante encontrado com esse filtro.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRestaurants.map((rest) => {
                  const whatsappUrl = rest.ownerPhone
                    ? `https://wa.me/${rest.ownerPhone}?text=${encodeURIComponent(
                        `Olá ${rest.ownerName}! Aqui está o link do cardápio digital de ${rest.name}: ${origin}/${rest.slug}`
                      )}`
                    : null;

                  return (
                    <div
                      key={rest.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition"
                    >
                      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Info Principal */}
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                            <MenuImage
                              src={rest.logoUrl}
                              alt={rest.name}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                              style={{ backgroundColor: rest.primaryColor }}
                              title="Cor da marca"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-extrabold text-slate-900">
                                {rest.name}
                              </h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                {rest.segment}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">
                              📍 {rest.address} • {rest.city}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                              <span>
                                👤 <strong>{rest.ownerName}</strong>
                              </span>
                              <span>
                                💰{" "}
                                <strong className="text-emerald-700">
                                  {formatBRL(rest.monthlyFee)}/mês
                                </strong>
                              </span>
                              <span>
                                🍽️ <strong>{rest.items.length}</strong> itens em{" "}
                                <strong>{rest.categories.length}</strong>{" "}
                                categorias
                              </span>
                              <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                <KeyRound className="w-3 h-3" />
                                PIN: {rest.ownerPin}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controles Master */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Seletor de Status */}
                            <div className="inline-flex rounded-xl bg-slate-100 p-1">
                              {(
                                [
                                  {
                                    value: "active",
                                    label: "Ativo",
                                    activeClass:
                                      "bg-emerald-600 text-white shadow-sm",
                                  },
                                  {
                                    value: "trial",
                                    label: "Demo",
                                    activeClass:
                                      "bg-blue-600 text-white shadow-sm",
                                  },
                                  {
                                    value: "blocked",
                                    label: "Bloqueado",
                                    activeClass:
                                      "bg-red-600 text-white shadow-sm",
                                  },
                                ] as const
                              ).map((st) => (
                                <button
                                  key={st.value}
                                  onClick={() =>
                                    handleStatusChange(rest.slug, st.value)
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    rest.status === st.value
                                      ? st.activeClass
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>

                            {/* Controle de Acesso do Dono */}
                            <button
                              onClick={() =>
                                handleToggleOwnerEdit(
                                  rest.slug,
                                  !rest.allowOwnerEdit
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                rest.allowOwnerEdit
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Controlar se o dono pode adicionar/editar produtos pelo celular"
                            >
                              {rest.allowOwnerEdit ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  Dono pode editar
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Edição bloqueada
                                </>
                              )}
                            </button>
                          </div>

                          {/* Botões de Ação Direta */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/${rest.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Ver Cardápio (/{rest.slug})
                            </Link>
                            <Link
                              href={`/painel/${rest.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              Painel do Lojista
                            </Link>
                            <button
                              onClick={() => setQrRestaurant(rest)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              QR Code / Placa
                            </button>
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteRestaurant(rest.slug, rest.name)
                              }
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir restaurante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ABA 2: CENTRAL DE PLAQUINHAS NFC DINÂMICAS */}
        {activeTab === "nfc" && (
          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-extrabold flex items-center gap-2">
                  <Nfc className="w-5 h-5" />
                  Como funciona o NFC Dinâmico para Vendas Presenciais
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed">
                  Você grava o link curto (ex:{" "}
                  <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono">
                    {origin}/m/demo1
                  </code>
                  ) uma única vez na sua plaquinha NFC de demonstração. Antes de
                  entrar em um restaurante para vender, mude abaixo para qual
                  cardápio essa plaquinha aponta — sem regravar o chip!
                </p>
              </div>

              <div className="space-y-3">
                {nfcTags.map((tag) => {
                  const fullTagUrl = `${origin}/m/${tag.code}`;
                  return (
                    <div
                      key={tag.code}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-violet-100 text-violet-800 font-mono text-xs font-bold">
                            /m/{tag.code}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {tag.label}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {tag.scansCount} aproximações / acessos registrados
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={tag.targetSlug}
                          onChange={(e) =>
                            handleUpdateNfcTarget(tag.code, e.target.value)
                          }
                          className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          {restaurants.map((r) => (
                            <option key={r.slug} value={r.slug}>
                              Apontar para: {r.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(fullTagUrl);
                            notify(`Link ${fullTagUrl} copiado!`);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Copiar URL para gravar no chip NFC"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/m/${tag.code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Testar
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Criar nova Tag NFC */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm h-fit">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">
                Cadastrar Nova Tag / Display NFC
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Crie um código curto para gravar no adesivo ou acrílico NFC.
              </p>

              <form onSubmit={handleCreateNfcTag} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Código Curto (sem espaços)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTagCode}
                    onChange={(e) => setNewTagCode(slugify(e.target.value))}
                    placeholder="ex: demo3 ou mesa05"
                    className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Descrição da Plaquinha
                  </label>
                  <input
                    type="text"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    placeholder="ex: Display Madeira #03"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Restaurante Destino Inicial
                  </label>
                  <select
                    value={newTagTarget}
                    onChange={(e) => setNewTagTarget(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    {restaurants.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
                >
                  Criar Tag Dinâmica
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ABA 3: IMPORTADOR RÁPIDO DE CARDÁPIO */}
        {activeTab === "importer" && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Importador Rápido de Cardápio (Onboarding em 30s)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Cole a lista de itens enviada pelo restaurante (WhatsApp,
                    PDF ou foto transcrita). Use <code className="font-mono"># Categoria</code>{" "}
                    e <code className="font-mono">Nome - Descrição - R$ 49,90</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRawMenuText(SAMPLE_IMPORT_TEXT)}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold shrink-0 transition"
                >
                  Carregar Exemplo
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Restaurante que vai receber os produtos
                </label>
                <select
                  value={importTargetSlug}
                  onChange={(e) => setImportTargetSlug(e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50"
                >
                  {restaurants.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.name} (/{r.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Texto do Cardápio
                </label>
                <textarea
                  rows={12}
                  value={rawMenuText}
                  onChange={(e) => setRawMenuText(e.target.value)}
                  placeholder={`# Pizzas Tradicionais\nCalabresa Especial - Mussarela, calabresa fatiada e cebola roxa - R$ 58,00\nPortuguesa - Presunto, ovos, ervilha e azeitonas - R$ 62,00`}
                  className="w-full text-sm font-mono border border-slate-200 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Preview da Importação */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Preview dos Itens Detectados
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                    {parsedItems.length} itens prontos
                  </span>
                </div>

                {parsedItems.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
                    Cole o cardápio ao lado ou clique em{" "}
                    <strong>&ldquo;Carregar Exemplo&rdquo;</strong> para visualizar
                    os pratos automaticamente.
                  </div>
                ) : (
                  <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                    {parsedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                            {item.categoryName}
                          </span>
                          <p className="font-bold text-sm text-slate-900">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-extrabold text-slate-900 shrink-0">
                          {formatBRL(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={parsedItems.length === 0 || importing}
                onClick={handleBulkImport}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold text-sm transition shadow-sm"
              >
                {importing
                  ? "Importando para o cardápio..."
                  : `Importar ${parsedItems.length} Itens Agora`}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal QR Code & Plaquinha */}
      {qrRestaurant && (
        <QrCodeModal
          restaurant={qrRestaurant}
          onClose={() => setQrRestaurant(null)}
        />
      )}

      {/* Modal Novo Restaurante */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 my-auto border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900">
              Cadastrar Novo Restaurante
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Crie o cardápio em segundos como Demonstração ou Ativo.
            </p>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nome do Estabelecimento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.name}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        name: e.target.value,
                        slug: slugify(e.target.value),
                      }))
                    }
                    placeholder="Ex: Churrascaria Gaúcha"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Link Personalizado (/slug)
                  </label>
                  <input
                    type="text"
                    value={newForm.slug}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        slug: slugify(e.target.value),
                      }))
                    }
                    placeholder="churrascaria-gaucha"
                    className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Segmento
                  </label>
                  <input
                    type="text"
                    value={newForm.segment}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, segment: e.target.value }))
                    }
                    placeholder="Pizzaria, Bar, Padaria..."
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    value={newForm.city}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Ex: Curitiba - PR"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nome do Responsável
                  </label>
                  <input
                    type="text"
                    value={newForm.ownerName}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, ownerName: e.target.value }))
                    }
                    placeholder="João Silva"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    WhatsApp (com DDD)
                  </label>
                  <input
                    type="text"
                    value={newForm.ownerPhone}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, ownerPhone: e.target.value }))
                    }
                    placeholder="5511999998888"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    PIN do Lojista
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newForm.ownerPin}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, ownerPin: e.target.value }))
                    }
                    className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newForm.monthlyFee}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, monthlyFee: e.target.value }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={newForm.status}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        status: e.target.value as RestaurantStatus,
                      }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="trial">Demonstração (Trial)</option>
                    <option value="active">Ativo (Pagante)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tema do Cardápio
                  </label>
                  <select
                    value={newForm.themeMode}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        themeMode: e.target.value as "light" | "dark",
                      }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="light">Claro (Diurno)</option>
                    <option value="dark">Escuro (Noturno)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Cor Principal da Marca
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setNewForm((f) => ({ ...f, primaryColor: color }))
                      }
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        newForm.primaryColor === color
                          ? "border-slate-900 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                >
                  Criar Restaurante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
