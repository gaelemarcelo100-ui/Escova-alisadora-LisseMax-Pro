import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { PRODUCT_PRICING, ProductVariant, formatBRL } from '../data/productData';
import { ResilientImage } from './ResilientImage';

export interface CartItem {
  variant: ProductVariant;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [orderCode, setOrderCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    cep: '',
    address: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const cashSubtotal = totalUnits * PRODUCT_PRICING.cashPrice;
  const installmentEach = totalUnits * PRODUCT_PRICING.installmentValue;

  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setFormData((prev) => ({ ...prev, cep: formatted }));
  };

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.whatsapp.trim() ||
      !formData.email.trim() ||
      formData.cep.replace(/\D/g, '').length < 8 ||
      !formData.address.trim()
    ) {
      setFormError('Por favor, preencha todos os campos de entrega corretamente.');
      return;
    }

    setFormError('');
    const generatedCode = `MG-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderCode(generatedCode);
    setStep('confirmed');
    onClearCart();
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('cart');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Sacola de compras"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-bold text-[#111113]">
              {step === 'cart' && `Sua Sacola (${totalUnits})`}
              {step === 'checkout' && 'Finalizar Pedido'}
              {step === 'confirmed' && 'Pedido Confirmado'}
            </h2>
            {step !== 'confirmed' && (
              <p className="text-xs text-[#028030] font-medium">
                Frete Grátis para todo o Brasil · Envio em até 24h
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Fechar sacola"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'confirmed' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#028030]/10 text-[#028030] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-[#028030] uppercase">
                  Pedido {orderCode} Confirmado
                </p>
                <h3 className="text-xl font-bold text-[#111113]">
                  Obrigada pela sua compra, {formData.name.split(' ')[0]}!
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Enviamos os detalhes e o código de rastreamento para{' '}
                  <strong className="text-zinc-900">{formData.email}</strong> e atualizações no
                  WhatsApp <strong className="text-zinc-900">{formData.whatsapp}</strong>.
                </p>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Forma de pagamento:</span>
                  <span className="font-medium text-zinc-900">
                    {paymentMethod === 'pix'
                      ? 'PIX à vista'
                      : 'Cartão de Crédito (12x)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Endereço de entrega:</span>
                  <span className="font-medium text-zinc-900 text-right max-w-[200px] truncate">
                    {formData.address} · CEP {formData.cep}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Prazo estimado:</span>
                  <span className="font-medium text-[#028030]">2 a 5 dias úteis</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="w-full py-3 px-5 rounded-lg bg-[#111113] text-white font-semibold text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Voltar à Página do Produto
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-semibold text-zinc-900">Sua sacola está vazia</p>
              <p className="text-sm text-zinc-500">
                Escolha a sua cor favorita da Escova Alisadora 5 em 1 para começar.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#00A650] text-white text-sm font-semibold hover:bg-[#008A42] transition-colors cursor-pointer"
              >
                Escolher Cor
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.variant.id}
                  className="flex gap-4 p-3 rounded-xl border border-zinc-200 bg-white"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                    <ResilientImage
                      src={item.variant.image}
                      alt={`Escova Alisadora 5 em 1 MultiGlam - Cor ${item.variant.name}`}
                      fallbackLabel={item.variant.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#111113] leading-snug">
                          Escova Alisadora 5 em 1 Bivolt
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Cor: <strong className="text-zinc-800">{item.variant.name}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.variant.id)}
                        aria-label={`Remover cor ${item.variant.name}`}
                        className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-zinc-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.variant.id, -1)}
                          aria-label="Diminuir quantidade"
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-sm font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.variant.id, 1)}
                          aria-label="Aumentar quantidade"
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#111113] tabular-nums">
                        {formatBRL(item.quantity * PRODUCT_PRICING.cashPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[#00A650] font-medium">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Frete Grátis Nacional aplicado</span>
                </div>
                <p className="text-xs text-zinc-600">
                  Garantia de 30 dias e devolução gratuita em até 14 dias após o recebimento.
                </p>
              </div>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-zinc-700">
                  Forma de Pagamento
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-[#00A650] bg-[#00A650]/5'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#111113]">PIX à vista</p>
                    <p className="text-sm font-bold text-[#00A650] tabular-nums mt-0.5">
                      {formatBRL(cashSubtotal)}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#00A650] bg-[#00A650]/5'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#111113]">Cartão de Crédito</p>
                    <p className="text-sm font-bold text-[#111113] tabular-nums mt-0.5">
                      12x de {formatBRL(installmentEach)}
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Maria Clara Oliveira"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#00A650]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#00A650]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">CEP</label>
                    <input
                      type="text"
                      required
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 tabular-nums focus:outline-none focus:border-[#00A650]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    E-mail para rastreamento
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#00A650]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Endereço completo e número
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Rua, número, bairro e cidade/UF"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#00A650]"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
            </form>
          )}
        </div>

        {items.length > 0 && step !== 'confirmed' && (
          <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Frete</span>
                <span className="font-semibold text-[#00A650]">Grátis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">Total à vista</span>
                <span className="text-lg font-bold text-[#111113] tabular-nums">
                  {formatBRL(cashSubtotal)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 text-right tabular-nums">
                ou em até 12x de {formatBRL(installmentEach)} no cartão
              </p>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-5 rounded-lg bg-[#00A650] hover:bg-[#008A42] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>FINALIZAR COMPRA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-700 font-semibold text-sm hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 py-3.5 px-5 rounded-lg bg-[#00A650] hover:bg-[#008A42] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>CONCLUIR PEDIDO</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-[#00A650]" />
              <span>Ambiente criptografado · Compra 100% protegida</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
