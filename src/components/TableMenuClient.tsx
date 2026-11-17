"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChefHat,
  Clock,
  Copy,
  Flame,
  Info,
  Instagram,
  Leaf,
  MapPin,
  Minus,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { MenuImage } from "@/components/MenuImage";
import { BADGE_META, formatBRL } from "@/lib/format";
import { ItemBadge, MenuItem, PriceVariation, Restaurant } from "@/types/menu";

type Lang = "pt" | "en" | "es";

interface TableNoteItem {
  key: string;
  itemId: string;
  name: string;
  variationLabel?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

const UI_COPY: Record<
  Lang,
  {
    trialBanner: string;
    openNow: string;
    closedNow: string;
    wifiBtn: string;
    infoBtn: string;
    searchPlaceholder: string;
    allItems: string;
    outOfStock: string;
    fromPrice: string;
    addToNote: string;
    noteLabel: string;
    notePlaceholder: string;
    chooseOption: string;
    tableBarTitle: string;
    tableBarSubtitle: string;
    waiterModeTitle: string;
    waiterModeHint: string;
    clearAll: string;
    subtotal: string;
    serviceFee: string;
    splitBy: string;
    perPerson: string;
    wifiModalTitle: string;
    wifiNetwork: string;
    wifiPass: string;
    copyPass: string;
    copiedPass: string;
    infoModalTitle: string;
    hours: string;
    address: string;
    notices: string;
    emptySearch: string;
  }
> = {
  pt: {
    trialBanner:
      "✨ Modo Demonstração Tápio — Veja como fica o cardápio digital da sua casa na mesa",
    openNow: "Aberto agora",
    closedNow: "Fechado agora",
    wifiBtn: "Wi-Fi da Casa",
    infoBtn: "Informações",
    searchPlaceholder: "Buscar prato, bebida ou ingrediente...",
    allItems: "Todos",
    outOfStock: "Esgotado hoje",
    fromPrice: "A partir de",
    addToNote: "Anotar na Lista da Mesa",
    noteLabel: "Observação para falar ao garçom (opcional)",
    notePlaceholder: "Ex: sem cebola, ponto da carne bem passado, gelo e limão...",
    chooseOption: "Escolha a opção / tamanho",
    tableBarTitle: "Lista da Mesa",
    tableBarSubtitle: "Toque para mostrar ao garçom ou dividir",
    waiterModeTitle: "Caderninho da Mesa — Mostrar ao Garçom",
    waiterModeHint:
      "Esta lista fica apenas no seu celular para facilitar o pedido na mesa. Leia ou mostre esta tela ao garçom.",
    clearAll: "Limpar lista",
    subtotal: "Subtotal estimado",
    serviceFee: "Incluir 10% (taxa de serviço)",
    splitBy: "Dividir entre quantas pessoas?",
    perPerson: "Valor por pessoa",
    wifiModalTitle: "Wi-Fi Gratuito da Casa",
    wifiNetwork: "Rede Wi-Fi",
    wifiPass: "Senha",
    copyPass: "Copiar senha do Wi-Fi",
    copiedPass: "Senha copiada!",
    infoModalTitle: "Informações da Casa",
    hours: "Horário de funcionamento",
    address: "Endereço",
    notices: "Avisos importantes",
    emptySearch: "Nenhum item encontrado para essa busca.",
  },
  en: {
    trialBanner:
      "✨ Tápio Demo Mode — Preview how your digital table menu looks",
    openNow: "Open now",
    closedNow: "Closed now",
    wifiBtn: "House Wi-Fi",
    infoBtn: "Info",
    searchPlaceholder: "Search dish, drink or ingredient...",
    allItems: "All",
    outOfStock: "Sold out today",
    fromPrice: "From",
    addToNote: "Add to Table Note",
    noteLabel: "Note for the waiter (optional)",
    notePlaceholder: "E.g.: no onions, medium well, ice and lemon...",
    chooseOption: "Choose size / option",
    tableBarTitle: "Table Note",
    tableBarSubtitle: "Tap to show waiter or split bill",
    waiterModeTitle: "Table Note — Show to Waiter",
    waiterModeHint:
      "Saved locally on your phone to help your group order easily. Just read or show this screen to your waiter.",
    clearAll: "Clear all",
    subtotal: "Estimated subtotal",
    serviceFee: "Include 10% service tip",
    splitBy: "Split between how many people?",
    perPerson: "Per person",
    wifiModalTitle: "Free House Wi-Fi",
    wifiNetwork: "Network",
    wifiPass: "Password",
    copyPass: "Copy Wi-Fi password",
    copiedPass: "Password copied!",
    infoModalTitle: "Restaurant Info",
    hours: "Opening hours",
    address: "Address",
    notices: "House notices",
    emptySearch: "No menu items matched your search.",
  },
  es: {
    trialBanner:
      "✨ Modo Demostración Tápio — Mira cómo queda la carta digital en la mesa",
    openNow: "Abierto ahora",
    closedNow: "Cerrado ahora",
    wifiBtn: "Wi-Fi Gratis",
    infoBtn: "Info",
    searchPlaceholder: "Buscar plato, bebida o ingrediente...",
    allItems: "Todos",
    outOfStock: "Agotado hoy",
    fromPrice: "Desde",
    addToNote: "Anotar en la Mesa",
    noteLabel: "Observación para el mesero (opcional)",
    notePlaceholder: "Ej: sin cebolla, carne bien cocida, hielo y limón...",
    chooseOption: "Elige tamaño / opción",
    tableBarTitle: "Lista de la Mesa",
    tableBarSubtitle: "Toca para mostrar al mesero o dividir",
    waiterModeTitle: "Notas de la Mesa — Mostrar al Mesero",
    waiterModeHint:
      "Esta lista se guarda solo en tu celular para pedir más fácil en la mesa. Léela o muéstrala al mesero.",
    clearAll: "Limpiar lista",
    subtotal: "Subtotal estimado",
    serviceFee: "Incluir 10% de servicio",
    splitBy: "¿Dividir entre cuántas personas?",
    perPerson: "Por persona",
    wifiModalTitle: "Wi-Fi de la Casa",
    wifiNetwork: "Red Wi-Fi",
    wifiPass: "Contraseña",
    copyPass: "Copiar contraseña",
    copiedPass: "¡Contraseña copiada!",
    infoModalTitle: "Información del Local",
    hours: "Horario de atención",
    address: "Dirección",
    notices: "Avisos importantes",
    emptySearch: "No se encontraron platos para tu búsqueda.",
  },
};

export function TableMenuClient({
  restaurant,
  tableParam,
}: {
  restaurant: Restaurant;
  tableParam?: string;
}) {
  const isDark = restaurant.themeMode === "dark";
  const [lang, setLang] = useState<Lang>("pt");
  const t = UI_COPY[lang];

  // Filters
  const [search, setSearch] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<ItemBadge | "all">("all");
  const [activeCatId, setActiveCatId] = useState<string>(
    restaurant.categories[0]?.id || ""
  );

  // Modals
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedVar, setSelectedVar] = useState<PriceVariation | null>(null);
  const [itemNote, setItemNote] = useState("");
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Caderninho da Mesa (Waiter Note + Bill Splitter)
  const [tableNotes, setTableNotes] = useState<TableNoteItem[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [includeTip, setIncludeTip] = useState(true);
  const [splitCount, setSplitCount] = useState(2);

  const sortedCategories = useMemo(
    () => [...restaurant.categories].sort((a, b) => a.order - b.order),
    [restaurant.categories]
  );

  const filteredByCategory = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedCategories
      .map((cat) => {
        const items = restaurant.items.filter((item) => {
          if (item.categoryId !== cat.id) return false;
          if (badgeFilter !== "all" && !item.badges.includes(badgeFilter)) {
            return false;
          }
          if (q) {
            return (
              item.name.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q)
            );
          }
          return true;
        });
        return { category: cat, items };
      })
      .filter((group) => group.items.length > 0);
  }, [sortedCategories, restaurant.items, search, badgeFilter]);

  const totalNoteCount = useMemo(
    () => tableNotes.reduce((acc, i) => acc + i.quantity, 0),
    [tableNotes]
  );

  const subtotalNote = useMemo(
    () => tableNotes.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
    [tableNotes]
  );

  const totalWithTip = includeTip ? subtotalNote * 1.1 : subtotalNote;
  const perPersonValue = splitCount > 0 ? totalWithTip / splitCount : totalWithTip;

  function openItemModal(item: MenuItem) {
    setSelectedItem(item);
    setSelectedVar(
      item.variations && item.variations.length > 0 ? item.variations[0] : null
    );
    setItemNote("");
  }

  function handleAddToTableNote() {
    if (!selectedItem || !selectedItem.available) return;
    const unitPrice = selectedVar ? selectedVar.price : selectedItem.price;
    const cleanNote = itemNote.trim();
    const key = `${selectedItem.id}__${selectedVar?.id || "base"}__${cleanNote}`;

    setTableNotes((prev) => {
      const existing = prev.find((p) => p.key === key);
      if (existing) {
        return prev.map((p) =>
          p.key === key ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          key,
          itemId: selectedItem.id,
          name: selectedItem.name,
          variationLabel: selectedVar?.label,
          unitPrice,
          quantity: 1,
          note: cleanNote || undefined,
        },
      ];
    });
    setSelectedItem(null);
  }

  function updateNoteQuantity(key: string, delta: number) {
    setTableNotes((prev) =>
      prev
        .map((n) => (n.key === key ? { ...n, quantity: n.quantity + delta } : n))
        .filter((n) => n.quantity > 0)
    );
  }

  async function handleCopyWifi() {
    if (!restaurant.wifiPassword) return;
    try {
      await navigator.clipboard.writeText(restaurant.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2200);
    } catch {
      // ignore
    }
  }

  function scrollToCategory(catId: string) {
    setActiveCatId(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 125;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  const surfaceClass = isDark
    ? "bg-zinc-900 border-zinc-800 text-zinc-100"
    : "bg-white border-slate-200/90 text-slate-900";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-500";

  return (
    <div
      className={`min-h-screen pb-28 transition-colors ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Trial Banner */}
      {restaurant.status === "trial" && (
        <div className="bg-blue-600 text-white text-center text-xs font-bold py-2 px-4">
          {t.trialBanner}
        </div>
      )}

      {/* Cover & Header */}
      <header className="relative">
        <div className="h-44 sm:h-56 w-full relative overflow-hidden">
          <MenuImage
            src={restaurant.coverUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            fallbackBg={isDark ? "bg-zinc-800" : "bg-slate-200"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Language Selector Top Right */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/55 backdrop-blur-md p-1 rounded-full border border-white/15">
            {(
              [
                { id: "pt", label: "🇧🇷 PT" },
                { id: "en", label: "🇺🇸 EN" },
                { id: "es", label: "🇪🇸 ES" },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                  lang === l.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {tableParam && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/15">
              📍 {tableParam}
            </div>
          )}
        </div>

        {/* Store Card Overlapping Cover */}
        <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10">
          <div
            className={`rounded-3xl border shadow-lg p-4 sm:p-5 ${surfaceClass}`}
          >
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 shadow-md"
                style={{ borderColor: restaurant.primaryColor }}
              >
                <MenuImage
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      restaurant.isOpenNow
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {restaurant.isOpenNow ? t.openNow : t.closedNow}
                  </span>
                  <span className={`text-xs font-medium ${mutedText}`}>
                    {restaurant.segment}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 leading-tight">
                  {restaurant.name}
                </h1>
                <p className={`text-xs sm:text-sm mt-1 leading-snug ${mutedText}`}>
                  {restaurant.tagline}
                </p>
              </div>
            </div>

            {/* Quick Action Pills (Wi-Fi + Info + Hours) */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-dashed border-slate-200 dark:border-zinc-800">
              {restaurant.wifiSsid && (
                <button
                  onClick={() => setShowWifiModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                  style={{ backgroundColor: restaurant.primaryColor }}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  {t.wifiBtn}
                </button>
              )}

              <button
                onClick={() => setShowInfoModal(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                {t.infoBtn}
              </button>

              <span className={`inline-flex items-center gap-1 text-xs ${mutedText} ml-auto`}>
                <Clock className="w-3.5 h-3.5" />
                {restaurant.openingHours}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Highlight Banner */}
      {restaurant.highlightBanner && (
        <div className="max-w-3xl mx-auto px-4 mt-4">
          <div
            className="rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm flex items-center gap-2"
            style={{ backgroundColor: restaurant.primaryColor }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{restaurant.highlightBanner}</span>
          </div>
        </div>
      )}

      {/* Sticky Search & Categories Bar */}
      <div
        className={`sticky top-0 z-20 mt-4 border-b backdrop-blur-md transition-colors ${
          isDark
            ? "bg-zinc-950/90 border-zinc-800"
            : "bg-slate-50/90 border-slate-200"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2.5">
          {/* Search + Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${mutedText}`}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border focus:outline-none ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: "all", label: t.allItems, icon: null },
                  {
                    id: "popular",
                    label: BADGE_META.popular.label[lang],
                    icon: Flame,
                  },
                  {
                    id: "chef",
                    label: BADGE_META.chef.label[lang],
                    icon: ChefHat,
                  },
                  {
                    id: "vegetarian",
                    label: BADGE_META.vegetarian.label[lang],
                    icon: Leaf,
                  },
                ] as const
              ).map((f) => {
                const Icon = f.icon;
                const active = badgeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setBadgeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border flex items-center gap-1 transition ${
                      active
                        ? "text-white border-transparent shadow-sm"
                        : isDark
                        ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                    style={
                      active
                        ? { backgroundColor: restaurant.primaryColor }
                        : undefined
                    }
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Category Pills */}
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {sortedCategories.map((cat) => {
              const isActive = activeCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                    isActive
                      ? "text-white shadow-sm"
                      : isDark
                      ? "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: restaurant.primaryColor }
                      : undefined
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Menu Sections */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        {filteredByCategory.length === 0 ? (
          <div className={`rounded-3xl p-10 text-center border ${surfaceClass}`}>
            <p className={`text-sm font-medium ${mutedText}`}>{t.emptySearch}</p>
          </div>
        ) : (
          filteredByCategory.map(({ category, items }) => (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="space-y-3"
            >
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {category.name}
                </h2>
                {category.description && (
                  <p className={`text-xs sm:text-sm mt-0.5 ${mutedText}`}>
                    {category.description}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                {items.map((item) => {
                  const hasVariations =
                    item.variations && item.variations.length > 0;
                  const minPrice = hasVariations
                    ? Math.min(...item.variations!.map((v) => v.price))
                    : item.price;

                  return (
                    <div
                      key={item.id}
                      onClick={() => openItemModal(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") openItemModal(item);
                      }}
                      className={`rounded-2xl border p-3.5 sm:p-4 flex items-center justify-between gap-3.5 cursor-pointer transition hover:shadow-md ${surfaceClass} ${
                        !item.available ? "opacity-65" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {/* Badges */}
                        {(item.badges.length > 0 || !item.available) && (
                          <div className="flex flex-wrap gap-1.5">
                            {!item.available && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                                {t.outOfStock}
                              </span>
                            )}
                            {item.badges.map((b) => (
                              <span
                                key={b}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${BADGE_META[b].colorClass}`}
                              >
                                {BADGE_META[b].emoji} {BADGE_META[b].label[lang]}
                              </span>
                            ))}
                          </div>
                        )}

                        <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p
                            className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${mutedText}`}
                          >
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span
                            className="text-sm sm:text-base font-black"
                            style={{ color: restaurant.primaryColor }}
                          >
                            {hasVariations ? `${t.fromPrice} ` : ""}
                            {formatBRL(minPrice)}
                          </span>
                          {item.serves && (
                            <span className={`text-[11px] ${mutedText}`}>
                              • {item.serves}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0">
                        <MenuImage
                          src={item.imageUrl}
                          alt={item.name}
                          className={`w-full h-full object-cover ${
                            !item.available ? "grayscale" : ""
                          }`}
                          fallbackBg={isDark ? "bg-zinc-800" : "bg-slate-100"}
                        />
                        {item.available && (
                          <span
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md"
                            style={{ backgroundColor: restaurant.primaryColor }}
                          >
                            <Plus className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        <footer className={`pt-6 pb-8 text-center text-xs ${mutedText}`}>
          Cardápio Digital por{" "}
          <strong className="text-orange-600">Tápio</strong> • Experiência na
          mesa
        </footer>
      </main>

      {/* FLOATING TABLE NOTE BAR (CADERNINHO DA MESA) */}
      {totalNoteCount > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-30 px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <button
              onClick={() => setShowTableModal(true)}
              className="w-full rounded-2xl px-4 py-3.5 text-white shadow-2xl flex items-center justify-between gap-3 transition transform active:scale-[0.99]"
              style={{ backgroundColor: restaurant.primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                  {totalNoteCount}
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                    <NotebookPen className="w-4 h-4" />
                    {t.tableBarTitle}
                  </p>
                  <p className="text-[11px] text-white/85">
                    {t.tableBarSubtitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-black">
                  {formatBRL(subtotalNote)}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DO PRODUTO */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border max-h-[90vh] flex flex-col ${surfaceClass}`}
          >
            <div className="relative h-56 sm:h-64 w-full shrink-0">
              <MenuImage
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className={`w-full h-full object-cover ${
                  !selectedItem.available ? "grayscale" : ""
                }`}
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {!selectedItem.available && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white">
                      {t.outOfStock}
                    </span>
                  )}
                  {selectedItem.badges.map((b) => (
                    <span
                      key={b}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${BADGE_META[b].colorClass}`}
                    >
                      {BADGE_META[b].emoji} {BADGE_META[b].label[lang]}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-extrabold">{selectedItem.name}</h2>
                {selectedItem.description && (
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {selectedItem.description}
                  </p>
                )}
                {selectedItem.addonsInfo && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-xl">
                    💡 {selectedItem.addonsInfo}
                  </p>
                )}
              </div>

              {/* Variações */}
              {selectedItem.variations && selectedItem.variations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                    {t.chooseOption}
                  </p>
                  <div className="grid gap-2">
                    {selectedItem.variations.map((v) => {
                      const active = selectedVar?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVar(v)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition ${
                            active
                              ? "border-2"
                              : isDark
                              ? "border-zinc-800 bg-zinc-950/50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                          style={
                            active
                              ? {
                                  borderColor: restaurant.primaryColor,
                                  backgroundColor: `${restaurant.primaryColor}15`,
                                }
                              : undefined
                          }
                        >
                          <span>{v.label}</span>
                          <span>{formatBRL(v.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedItem.available && (
                <div>
                  <label className="block text-xs font-bold opacity-75 mb-1.5">
                    {t.noteLabel}
                  </label>
                  <input
                    type="text"
                    value={itemNote}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder={t.notePlaceholder}
                    className={`w-full text-sm rounded-xl px-3.5 py-2.5 border ${
                      isDark
                        ? "bg-zinc-950 border-zinc-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 shrink-0">
              {selectedItem.available ? (
                <button
                  onClick={handleAddToTableNote}
                  className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition hover:opacity-95"
                  style={{ backgroundColor: restaurant.primaryColor }}
                >
                  <NotebookPen className="w-4 h-4" />
                  {t.addToNote} •{" "}
                  {formatBRL(
                    selectedVar ? selectedVar.price : selectedItem.price
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-slate-300 dark:bg-zinc-800 text-slate-600 dark:text-zinc-500 font-bold text-sm cursor-not-allowed"
                >
                  {t.outOfStock}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADERNINHO DA MESA (GARÇOM + DIVISÃO DE CONTA) */}
      {showTableModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-4"
          onClick={() => setShowTableModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border max-h-[92vh] flex flex-col ${surfaceClass}`}
          >
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <NotebookPen
                    className="w-5 h-5"
                    style={{ color: restaurant.primaryColor }}
                  />
                  {t.waiterModeTitle}
                </h3>
                <p className={`text-xs mt-1 ${mutedText}`}>
                  {t.waiterModeHint}
                </p>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              {tableNotes.map((entry) => (
                <div
                  key={entry.key}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-extrabold text-base leading-snug">
                      <span
                        className="mr-1.5"
                        style={{ color: restaurant.primaryColor }}
                      >
                        {entry.quantity}x
                      </span>
                      {entry.name}
                    </p>
                    {entry.variationLabel && (
                      <p className={`text-xs font-semibold ${mutedText}`}>
                        Opção: {entry.variationLabel}
                      </p>
                    )}
                    {entry.note && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                        Obs: {entry.note}
                      </p>
                    )}
                    <p className="text-xs font-bold mt-1">
                      {formatBRL(entry.unitPrice * entry.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateNoteQuantity(entry.key, -1)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                        isDark
                          ? "border-zinc-700 bg-zinc-900"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateNoteQuantity(entry.key, 1)}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                        isDark
                          ? "border-zinc-700 bg-zinc-900"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Calculadora de Divisão de Conta na Mesa */}
              <div
                className={`mt-4 p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-orange-50/60 border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className={mutedText}>{t.subtotal}</span>
                  <span className="font-bold">{formatBRL(subtotalNote)}</span>
                </div>

                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span className="font-medium">{t.serviceFee}</span>
                  <input
                    type="checkbox"
                    checked={includeTip}
                    onChange={(e) => setIncludeTip(e.target.checked)}
                    className="w-4 h-4 accent-orange-600"
                  />
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-300 dark:border-zinc-700">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {t.splitBy}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitCount((c) => Math.max(1, c - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-extrabold text-sm">
                      {splitCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSplitCount((c) => Math.min(12, c + 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold">
                    {t.perPerson} ({splitCount}x)
                  </span>
                  <span
                    className="text-xl font-black"
                    style={{ color: restaurant.primaryColor }}
                  >
                    {formatBRL(perPersonValue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setTableNotes([]);
                  setShowTableModal(false);
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearAll}
              </button>
              <button
                onClick={() => setShowTableModal(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-extrabold text-white"
                style={{ backgroundColor: restaurant.primaryColor }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WI-FI DA CASA */}
      {showWifiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowWifiModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl text-center space-y-4 ${surfaceClass}`}
          >
            <div
              className="w-14 h-14 mx-auto rounded-2xl text-white flex items-center justify-center"
              style={{ backgroundColor: restaurant.primaryColor }}
            >
              <Wifi className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold">{t.wifiModalTitle}</h3>
            <div
              className={`rounded-2xl p-4 space-y-2 border ${
                isDark
                  ? "bg-zinc-950 border-zinc-800"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <p className={`text-[11px] uppercase font-bold ${mutedText}`}>
                  {t.wifiNetwork}
                </p>
                <p className="font-extrabold text-base">{restaurant.wifiSsid}</p>
              </div>
              {restaurant.wifiPassword && (
                <div>
                  <p className={`text-[11px] uppercase font-bold ${mutedText}`}>
                    {t.wifiPass}
                  </p>
                  <p className="font-mono font-bold text-lg tracking-wider">
                    {restaurant.wifiPassword}
                  </p>
                </div>
              )}
            </div>

            {restaurant.wifiPassword && (
              <button
                onClick={handleCopyWifi}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: restaurant.primaryColor }}
              >
                {copiedWifi ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t.copiedPass}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t.copyPass}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL INFORMAÇÕES DA LOJA */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${surfaceClass}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{t.infoModalTitle}</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                <div>
                  <p className="font-bold text-xs uppercase opacity-60">
                    {t.hours}
                  </p>
                  <p>{restaurant.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                <div>
                  <p className="font-bold text-xs uppercase opacity-60">
                    {t.address}
                  </p>
                  <p>
                    {restaurant.address} — {restaurant.city}
                  </p>
                </div>
              </div>

              {restaurant.instagram && (
                <div className="flex items-start gap-3">
                  <Instagram className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                  <div>
                    <p className="font-bold text-xs uppercase opacity-60">
                      Instagram
                    </p>
                    <p>{restaurant.instagram}</p>
                  </div>
                </div>
              )}

              {restaurant.serviceFeeNotice && (
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                    isDark
                      ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <strong className="block mb-0.5">{t.notices}:</strong>
                  {restaurant.serviceFeeNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
