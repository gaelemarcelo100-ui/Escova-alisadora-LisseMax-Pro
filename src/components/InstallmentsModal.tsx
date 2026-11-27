import { useEffect } from 'react';
import { X, CreditCard, QrCode, FileText } from 'lucide-react';
import { INSTALLMENT_TABLE, PRODUCT_PRICING, formatBRL } from '../data/productData';

interface InstallmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallmentsModal({ isOpen, onClose }: InstallmentsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="installments-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <h3 id="installments-modal-title" className="text-lg font-bold text-[#111113]">
            Opções de Pagamento
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar opções de pagamento"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-lg border border-[#028030]/30 bg-[#028030]/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#028030] mb-1">
                <QrCode className="w-4 h-4 shrink-0" />
                <span>PIX à vista</span>
              </div>
              <p className="text-xl font-bold text-[#111113] tabular-nums">
                {formatBRL(PRODUCT_PRICING.cashPrice)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Aprovação imediata e despacho prioritário.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 mb-1">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Boleto Bancário</span>
              </div>
              <p className="text-xl font-bold text-[#111113] tabular-nums">
                {formatBRL(PRODUCT_PRICING.cashPrice)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Vencimento em até 2 dias corridos.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111113] mb-3">
              <CreditCard className="w-4 h-4 text-zinc-700" />
              <span>Cartão de Crédito (Visa, Mastercard, Elo, Amex, Hipercard)</span>
            </div>

            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-200 overflow-hidden">
              {INSTALLMENT_TABLE.map((opt) => (
                <div
                  key={opt.count}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    opt.count === 1 || opt.count === 12 ? 'bg-zinc-50 font-semibold' : 'bg-white'
                  }`}
                >
                  <span className="text-[#111113] tabular-nums">
                    {opt.count}x de {formatBRL(opt.installmentValue)}
                  </span>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    Total: {formatBRL(opt.totalValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
