"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Nfc,
  Printer,
  QrCode,
  Wifi,
  X,
} from "lucide-react";
import { Restaurant } from "@/types/menu";

interface QrCodeModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function QrCodeModal({ restaurant, onClose }: QrCodeModalProps) {
  const [origin, setOrigin] = useState("https://tapio.app");
  const [tableLabel, setTableLabel] = useState("");
  const [includeWifi, setIncludeWifi] = useState(Boolean(restaurant.wifiSsid));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const menuUrl = `${origin}/${restaurant.slug}${
    tableLabel.trim() ? `?mesa=${encodeURIComponent(tableLabel.trim())}` : ""
  }`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=${encodeURIComponent(
    menuUrl
  )}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Plaquinha de Mesa — QR Code &amp; NFC
              </h3>
              <p className="text-xs text-slate-500">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Preview da Plaquinha Imprimível */}
          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-2xl p-5">
            <div
              id="printable-table-tent"
              className="w-full max-w-[300px] bg-white rounded-3xl shadow-lg border-2 overflow-hidden flex flex-col items-center text-center"
              style={{ borderColor: restaurant.primaryColor }}
            >
              <div
                className="w-full py-4 px-5 text-white"
                style={{ backgroundColor: restaurant.primaryColor }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-90">
                  Cardápio Digital
                </p>
                <h4 className="text-lg font-extrabold leading-tight mt-0.5">
                  {restaurant.name}
                </h4>
                {tableLabel.trim() && (
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                    {tableLabel.trim()}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full mb-3">
                  <Nfc className="w-3.5 h-3.5 text-orange-600" />
                  <span>Aproxime o celular ou escaneie</span>
                </div>

                <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <img
                    src={qrImageUrl}
                    alt={`QR Code para ${restaurant.name}`}
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  Aponte a câmera do seu celular para ver fotos, valores e montar
                  sua anotação da mesa.
                </p>

                {includeWifi && restaurant.wifiSsid && (
                  <div className="w-full mt-3 pt-3 border-t border-dashed border-slate-200 text-xs text-slate-700 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Wi-Fi: {restaurant.wifiSsid}</span>
                    </div>
                    {restaurant.wifiPassword && (
                      <span className="text-[11px] text-slate-500">
                        Senha:{" "}
                        <strong className="font-mono text-slate-800">
                          {restaurant.wifiPassword}
                        </strong>
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  Tecnologia Tápio • tapio.app/{restaurant.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Controles da Plaquinha e Links */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Link Direto do Cardápio (Para gravar na Tag NFC)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={menuUrl}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Identificação da Mesa (Opcional na Plaquinha)
                </label>
                <input
                  type="text"
                  value={tableLabel}
                  onChange={(e) => setTableLabel(e.target.value)}
                  placeholder="Ex: Mesa 04, Balcão ou deixe em branco"
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {restaurant.wifiSsid && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWifi}
                    onChange={(e) => setIncludeWifi(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-600"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    Mostrar senha do Wi-Fi no rodapé da plaquinha
                  </span>
                </label>
              )}

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">💡 Dica comercial de gravação NFC:</p>
                <p className="leading-relaxed">
                  Para plaquinhas de demonstração reutilizáveis, grave um link
                  curto (ex: <code className="font-mono">/m/demo1</code>) na tag
                  NFC. Assim você troca o restaurante de destino direto pelo
                  Painel Master sem regravar o chip!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Imprimir Plaquinha / PDF
              </button>
              <a
                href={qrImageUrl}
                download={`qrcode-${restaurant.slug}.png`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                Baixar QR
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
