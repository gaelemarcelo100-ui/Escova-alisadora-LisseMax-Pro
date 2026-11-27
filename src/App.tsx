import { useState, useEffect, type FormEvent } from 'react';
import {
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  Lock,
  CheckCircle2,
  Headphones,
  Award,
  Camera,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  GALLERY_IMAGES,
  DESCRIPTION_IMAGES,
  PRODUCT_VARIANTS,
  PRODUCT_PRICING,
  CLONED_REVIEWS,
  TECHNICAL_SPECS,
  ProductVariant,
  ClonedReviewItem,
  formatBRL,
} from './data/productData';
import { ResilientImage } from './components/ResilientImage';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { InstallmentsModal } from './components/InstallmentsModal';
import { PolicyModal, PolicyTopic } from './components/PolicyModal';
import { ReviewLightboxModal } from './components/ReviewLightboxModal';

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(PRODUCT_VARIANTS[0]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<PolicyTopic>(null);

  // CEP shipping calculator
  const [cepInput, setCepInput] = useState<string>('');
  const [cepResult, setCepResult] = useState<{ cep: string; valid: boolean; message: string } | null>(
    null
  );

  // Reviews state (all 168 real reviews preserved)
  const [reviews, setReviews] = useState<ClonedReviewItem[]>(CLONED_REVIEWS);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'photos' | 'five'>('all');
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(12);
  const [lightboxReview, setLightboxReview] = useState<ClonedReviewItem | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({ author: '', comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Floating accompanying buy dock state (follows scroll down AND scroll up)
  const [showFloatingBuy, setShowFloatingBuy] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingBuy(window.scrollY > 120);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    const matchingSlide = GALLERY_IMAGES.findIndex((s) => s.variantId === variant.id);
    if (matchingSlide !== -1) {
      setActiveSlideIndex(matchingSlide);
    }
  };

  const handleSelectSlide = (index: number) => {
    setActiveSlideIndex(index);
    const slide = GALLERY_IMAGES[index];
    if (slide.variantId) {
      const matched = PRODUCT_VARIANTS.find((v) => v.id === slide.variantId);
      if (matched) setSelectedVariant(matched);
    }
  };

  const handlePrevSlide = () => {
    const nextIdx = (activeSlideIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    handleSelectSlide(nextIdx);
  };

  const handleNextSlide = () => {
    const nextIdx = (activeSlideIndex + 1) % GALLERY_IMAGES.length;
    handleSelectSlide(nextIdx);
  };

  const addToCartAndOpen = (variant: ProductVariant, qty: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { variant, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.variant.id === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const handleCepInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCepInput(masked);
  };

  const handleCalculateShipping = (e: FormEvent) => {
    e.preventDefault();
    const digits = cepInput.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepResult({
        cep: cepInput,
        valid: false,
        message: 'Digite um CEP válido com 8 dígitos.',
      });
      return;
    }
    setCepResult({
      cep: cepInput,
      valid: true,
      message: 'Frete Grátis confirmado · Entrega em 2 a 5 dias úteis!',
    });
  };

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim()) return;
    const item: ClonedReviewItem = {
      id: `rev-custom-${Date.now()}`,
      author: newReview.author.trim(),
      stars: 5,
      comment: newReview.comment.trim(),
      localImgs: [],
      verified: true,
    };
    setReviews((prev) => [item, ...prev]);
    setNewReview({ author: '', comment: '' });
    setShowReviewForm(false);
    setReviewSuccess(true);
  };

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'photos') return r.localImgs.length > 0;
    if (reviewFilter === 'five') return r.stars === 5;
    return true;
  });

  const displayedReviews = filteredReviews.slice(0, visibleReviewCount);
  const photoReviews = reviews.filter((r) => r.localImgs.length > 0);
  const activeSlide = GALLERY_IMAGES[activeSlideIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB] text-[#1E1017] overflow-x-clip">
      {/* Top Announcement Bar — Deep Plum Noir */}
      <div className="bg-[#1E1017] text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center tracking-wide">
        <span>Frete Grátis para Todo o Brasil</span>
        <span className="mx-2 text-rose-300/60" aria-hidden="true">
          ·
        </span>
        <span>Envio Nacional em até 24h úteis</span>
      </div>

      {/* Static 3-Zone Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-[#EADFE3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#produto"
            className="font-editorial text-2xl font-bold tracking-tight text-[#1E1017] whitespace-nowrap shrink-0"
          >
            MultiGlam
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5B4751]"
          >
            <a
              href="#produto"
              className="hover:text-[#1E1017] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Produto
            </a>
            <a
              href="#descricao"
              className="hover:text-[#1E1017] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Benefícios 5 em 1
            </a>
            <a
              href="#especificacoes"
              className="hover:text-[#1E1017] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Especificações
            </a>
            <a
              href="#avaliacoes"
              className="hover:text-[#1E1017] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Avaliações ({reviews.length})
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1017] hover:bg-[#331C28] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sacola</span>
            <span className="tabular-nums text-xs bg-white/15 px-1.5 py-0.5 rounded-md">
              {totalCartUnits}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* ============================================================
            SECTION 1: HIGH-CONVERTING HERO BUY MODULE
           ============================================================ */}
        <section id="produto" className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-14 lg:pt-10 lg:pb-20">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#7D6671] mb-6 flex items-center gap-1.5 overflow-hidden"
          >
            <a href="#produto" className="hover:text-[#1E1017] transition-colors shrink-0">
              Início
            </a>
            <span aria-hidden="true">/</span>
            <span className="shrink-0">Beleza Profissional</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#1E1017] font-medium truncate">
              Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: 10-Image Product Gallery (UNCHANGED) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-square w-full rounded-2xl border border-[#EADFE3] bg-white overflow-hidden shadow-[0_10px_34px_rgba(30,16,23,0.05)] group">
                <ResilientImage
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  fallbackLabel={activeSlide.label}
                  className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.02]"
                />

                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Imagem anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white border border-[#EADFE3] text-[#1E1017] flex items-center justify-center shadow-sm transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Próxima imagem"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white border border-[#EADFE3] text-[#1E1017] flex items-center justify-center shadow-sm transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3.5 left-3.5 bg-white/95 backdrop-blur-xs border border-[#EADFE3] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1E1017] shadow-xs tabular-nums">
                  {activeSlideIndex + 1}/{GALLERY_IMAGES.length} · {activeSlide.label}
                </div>
              </div>

              {/* 10 Thumbnails */}
              <div className="flex sm:grid sm:grid-cols-5 gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {GALLERY_IMAGES.map((slide, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={`${slide.label}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSlide(idx)}
                      aria-label={`Ver foto ${slide.label}`}
                      className={`relative shrink-0 w-18 h-18 sm:w-auto sm:h-auto sm:aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                        isActive
                          ? 'border-[#9D174D] ring-2 ring-[#9D174D]/15'
                          : 'border-[#EADFE3] hover:border-[#9D174D]/50 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <ResilientImage
                        src={slide.src}
                        alt={slide.alt}
                        fallbackLabel={slide.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: High-Conversion Purchase Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 bg-white border border-[#EADFE3] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_14px_40px_rgba(30,16,23,0.06)]">
              <div className="space-y-3">
                <p className="text-xs font-extrabold tracking-wider uppercase text-[#9D174D]">
                  Envio Nacional · Bivolt 110V/220V · Pronta Entrega
                </p>

                <h1 className="font-editorial text-2xl sm:text-[32px] font-bold tracking-tight text-[#1E1017] leading-[1.18] text-balance">
                  Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional
                </h1>

                <a
                  href="#avaliacoes"
                  className="inline-flex items-center gap-2 text-sm text-[#5B4751] hover:text-[#1E1017] transition-colors"
                >
                  <span className="font-bold text-[#1E1017] tabular-nums">4.9</span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                  <span className="text-[#D4C5CB]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#5B4751] underline underline-offset-4 tabular-nums">
                    {reviews.length} avaliações reais
                  </span>
                </a>
              </div>

              {/* Price & Installments Box */}
              <div className="rounded-2xl bg-[#FFF6F9] border border-[#F3DCE5] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7D6671] line-through tabular-nums">
                    De {formatBRL(PRODUCT_PRICING.compareAtPrice)}
                  </span>
                  <span className="font-extrabold text-[#9D174D] tabular-nums">
                    Economize{' '}
                    {formatBRL(PRODUCT_PRICING.compareAtPrice - PRODUCT_PRICING.cashPrice)} hoje
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl sm:text-[42px] font-extrabold text-[#1E1017] tracking-tight tabular-nums leading-none">
                    {formatBRL(PRODUCT_PRICING.cashPrice)}
                  </span>
                  <span className="text-sm font-extrabold text-[#00A650]">à vista</span>
                </div>

                <p className="text-base text-[#3D2C35] tabular-nums pt-0.5">
                  ou{' '}
                  <strong className="font-extrabold text-[#1E1017]">
                    {PRODUCT_PRICING.installmentCount}x de{' '}
                    {formatBRL(PRODUCT_PRICING.installmentValue)}
                  </strong>{' '}
                  no cartão
                </p>

                <button
                  type="button"
                  onClick={() => setIsInstallmentsOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9D174D] hover:text-[#1E1017] underline underline-offset-4 pt-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Ver parcelas e pagamento no PIX</span>
                </button>
              </div>

              {/* Color Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#5B4751]">
                    Cor: <strong className="text-[#1E1017]">{selectedVariant.name}</strong>
                  </span>
                  <span className="text-xs font-bold text-[#00A650]">
                    {selectedVariant.stockLabel}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {PRODUCT_VARIANTS.map((variant) => {
                    const isSelected = variant.id === selectedVariant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'border-[#1E1017] bg-[#FFF6F9] text-[#1E1017] shadow-xs'
                            : 'border-[#EADFE3] bg-white text-[#5B4751] hover:border-[#9D174D]/50'
                        }`}
                      >
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-[#EADFE3]">
                          <ResilientImage
                            src={variant.image}
                            alt={`Cor ${variant.name}`}
                            fallbackLabel={variant.name}
                          />
                        </div>
                        <span className="whitespace-nowrap">{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity + MASSIVE Full-Width Buy Button */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-[#5B4751]">Quantidade</span>
                  <div className="inline-flex items-center border border-[#EADFE3] rounded-xl bg-[#FFFDFB]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                      className="p-2.5 text-[#5B4751] hover:text-[#1E1017] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-extrabold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Aumentar quantidade"
                      className="p-2.5 text-[#5B4751] hover:text-[#1E1017] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extra-Large High-Conversion CTA Button */}
                <button
                  type="button"
                  onClick={() => addToCartAndOpen(selectedVariant, quantity)}
                  className="w-full py-5 sm:py-6 px-8 rounded-2xl bg-[#00A650] hover:bg-[#008A42] active:scale-[0.99] text-white font-extrabold text-lg sm:text-xl tracking-wide transition-all shadow-[0_12px_28px_rgba(0,166,80,0.32)] cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-6 h-6 shrink-0" />
                  <span>COMPRAR AGORA</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 text-[11px] font-semibold text-[#5B4751]">
                  {['PIX', 'Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'].map((brand) => (
                    <span
                      key={brand}
                      className="px-2 py-0.5 rounded border border-[#EADFE3] bg-[#FFFDFB]"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shipping & CEP Simulator */}
              <div className="rounded-xl border border-[#EADFE3] bg-[#FFFDFB] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 font-bold text-[#00A650]">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Frete Grátis Nacional</span>
                  </div>
                  <span className="text-xs font-semibold text-[#5B4751]">
                    Receba em 2 a 5 dias úteis
                  </span>
                </div>

                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-[#9D8590] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cepInput}
                      onChange={(e) => handleCepInputChange(e.target.value)}
                      placeholder="Seu CEP (00000-000)"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-[#D9C8CF] bg-white tabular-nums focus:outline-none focus:border-[#00A650]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg border border-[#D9C8CF] bg-white hover:bg-[#FFF6F9] text-xs font-bold text-[#1E1017] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Calcular
                  </button>
                </form>

                {cepResult && (
                  <p
                    className={`text-xs font-bold ${
                      cepResult.valid ? 'text-[#00A650]' : 'text-red-700'
                    }`}
                  >
                    {cepResult.message}
                  </p>
                )}
              </div>

              {/* Compact Guarantee + Proof Metrics */}
              <div className="border-t border-[#EADFE3] pt-4 space-y-3.5 text-xs text-[#5B4751]">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#00A650] shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-[#1E1017]">Devolução Gratuita em 14 Dias:</strong>{' '}
                    estorno de 100% do seu dinheiro sem burocracia.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F4ECEF] text-center">
                  <div className="p-2.5 rounded-xl bg-[#FFF6F9] border border-[#F3DCE5]">
                    <p className="font-extrabold text-[#1E1017] text-sm tabular-nums">9.859+</p>
                    <p className="text-[11px] text-[#5B4751] leading-tight mt-0.5">
                      Envios em 60 dias
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF6F9] border border-[#F3DCE5]">
                    <p className="font-extrabold text-[#00A650] text-sm">4.9 ★</p>
                    <p className="text-[11px] text-[#5B4751] leading-tight mt-0.5">
                      Aprovação real
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF6F9] border border-[#F3DCE5]">
                    <p className="font-extrabold text-[#00A650] text-sm">2–5 dias</p>
                    <p className="text-[11px] text-[#5B4751] leading-tight mt-0.5">
                      Entrega rápida
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 2: CONCISE HIGH-CONVERSION COPY + LARGER TYPOGRAPHY
            (ALL 5 ORIGINAL DESCRIPTION IMAGES PRESERVED)
           ============================================================ */}
        <section id="descricao" className="bg-white border-y border-[#EADFE3] py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20">
            {/* Block 1: Hook & Transformation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-6 space-y-5">
                <p className="text-sm font-extrabold uppercase tracking-wider text-[#9D174D]">
                  Cabelo de Salão em Minutos
                </p>
                <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1E1017] leading-[1.12] text-balance">
                  Chega de perder horas e dinheiro no salão.
                </h2>
                <p className="text-lg sm:text-xl text-[#4A3842] leading-relaxed">
                  Tenha <strong className="text-[#1E1017]">fios lisos, alinhados e com brilho</strong>{' '}
                  em poucos minutos na frente do espelho — sem esforço e sem sair de casa.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-[#EADFE3] bg-[#FFFDFB] shadow-sm">
                  <ResilientImage
                    src={DESCRIPTION_IMAGES[0]}
                    alt="Escova Alisadora e Modeladora Elétrica 5 em 1 MultiGlam"
                    fallbackLabel="MultiGlam 5 em 1"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Block 2: Dark Plum-Noir Showcase — 5 em 1 */}
            <div className="rounded-3xl bg-[#1E1017] text-white p-7 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center shadow-xl">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/20">
                  <ResilientImage
                    src={DESCRIPTION_IMAGES[1]}
                    alt="Escova alisadora elétrica com tecnologia iônica anti frizz"
                    fallbackLabel="Tecnologia Iônica 5 em 1"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-extrabold uppercase tracking-wider text-rose-300">
                    Multi Funções 5 em 1
                  </p>
                  <h3 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight text-balance">
                    5 resultados em uma única passada.
                  </h3>
                  <p className="text-lg sm:text-xl text-rose-100/85 leading-relaxed">
                    Substitui secador e chapinha com proteção térmica e brilho imediato.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    '01. Alisamento rápido',
                    '02. Alinhamento da raiz às pontas',
                    '03. Modelagem natural',
                    '04. Selagem das cutículas',
                    '05. Ação Anti-Frizz iônica',
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-4 rounded-xl bg-white/8 border border-white/12 flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Block 3: Simplicity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-[#EADFE3] bg-[#FFFDFB] shadow-sm">
                  <ResilientImage
                    src={DESCRIPTION_IMAGES[2]}
                    alt="Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional"
                    fallbackLabel="Bivolt Profissional"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <p className="text-sm font-extrabold uppercase tracking-wider text-[#9D174D]">
                  Fácil de Usar
                </p>
                <h3 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1E1017] leading-[1.12] text-balance">
                  Ligou, aqueceu, penteou. Pronto.
                </h3>
                <p className="text-lg sm:text-xl text-[#4A3842] leading-relaxed">
                  Aquece em segundos e desliza suave da raiz às pontas, deixando os fios{' '}
                  <strong className="text-[#1E1017]">lisos e sedosos mesmo sem prática</strong>.
                </p>
              </div>
            </div>

            {/* Block 4: Compact Dual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-[#EADFE3] bg-[#FFF9FB] overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-white border-b border-[#EADFE3] overflow-hidden">
                  <ResilientImage
                    src={DESCRIPTION_IMAGES[3]}
                    alt="Tecnologia da Escova Alisadora 5 em 1 MultiGlam"
                    fallbackLabel="Economize Tempo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 sm:p-9 space-y-3 flex-1">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1017]">
                    Economize Tempo Todo Dia
                  </h3>
                  <p className="text-base sm:text-lg text-[#4A3842] leading-relaxed">
                    Sem química e sem cansaço: cabelo{' '}
                    <strong className="text-[#1E1017]">liso, brilhante e macio</strong> antes de
                    sair de casa.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#EADFE3] bg-[#FFF9FB] overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-white border-b border-[#EADFE3] overflow-hidden">
                  <ResilientImage
                    src={DESCRIPTION_IMAGES[4]}
                    alt="Arrase com os cabelos dos sonhos usando a MultiGlam Bivolt"
                    fallbackLabel="Portátil e Bivolt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 sm:p-9 space-y-3 flex-1">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E1017]">
                    Leve Para Qualquer Lugar
                  </h3>
                  <p className="text-base sm:text-lg text-[#4A3842] leading-relaxed">
                    Compacta e <strong className="text-[#1E1017]">Bivolt Automática (110V/220V)</strong>{' '}
                    para usar no trabalho, academia ou viagens.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Specs Sheet */}
            <div id="especificacoes" className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#9D174D]">
                  Ficha Técnica
                </p>
                <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1E1017]">
                  Especificações do Aparelho
                </h3>
              </div>

              <div className="bg-[#FFF9FB] border border-[#EADFE3] rounded-2xl overflow-hidden divide-y divide-[#EADFE3]">
                {TECHNICAL_SPECS.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-6 py-4 text-sm sm:text-base"
                  >
                    <span className="text-[#5B4751] font-medium">{spec.label}</span>
                    <span className="text-[#1E1017] font-bold sm:text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 3: ALL 168 CUSTOMER REVIEWS & REAL PHOTOS (UNCHANGED)
           ============================================================ */}
        <section id="avaliacoes" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#9D174D]">
              Mais de 10 mil clientes satisfeitas
            </p>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#1E1017] tracking-tight">
              Veja o que nossas clientes estão recebendo
            </h2>
            <p className="text-base sm:text-lg text-[#5B4751]">
              Clientes reais mostrando seus produtos e compartilhando os resultados nos fios.
            </p>
          </div>

          {/* 10 Real Customer Photos Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E1017] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#9D174D]" />
                <span>Fotos enviadas por clientes ({photoReviews.length})</span>
              </h3>
              <span className="text-xs text-[#7D6671]">Toque para ampliar</span>
            </div>

            <div className="flex sm:grid sm:grid-cols-10 gap-2.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {photoReviews.map((rev) => (
                <button
                  key={`photo-${rev.id}`}
                  type="button"
                  onClick={() => setLightboxReview(rev)}
                  aria-label={`Ampliar foto enviada por ${rev.author}`}
                  className="shrink-0 w-20 h-20 sm:w-auto sm:h-auto sm:aspect-square rounded-xl overflow-hidden border border-[#EADFE3] hover:border-[#9D174D] transition-all hover:scale-[1.03] bg-white cursor-pointer shadow-2xs"
                >
                  <ResilientImage
                    src={rev.localImgs[0]}
                    alt={`Foto enviada por ${rev.author}`}
                    fallbackLabel={rev.author}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 4.9 / 5.0 Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-[#EADFE3] shadow-xs items-center">
            <div className="md:col-span-4 flex items-center gap-5">
              <div>
                <p className="text-5xl font-extrabold text-[#1E1017] tabular-nums tracking-tight">
                  4.9
                </p>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="text-sm text-[#5B4751]">
                <p className="font-bold text-[#1E1017] tabular-nums">
                  {reviews.length} avaliações
                </p>
                <p>95% deram nota máxima</p>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5 text-xs tabular-nums">
              {[
                { stars: 5, count: 160 + (reviews.length - CLONED_REVIEWS.length), pct: 95 },
                { stars: 4, count: 8, pct: 5 },
                { stars: 3, count: 0, pct: 0 },
                { stars: 2, count: 0, pct: 0 },
                { stars: 1, count: 0, pct: 0 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2.5">
                  <span className="w-8 font-semibold text-[#3D2C35]">{row.stars} ★</span>
                  <div className="flex-1 h-2.5 bg-[#FFF6F9] rounded-full overflow-hidden border border-[#EADFE3]">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#7D6671] font-medium">{row.count}</span>
                </div>
              ))}
            </div>

            <div className="md:col-span-3 flex flex-col gap-2.5 md:items-end">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: `Todas (${reviews.length})` },
                  { id: 'photos', label: `Com Fotos (${photoReviews.length})` },
                  { id: 'five', label: '5 Estrelas' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setReviewFilter(tab.id as typeof reviewFilter);
                      setVisibleReviewCount(12);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      reviewFilter === tab.id
                        ? 'bg-[#1E1017] text-white'
                        : 'bg-[#FFF9FB] border border-[#EADFE3] text-[#3D2C35] hover:border-[#9D174D]/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowReviewForm((v) => !v);
                  setReviewSuccess(false);
                }}
                className="px-4 py-2 rounded-lg border border-[#D9C8CF] bg-white hover:bg-[#FFF6F9] text-xs font-bold text-[#1E1017] transition-colors cursor-pointer"
              >
                {showReviewForm ? 'Fechar formulário' : 'Escrever avaliação'}
              </button>
            </div>
          </div>

          {reviewSuccess && (
            <div className="p-4 rounded-xl bg-[#00A650]/10 border border-[#00A650]/25 text-sm font-semibold text-[#008A42]">
              Obrigada! Sua avaliação foi publicada na página.
            </div>
          )}

          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-2xl bg-white border border-[#EADFE3] space-y-4 max-w-xl"
            >
              <h3 className="font-editorial text-xl font-bold text-[#1E1017]">
                Compartilhe sua experiência
              </h3>
              <input
                type="text"
                required
                value={newReview.author}
                onChange={(e) => setNewReview((p) => ({ ...p, author: e.target.value }))}
                placeholder="Seu nome completo"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9C8CF] focus:outline-none focus:border-[#00A650]"
              />
              <textarea
                required
                rows={3}
                value={newReview.comment}
                onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                placeholder="Conte como foi o resultado no seu cabelo..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9C8CF] focus:outline-none focus:border-[#00A650]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#00A650] hover:bg-[#008A42] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Enviar Avaliação
              </button>
            </form>
          )}

          {/* Reviews Grid (All 168 Real Reviews Preserved) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedReviews.map((review) => (
              <article
                key={review.id}
                className="p-5 rounded-2xl border border-[#EADFE3] bg-white shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#1E1017] truncate">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A650] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.stars }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-sm text-[#3D2C35] leading-relaxed">{review.comment}</p>
                </div>

                {review.localImgs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightboxReview(review)}
                    className="w-full h-48 rounded-xl overflow-hidden border border-[#EADFE3] bg-zinc-50 hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <ResilientImage
                      src={review.localImgs[0]}
                      alt={`Foto enviada por ${review.author}`}
                      fallbackLabel={review.author}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </article>
            ))}
          </div>

          {/* Load More / Show All 168 Reviews Controls */}
          {visibleReviewCount < filteredReviews.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleReviewCount((c) => Math.min(filteredReviews.length, c + 18))
                }
                className="px-6 py-3 rounded-xl bg-white border border-[#D9C8CF] hover:border-[#1E1017] text-sm font-bold text-[#1E1017] transition-colors cursor-pointer tabular-nums"
              >
                Carregar mais avaliações ({filteredReviews.length - visibleReviewCount} restantes)
              </button>

              <button
                type="button"
                onClick={() => setVisibleReviewCount(filteredReviews.length)}
                className="px-6 py-3 rounded-xl bg-[#1E1017] hover:bg-[#331C28] text-sm font-bold text-white transition-colors cursor-pointer tabular-nums"
              >
                Ver todas as {filteredReviews.length} avaliações
              </button>
            </div>
          )}

          {/* Final Offer Banner with Massive Buy Button */}
          <div className="rounded-3xl bg-[#1E1017] text-white p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-7 shadow-xl">
            <div className="space-y-3 max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-wider text-rose-300">
                Oferta Especial · Frete Grátis Hoje
              </p>
              <h3 className="font-editorial text-3xl sm:text-4xl font-bold leading-tight text-balance">
                Garanta sua Escova 5 em 1 MultiGlam agora
              </h3>
              <p className="text-lg text-rose-100/90 tabular-nums">
                <strong className="text-white text-xl">
                  {formatBRL(PRODUCT_PRICING.cashPrice)} à vista
                </strong>{' '}
                ou{' '}
                <strong className="text-white text-xl">
                  12x de {formatBRL(PRODUCT_PRICING.installmentValue)}
                </strong>{' '}
                no cartão.
              </p>
            </div>

            <button
              type="button"
              onClick={() => addToCartAndOpen(selectedVariant, 1)}
              className="w-full lg:w-auto px-10 py-5 rounded-2xl bg-[#00A650] hover:bg-[#008A42] active:scale-[0.99] text-white font-extrabold text-lg tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-[0_12px_28px_rgba(0,166,80,0.35)] inline-flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>COMPRAR AGORA ({selectedVariant.name.toUpperCase()})</span>
            </button>
          </div>
        </section>

        {/* Trust Pillars */}
        <section className="bg-white border-t border-[#EADFE3] py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#EADFE3] bg-[#FFF9FB]">
              <div className="w-11 h-11 rounded-xl bg-[#00A650]/10 text-[#00A650] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1E1017]">Entrega Garantida</h4>
                <p className="text-sm text-[#5B4751] mt-0.5">
                  Envio rápido com código de rastreamento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#EADFE3] bg-[#FFF9FB]">
              <div className="w-11 h-11 rounded-xl bg-[#00A650]/10 text-[#00A650] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1E1017]">Pagamento Seguro</h4>
                <p className="text-sm text-[#5B4751] mt-0.5">
                  PIX imediato ou Cartão em até 12x.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#EADFE3] bg-[#FFF9FB]">
              <div className="w-11 h-11 rounded-xl bg-[#00A650]/10 text-[#00A650] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#1E1017]">Suporte Dedicado</h4>
                <p className="text-sm text-[#5B4751] mt-0.5">
                  Atendimento Seg. a Sex. das 9h às 18h.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFFDFB] border-t border-[#EADFE3] text-sm text-[#5B4751] pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-editorial text-xl font-bold text-[#1E1017]">MultiGlam</span>
            <p className="text-xs text-[#7D6671] leading-relaxed">
              Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional. Fios alinhados,
              brilhantes e sem frizz todos os dias.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1017]">
              Atendimento
            </h4>
            <p className="text-xs text-[#5B4751]">Segunda à Sexta, 9:00h às 18:00h</p>
            <p className="text-xs font-semibold text-[#1E1017]">suporte@multiglambrasil.com.br</p>
            <button
              type="button"
              onClick={() => setActivePolicy('rastreio')}
              className="text-xs font-bold text-[#00A650] hover:underline cursor-pointer"
            >
              Rastrear meu Pedido
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1017]">Políticas</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacidade')}
                  className="hover:text-[#1E1017] hover:underline cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('devolucao')}
                  className="hover:text-[#1E1017] hover:underline cursor-pointer"
                >
                  Trocas, Garantia e Reembolso
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('entrega')}
                  className="hover:text-[#1E1017] hover:underline cursor-pointer"
                >
                  Frete e Prazo de Entrega
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1017]">
              Pagamento e Segurança
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#3D2C35]">
              {['PIX', 'Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'].map((m) => (
                <span key={m} className="px-2 py-1 rounded border border-[#EADFE3] bg-white">
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#00A650] font-semibold pt-1">
              <Award className="w-4 h-4 shrink-0" />
              <span>Site Verificado · SSL Seguro</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EADFE3] py-5 px-4 text-center text-xs text-[#7D6671] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00A650]" />
          <span>© {new Date().getFullYear()} MultiGlam Brasil — Todos os Direitos Reservados</span>
        </div>
      </footer>

      {/* ============================================================
          FLOATING ACCOMPANYING BUY BAR (LARGER CTA, FOLLOWS UP & DOWN)
         ============================================================ */}
      <div
        aria-hidden={!showFloatingBuy}
        className={`fixed z-40 transition-all duration-200 ease-out bottom-0 inset-x-0 md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[min(94vw,860px)] ${
          showFloatingBuy
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t md:border border-[#EADFE3] md:rounded-2xl px-4 sm:px-6 py-2.5 md:py-3 shadow-[0_-8px_28px_rgba(30,16,23,0.12)] md:shadow-[0_16px_44px_rgba(30,16,23,0.18)] flex items-center justify-between gap-3 sm:gap-5">
          {/* Left: Product Mini Photo + Price Summary */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#EADFE3] bg-white shrink-0">
              <ResilientImage
                src={selectedVariant.image}
                alt={`Escova 5 em 1 cor ${selectedVariant.name}`}
                fallbackLabel={selectedVariant.name}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-[#1E1017] leading-tight tabular-nums">
                  {formatBRL(PRODUCT_PRICING.cashPrice)}
                </span>
                <span className="text-[11px] sm:text-xs font-extrabold text-[#00A650]">
                  à vista
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#5B4751] truncate tabular-nums">
                12x de {formatBRL(PRODUCT_PRICING.installmentValue)} · Cor{' '}
                <strong className="text-[#1E1017]">{selectedVariant.name}</strong>
              </p>
            </div>
          </div>

          {/* Center (Desktop Quick Color Dots) */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {PRODUCT_VARIANTS.map((variant) => {
              const active = variant.id === selectedVariant.id;
              return (
                <button
                  key={`dock-${variant.id}`}
                  type="button"
                  onClick={() => handleSelectVariant(variant)}
                  title={`Selecionar cor ${variant.name}`}
                  aria-label={`Selecionar cor ${variant.name}`}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    active ? 'border-[#1E1017] scale-110' : 'border-[#D9C8CF] hover:scale-105'
                  }`}
                  style={{ backgroundColor: variant.swatchHex }}
                />
              );
            })}
          </div>

          {/* Right: Enlarged High-Conversion Floating Buy Button */}
          <button
            type="button"
            onClick={() => addToCartAndOpen(selectedVariant, quantity)}
            className="px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-[#00A650] hover:bg-[#008A42] active:scale-[0.98] text-white text-sm sm:text-base font-extrabold tracking-wide whitespace-nowrap shrink-0 shadow-[0_6px_18px_rgba(0,166,80,0.3)] transition-all cursor-pointer"
          >
            COMPRAR AGORA
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />
      <InstallmentsModal
        isOpen={isInstallmentsOpen}
        onClose={() => setIsInstallmentsOpen(false)}
      />
      <PolicyModal topic={activePolicy} onClose={() => setActivePolicy(null)} />
      <ReviewLightboxModal review={lightboxReview} onClose={() => setLightboxReview(null)} />
    </div>
  );
}
