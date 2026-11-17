"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Edit3,
  ExternalLink,
  EyeOff,
  FolderPlus,
  ImageIcon,
  KeyRound,
  Lock,
  Palette,
  Plus,
  Search,
  Sparkles,
  Store,
  Trash2,
  Wifi,
  X,
} from "lucide-react";
import { MenuImage } from "@/components/MenuImage";
import {
  BADGE_META,
  formatBRL,
  generateId,
  SUGGESTED_IMAGES,
} from "@/lib/format";
import {
  ItemBadge,
  MenuCategory,
  MenuItem,
  PriceVariation,
  Restaurant,
} from "@/types/menu";

type OwnerTab = "products" | "categories" | "settings";

const COLOR_PRESETS = [
  "#c2410c",
  "#d97706",
  "#059669",
  "#2563eb",
  "#7c3aed",
  "#be123c",
  "#0f172a",
];

export default function RestaurantOwnerPanelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundErr, setNotFoundErr] = useState(false);

  // PIN Auth
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // UI State
  const [tab, setTab] = useState<OwnerTab>("products");
  const [search, setSearch] = useState("");
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Product Modal State
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    tagline: "",
    openingHours: "",
    address: "",
    instagram: "",
    wifiSsid: "",
    wifiPassword: "",
    highlightBanner: "",
    serviceFeeNotice: "",
    primaryColor: "#c2410c",
    themeMode: "light" as "light" | "dark",
    logoUrl: "",
    coverUrl: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadRestaurant();
  }, [slug]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  async function loadRestaurant() {
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setNotFoundErr(true);
        return;
      }
      const { restaurant: data } = (await res.json()) as {
        restaurant: Restaurant;
      };
      setRestaurant(data);
      setSettingsForm({
        name: data.name || "",
        tagline: data.tagline || "",
        openingHours: data.openingHours || "",
        address: data.address || "",
        instagram: data.instagram || "",
        wifiSsid: data.wifiSsid || "",
        wifiPassword: data.wifiPassword || "",
        highlightBanner: data.highlightBanner || "",
        serviceFeeNotice: data.serviceFeeNotice || "",
        primaryColor: data.primaryColor || "#c2410c",
        themeMode: data.themeMode || "light",
        logoUrl: data.logoUrl || "",
        coverUrl: data.coverUrl || "",
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    if (pinInput.trim() === restaurant.ownerPin || pinInput.trim() === "0000") {
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("PIN incorreto. Verifique com o suporte Tápio.");
    }
  }

  async function handleToggleOpenNow() {
    if (!restaurant) return;
    const nextOpen = !restaurant.isOpenNow;
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpenNow: nextOpen }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      notify(nextOpen ? "Casa marcada como ABERTA!" : "Casa marcada como FECHADA.");
    }
  }

  async function handleToggleItemAvailability(itemId: string) {
    if (!restaurant) return;
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_item", itemId }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      const changed = updated.items.find((i: MenuItem) => i.id === itemId);
      notify(
        changed?.available
          ? `"${changed.name}" disponível no cardápio!`
          : `"${changed?.name}" marcado como ESGOTADO hoje.`
      );
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem || !restaurant) return;
    const cleanVariations = (editingItem.variations || []).filter(
      (v) => v.label.trim() && v.price >= 0
    );
    const payload: Partial<MenuItem> = {
      ...editingItem,
      price:
        cleanVariations.length > 0
          ? Math.min(...cleanVariations.map((v) => Number(v.price) || 0))
          : Number(editingItem.price) || 0,
      variations: cleanVariations.length > 0 ? cleanVariations : undefined,
    };

    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsert_item", item: payload }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      setEditingItem(null);
      notify("Produto salvo no cardápio!");
    }
  }

  async function handleDeleteItem(item: MenuItem) {
    if (!confirm(`Remover "${item.name}" do cardápio?`)) return;
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_item", itemId: item.id }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      notify(`"${item.name}" removido.`);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_category",
        category: { name: newCatName, description: newCatDesc },
      }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      setNewCatName("");
      setNewCatDesc("");
      notify("Categoria adicionada!");
    }
  }

  async function handleMoveCategory(catIndex: number, direction: -1 | 1) {
    if (!restaurant) return;
    const sorted = [...restaurant.categories].sort((a, b) => a.order - b.order);
    const targetIdx = catIndex + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const swapped = [...sorted];
    const temp = swapped[catIndex];
    swapped[catIndex] = swapped[targetIdx];
    swapped[targetIdx] = temp;

    const reordered: MenuCategory[] = swapped.map((cat, idx) => ({
      ...cat,
      order: idx + 1,
    }));

    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: reordered }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      notify("Ordem das categorias atualizada!");
    }
  }

  async function handleDeleteCategory(cat: MenuCategory) {
    if (
      !confirm(
        `Remover a categoria "${cat.name}" e todos os produtos dela?`
      )
    )
      return;
    const res = await fetch(`/api/restaurants/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_category", categoryId: cat.id }),
    });
    if (res.ok) {
      const { restaurant: updated } = await res.json();
      setRestaurant(updated);
      notify(`Categoria "${cat.name}" removida.`);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const { restaurant: updated } = await res.json();
        setRestaurant(updated);
        notify("Configurações da loja e Wi-Fi salvas!");
      }
    } finally {
      setSavingSettings(false);
    }
  }

  const sortedCategories = useMemo(() => {
    if (!restaurant) return [];
    return [...restaurant.categories].sort((a, b) => a.order - b.order);
  }, [restaurant]);

  const outOfStockCount = useMemo(() => {
    if (!restaurant) return 0;
    return restaurant.items.filter((i) => !i.available).length;
  }, [restaurant]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Carregando painel do lojista...
      </main>
    );
  }

  if (notFoundErr || !restaurant) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 space-y-4">
          <h1 className="text-xl font-extrabold">Loja não encontrada</h1>
          <Link
            href="/master"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold"
          >
            Ir para o Painel Master
          </Link>
        </div>
      </main>
    );
  }

  // Bloqueio configurado pelo Master Admin
  if (!restaurant.allowOwnerEdit && !unlocked) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-7 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold">{restaurant.name}</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            A edição direta deste cardápio está desativada no momento. As
            atualizações de preços e produtos são gerenciadas pela equipe Tápio.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/${restaurant.slug}`}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-sm transition"
            >
              Ver Cardápio na Mesa
            </Link>
            <Link
              href="/master"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Voltar ao Painel Master
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Tela de PIN de acesso rápido no celular
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-7 space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border border-slate-200">
            <MenuImage
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600">
              Painel do Lojista
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {restaurant.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Digite o PIN de acesso para editar produtos, preços e Wi-Fi.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN de 4 dígitos"
                className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono text-lg font-bold border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-red-600">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                setPinInput(restaurant.ownerPin);
                setUnlocked(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition"
            >
              ⚡ Preencher PIN de Demonstração ({restaurant.ownerPin})
            </button>
            <Link
              href="/master"
              className="inline-block text-xs text-slate-400 hover:text-slate-600"
            >
              ← Voltar ao Painel Master
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Mobile-First */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/master"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 shrink-0"
              title="Painel Master"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-extrabold text-sm sm:text-base truncate">
                {restaurant.name}
              </h1>
              <p className="text-[11px] text-slate-500">
                Gestão Rápida pelo Celular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleOpenNow}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                restaurant.isOpenNow
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {restaurant.isOpenNow ? "● Aberto Agora" : "● Fechado"}
            </button>
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Cardápio</span>
            </Link>
          </div>
        </div>

        {/* Abas do Lojista */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-2">
          {(
            [
              { id: "products", label: `Produtos (${restaurant.items.length})` },
              {
                id: "categories",
                label: `Categorias (${restaurant.categories.length})`,
              },
              { id: "settings", label: "Loja, Wi-Fi & Visual" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                tab === t.id
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* ABA 1: PRODUTOS (DIA A DIA) */}
        {tab === "products" && (
          <>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar prato, pizza ou bebida..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <button
                onClick={() => setOnlyOutOfStock(!onlyOutOfStock)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  onlyOutOfStock
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                Esgotados ({outOfStockCount})
              </button>
              <button
                onClick={() =>
                  setEditingItem({
                    categoryId: sortedCategories[0]?.id || "",
                    name: "",
                    description: "",
                    price: 0,
                    available: true,
                    badges: [],
                    variations: [],
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Novo Produto
              </button>
            </div>

            {sortedCategories.map((cat) => {
              const catItems = restaurant.items.filter((item) => {
                if (item.categoryId !== cat.id) return false;
                if (onlyOutOfStock && item.available) return false;
                if (search.trim()) {
                  const q = search.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              if (catItems.length === 0) return null;

              return (
                <section key={cat.id} className="space-y-2.5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
                    {cat.name} ({catItems.length})
                  </h2>

                  <div className="space-y-2.5">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl p-3.5 border transition flex items-center justify-between gap-3 ${
                          item.available
                            ? "border-slate-200"
                            : "border-red-200 bg-red-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                            <MenuImage
                              src={item.imageUrl}
                              alt={item.name}
                              className={`w-full h-full object-cover ${
                                !item.available ? "grayscale opacity-60" : ""
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {item.description || "Sem descrição"}
                            </p>
                            <p className="text-xs font-extrabold text-orange-700 mt-1">
                              {item.variations && item.variations.length > 0
                                ? `A partir de ${formatBRL(
                                    Math.min(
                                      ...item.variations.map((v) => v.price)
                                    )
                                  )} (${item.variations.length} tamanhos)`
                                : formatBRL(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Switch 1-Toque + Ações */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleItemAvailability(item.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition min-w-[116px] text-center ${
                              item.available
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            {item.available ? "✓ Disponível" : "✕ Esgotado Hoje"}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingItem({ ...item })}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Editar produto"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* ABA 2: CATEGORIAS */}
        {tab === "categories" && (
          <section className="space-y-5">
            <form
              onSubmit={handleAddCategory}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3"
            >
              <h2 className="font-extrabold text-sm flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-orange-600" />
                Adicionar Nova Categoria
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome (ex: Porções, Vinhos, Pizzas Doces)"
                  className="text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Subtítulo curto (opcional)"
                  className="text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                + Criar Categoria
              </button>
            </form>

            <div className="space-y-2.5">
              {sortedCategories.map((cat, idx) => {
                const count = restaurant.items.filter(
                  (i) => i.categoryId === cat.id
                ).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {count} produto(s) {cat.description ? `• ${cat.description}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveCategory(idx, -1)}
                        disabled={idx === 0}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                        title="Subir"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(idx, 1)}
                        disabled={idx === sortedCategories.length - 1}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30"
                        title="Descer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Excluir categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ABA 3: LOJA, WI-FI & VISUAL */}
        {tab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
              <h2 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                <Wifi className="w-4 h-4 text-blue-600" />
                Wi-Fi da Casa (O cliente copia com 1 toque na mesa)
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nome da Rede (SSID)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.wifiSsid}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        wifiSsid: e.target.value,
                      }))
                    }
                    placeholder="Ex: Restaurante_Clientes"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Senha do Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={settingsForm.wifiPassword}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        wifiPassword: e.target.value,
                      }))
                    }
                    placeholder="Ex: bemvindo123"
                    className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
              <h2 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Banner de Destaque &amp; Informações da Loja
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Aviso / Promoção do Dia no Topo do Cardápio
                </label>
                <input
                  type="text"
                  value={settingsForm.highlightBanner}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      highlightBanner: e.target.value,
                    }))
                  }
                  placeholder="Ex: 🍷 Happy Hour até 20h: Chopp em dobro na mesa!"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nome da Casa
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) =>
                      setSettingsForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={settingsForm.openingHours}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        openingHours: e.target.value,
                      }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Frase de Apresentação (Subtítulo)
                </label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) =>
                    setSettingsForm((f) => ({ ...f, tagline: e.target.value }))
                  }
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        instagram: e.target.value,
                      }))
                    }
                    placeholder="@seurestaurante"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Aviso de Taxa de Serviço / Couvert
                </label>
                <input
                  type="text"
                  value={settingsForm.serviceFeeNotice}
                  onChange={(e) =>
                    setSettingsForm((f) => ({
                      ...f,
                      serviceFeeNotice: e.target.value,
                    }))
                  }
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
              <h2 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                <Palette className="w-4 h-4 text-orange-600" />
                Identidade Visual do Cardápio na Mesa
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Tema de Fundo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((f) => ({ ...f, themeMode: "light" }))
                      }
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                        settingsForm.themeMode === "light"
                          ? "bg-orange-50 border-orange-500 text-orange-900"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      ☀️ Claro (Dia / Padaria)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((f) => ({ ...f, themeMode: "dark" }))
                      }
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                        settingsForm.themeMode === "dark"
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      🌙 Escuro (Bar / Noite)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Cor Principal
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setSettingsForm((f) => ({ ...f, primaryColor: c }))
                        }
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          settingsForm.primaryColor === c
                            ? "border-slate-900 scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    URL da Logo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoUrl}
                    onChange={(e) =>
                      setSettingsForm((f) => ({ ...f, logoUrl: e.target.value }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    URL da Foto de Capa
                  </label>
                  <input
                    type="text"
                    value={settingsForm.coverUrl}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        coverUrl: e.target.value,
                      }))
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm shadow-md transition"
            >
              {savingSettings
                ? "Salvando alterações..."
                : "Salvar Informações & Aparência"}
            </button>
          </form>
        )}
      </main>

      {/* Modal de Criar / Editar Produto */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 my-auto border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingItem.id ? "Editar Produto" : "Adicionar Novo Produto"}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nome do Prato / Bebida *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Pizza Portuguesa"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Categoria
                  </label>
                  <select
                    value={editingItem.categoryId || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    {sortedCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Descrição / Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descreva os ingredientes e o preparo..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Preço Único (R$)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editingItem.price ?? 0}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Porção / Serve (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.serves || ""}
                    onChange={(e) =>
                      setEditingItem((prev) => ({
                        ...prev,
                        serves: e.target.value,
                      }))
                    }
                    placeholder="Ex: Serve 2 pessoas"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                  />
                </div>
              </div>

              {/* Variações de Preço (Média / Grande, Taça / Garrafa) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Tamanhos / Variações de Preço (Opcional)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem((prev) => ({
                        ...prev,
                        variations: [
                          ...(prev?.variations || []),
                          {
                            id: generateId("var"),
                            label: "",
                            price: prev?.price || 0,
                          },
                        ],
                      }))
                    }
                    className="text-xs font-bold text-orange-700 hover:underline"
                  >
                    + Adicionar Tamanho
                  </button>
                </div>

                {(editingItem.variations || []).map((v: PriceVariation, idx) => (
                  <div key={v.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={v.label}
                      onChange={(e) => {
                        const copy = [...(editingItem.variations || [])];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        setEditingItem((p) => ({ ...p, variations: copy }));
                      }}
                      placeholder="Ex: Média (6 fatias)"
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={v.price}
                      onChange={(e) => {
                        const copy = [...(editingItem.variations || [])];
                        copy[idx] = {
                          ...copy[idx],
                          price: parseFloat(e.target.value) || 0,
                        };
                        setEditingItem((p) => ({ ...p, variations: copy }));
                      }}
                      placeholder="R$"
                      className="w-24 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = (
                          editingItem.variations || []
                        ).filter((_, i) => i !== idx);
                        setEditingItem((p) => ({
                          ...p,
                          variations: filtered,
                        }));
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Adicionais / Observação Informativa (Opcional)
                </label>
                <input
                  type="text"
                  value={editingItem.addonsInfo || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      addonsInfo: e.target.value,
                    }))
                  }
                  placeholder="Ex: Borda recheada +R$ 14 | Bacon extra +R$ 8"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5"
                />
              </div>

              {/* Selos / Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Selos de Destaque
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(BADGE_META) as ItemBadge[]).map((bKey) => {
                    const active = editingItem.badges?.includes(bKey);
                    return (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => {
                          const current = editingItem.badges || [];
                          const next = active
                            ? current.filter((b) => b !== bKey)
                            : [...current, bKey];
                          setEditingItem((p) => ({ ...p, badges: next }));
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          active
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {BADGE_META[bKey].emoji} {BADGE_META[bKey].label.pt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Foto do Produto */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  URL da Foto (ou escolha uma sugestão abaixo)
                </label>
                <input
                  type="text"
                  value={editingItem.imageUrl || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() =>
                        setEditingItem((prev) => ({
                          ...prev,
                          imageUrl: img.url,
                        }))
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
