import { useState, useEffect, type FormEvent } from 'react';
import {
  ShoppingBag,
  Star,
  Check,
  Truck,
  ShieldCheck,
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

  // Reviews state (all 168 real reviews from original page)
  const [reviews, setReviews] = useState<ClonedReviewItem[]>(CLONED_REVIEWS);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'photos' | 'five'>('all');
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(12);
  const [lightboxReview, setLightboxReview] = useState<ClonedReviewItem | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({ author: '', comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Mobile sticky bottom CTA
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 620);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
      message: 'Frete Grátis confirmado · Prazo de envio de 2 a 5 dias úteis!',
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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111113]">
      {/* Top Announcement Bar */}
      <div className="bg-[#000000] text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center tracking-wider uppercase">
        <span>FRETE GRÁTIS PARA TODO BRASIL</span>
        <span className="mx-2 text-zinc-500" aria-hidden="true">
          ·
        </span>
        <span>ENVIOS RÁPIDOS E SEGUROS</span>
      </div>

      {/* 3-Zone Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#produto"
            className="font-display text-xl font-extrabold tracking-tight text-[#111113] whitespace-nowrap shrink-0"
          >
            MultiGlam
          </a>

          <nav
            aria-label="Navegação da página"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
          >
            <a
              href="#produto"
              className="hover:text-[#111113] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Produto
            </a>
            <a
              href="#descricao"
              className="hover:text-[#111113] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Descrição
            </a>
            <a
              href="#especificacoes"
              className="hover:text-[#111113] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Especificações
            </a>
            <a
              href="#avaliacoes"
              className="hover:text-[#111113] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Avaliações ({reviews.length})
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111113] hover:bg-zinc-800 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sacola</span>
            <span className="tabular-nums text-xs bg-white/15 px-1.5 py-0.5 rounded">
              {totalCartUnits}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* ============================================================
            SECTION 1: PRODUCT BUY BOX (CLONE OF ORIGINAL PDP HERO)
           ============================================================ */}
        <section id="produto" className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-14 lg:pt-8 lg:pb-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-zinc-500 mb-5 flex items-center gap-1.5">
            <a href="#produto" className="hover:text-zinc-900 transition-colors">
              Home
            </a>
            <span aria-hidden="true">›</span>
            <span className="text-zinc-800 font-medium truncate">
              Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Complete 10-Image Product Gallery */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="relative aspect-square w-full rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
                <ResilientImage
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  fallbackLabel={activeSlide.label}
                  className="w-full h-full object-contain bg-white"
                />

                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-zinc-300 text-[#111113] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-zinc-300 text-[#111113] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 left-3 bg-white/95 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs tabular-nums">
                  {activeSlideIndex + 1}/{GALLERY_IMAGES.length} · {activeSlide.label}
                </div>
              </div>

              {/* 10 Thumbnails Grid */}
              <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                {GALLERY_IMAGES.map((slide, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={`${slide.label}-${idx}`}
                      type="button"
                      onClick={() => handleSelectSlide(idx)}
                      aria-label={`Ver imagem ${slide.label}`}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                        isActive
                          ? 'border-[#111113] ring-2 ring-[#111113]/15'
                          : 'border-zinc-200 hover:border-zinc-400 opacity-85 hover:opacity-100'
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

            {/* Right: Highlighted Purchase Module */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
              {/* Highlighted Kicker + Title */}
              <div className="space-y-2.5">
                <p className="text-xs font-extrabold tracking-wide text-[#028030] uppercase">
                  ENVIO NACIONAL · PRONTA ENTREGA · BIVOLT 110V/220V
                </p>

                <h1 className="font-display text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#111113] leading-snug text-balance">
                  Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional
                </h1>

                <a
                  href="#avaliacoes"
                  className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-[#111113] transition-colors"
                >
                  <span className="font-bold text-[#111113] tabular-nums">4.9</span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-[#F3C621] text-[#F3C621]" />
                    ))}
                  </span>
                  <span className="text-zinc-500 underline underline-offset-2 tabular-nums">
                    ({reviews.length} avaliações)
                  </span>
                </a>
              </div>

              {/* Price Block — Highlighted & Exact User Numbers */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 line-through tabular-nums">
                    De {formatBRL(PRODUCT_PRICING.compareAtPrice)}
                  </span>
                  <span className="font-bold text-[#028030] tabular-nums">
                    Economia de {formatBRL(PRODUCT_PRICING.compareAtPrice - PRODUCT_PRICING.cashPrice)}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-extrabold text-[#111113] tracking-tight tabular-nums">
                    {formatBRL(PRODUCT_PRICING.cashPrice)}
                  </span>
                  <span className="text-sm font-bold text-[#028030]">à vista</span>
                </div>

                <p className="text-sm sm:text-base text-zinc-800 tabular-nums">
                  ou em até{' '}
                  <strong className="font-extrabold text-[#111113]">
                    12x de {formatBRL(PRODUCT_PRICING.installmentValue)}
                  </strong>{' '}
                  no cartão de crédito
                </p>

                <button
                  type="button"
                  onClick={() => setIsInstallmentsOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-[#028030] underline underline-offset-4 pt-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Ver todas as opções de pagamento</span>
                </button>
              </div>

              {/* Color Variant Selector with Real Product Thumbnail Swatches */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">
                    Cor: <strong className="text-[#111113]">{selectedVariant.name}</strong>
                  </span>
                  <span className="text-xs font-semibold text-[#028030]">
                    {selectedVariant.stockLabel}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {PRODUCT_VARIANTS.map((variant) => {
                    const isSelected = variant.id === selectedVariant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#111113] bg-zinc-50 text-[#111113] shadow-xs'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                        }`}
                      >
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
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

              {/* Free Shipping & Dispatch Box */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-bold text-[#028030]">
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Frete Grátis</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    Prazo de Envio: 2 a 5 dias úteis!
                  </span>
                </div>

                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cepInput}
                      onChange={(e) => handleCepInputChange(e.target.value)}
                      placeholder="Digite seu CEP (00000-000)"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 tabular-nums focus:outline-none focus:border-[#028030]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-[#111113] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Calcular
                  </button>
                </form>

                {cepResult && (
                  <p
                    className={`text-xs font-semibold ${
                      cepResult.valid ? 'text-[#028030]' : 'text-red-700'
                    }`}
                  >
                    {cepResult.message}
                  </p>
                )}
              </div>

              {/* Quantity & Prominent Buy Button */}
              <div className="space-y-3">
                <div className="flex items-stretch gap-3">
                  <div className="inline-flex items-center border border-zinc-300 rounded-xl bg-white px-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Diminuir quantidade"
                      className="p-2.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Aumentar quantidade"
                      className="p-2.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCartAndOpen(selectedVariant, quantity)}
                    className="flex-1 py-4 px-6 rounded-xl bg-[#03A13D] hover:bg-[#028030] active:scale-[0.99] text-white font-extrabold text-base tracking-wide transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    COMPRAR AGORA
                  </button>
                </div>

                {/* Payment Brands Row */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px] font-semibold text-zinc-600">
                  {['Visa', 'Mastercard', 'Hipercard', 'Elo', 'Amex', 'Diners', 'Pix'].map(
                    (brand) => (
                      <span
                        key={brand}
                        className="px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50"
                      >
                        {brand}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Guarantees & Store Metrics from Original Page */}
              <div className="border-t border-zinc-200 pt-4 space-y-3 text-xs text-zinc-600">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-[#028030] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#111113]">Devoluções Gratuitas</p>
                    <p>Estorno de 100% do seu dinheiro 14 dias após o recebimento da mercadoria.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-center">
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <p className="font-bold text-[#111113] text-sm tabular-nums">9.859+</p>
                    <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                      Pedidos entregues em 60 dias
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <p className="font-bold text-[#028030] text-sm">Bom</p>
                    <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                      Atendimento ao cliente
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    <p className="font-bold text-[#028030] text-sm">No prazo</p>
                    <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                      Entrega garantida
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 2: EXACT CLONED DESCRIPTION & PRODUCT VISUALS
           ============================================================ */}
        <section id="descricao" className="bg-white border-y border-zinc-200 py-14 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 text-center">
            {/* Intro Block */}
            <div className="space-y-5">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111113] leading-tight text-balance">
                Cabelos lisos, brilhantes e protegidos em poucos minutos!
              </h2>

              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Você está cansada de <strong className="text-[#111113]">perder tempo e dinheiro</strong>{' '}
                com horas no salão de beleza? Odeia se arrumar toda e{' '}
                <strong className="text-[#111113]">na hora de sair seu cabelo não está como queria</strong>{' '}
                e você se sente mal ou até desanima de sair?
              </p>

              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Imagina agora <strong className="text-[#111113]">você ter cabelos sempre bem arrumados</strong>{' '}
                sem ter que gastar dinheiro e horas no salão de beleza ou passar muito tempo na
                frente do espelho?
              </p>

              <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <ResilientImage
                  src={DESCRIPTION_IMAGES[0]}
                  alt="Escova Alisadora e Modeladora Elétrica 5 em 1 MultiGlam"
                  fallbackLabel="Escova Alisadora 5 em 1"
                  className="w-full h-auto object-cover"
                />
              </div>

              <p className="text-base sm:text-lg text-zinc-800 max-w-2xl mx-auto">
                Com a{' '}
                <strong className="text-[#111113]">
                  Escova Alisadora de Cabelos Bivolt 5 em 1 MultiGlam
                </strong>{' '}
                você não precisa mais passar por situações frustrantes!
              </p>
            </div>

            {/* Highlighted 5-in-1 Box */}
            <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-6 sm:p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111113]">
                  Multi funções 5 em 1
                </h3>
                <p className="text-base text-zinc-700 max-w-xl mx-auto">
                  Ao usá-la você obtém <strong className="text-[#111113]">5 benefícios</strong> de
                  uma vez só, economizando muito tempo e dinheiro, são eles:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                {[
                  'Alisamento',
                  'Alinhamento',
                  'Modelagem',
                  'Selagem de cutículas',
                  'Anti Frizz',
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-zinc-200 shadow-2xs text-sm font-bold text-[#111113]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#028030] shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <ResilientImage
                  src={DESCRIPTION_IMAGES[1]}
                  alt="Escova alisadora elétrica com tecnologia iônica anti frizz"
                  fallbackLabel="Tecnologia Iônica Anti Frizz"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Solution & Ease of Use */}
            <div className="space-y-5">
              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                A Escova Alisadora de Cabelos é a solução para{' '}
                <strong className="text-[#111113]">todas as suas necessidades</strong> de beleza{' '}
                <strong className="text-[#111113]">em um só aparelho.</strong>
              </p>

              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Com sua tecnologia avançada, você vai ter cabelos{' '}
                <strong className="text-[#111113]">perfeitamente alinhados</strong> em segundos,{' '}
                <strong className="text-[#111113]">sem precisar de um secador de cabelo e chapinha.</strong>
              </p>

              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Basta ligá-la, deixá-la aquecer por alguns segundos e pentear seus cabelos da raiz
                até as pontas e{' '}
                <strong className="text-[#111113]">
                  obter todos os resultados necessários em um único aparelho!
                </strong>
              </p>

              <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <ResilientImage
                  src={DESCRIPTION_IMAGES[2]}
                  alt="Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional"
                  fallbackLabel="MultiGlam Bivolt Profissional"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Economize Tempo */}
            <div className="space-y-5 pt-4 border-t border-zinc-200">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111113]">
                Economize Tempo
              </h3>
              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                A Escova Alisadora de Cabelos é fácil de usar e proporciona resultados incríveis,{' '}
                <strong className="text-[#111113]">
                  mesmo para quem não tem muita habilidade com penteados.
                </strong>
              </p>
              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Não há necessidade de fazer muito esforço ou usar produtos químicos para deixar seus
                cabelos bonitos e saudáveis. Com a MultiGlam, você tem{' '}
                <strong className="text-[#111113]">
                  cabelos lisos, brilhantes e sedosos todos os dias!
                </strong>
              </p>
              <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <ResilientImage
                  src={DESCRIPTION_IMAGES[3]}
                  alt="Tecnologia da Escova Alisadora 5 em 1 MultiGlam"
                  fallbackLabel="Economize Tempo"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Carregue aonde você estiver */}
            <div className="space-y-5 pt-4 border-t border-zinc-200">
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#111113]">
                Carregue aonde você estiver
              </h3>
              <p className="text-base sm:text-lg text-zinc-700 leading-relaxed max-w-2xl mx-auto">
                Além disso, a Escova Alisadora de Cabelos é perfeita para quem tem uma vida agitada.
                Não importa onde você esteja, ela é fácil de transportar e pode ser usada a qualquer
                hora do dia. Com a Escova Alisadora Profissional,{' '}
                <strong className="text-[#111113]">
                  você tem cabelos perfeitos a qualquer momento!
                </strong>
              </p>
              <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
                <ResilientImage
                  src={DESCRIPTION_IMAGES[4]}
                  alt="Arrase com os cabelos dos sonhos usando a MultiGlam Bivolt"
                  fallbackLabel="Portátil e Bivolt"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Technical Specs Strip */}
              <div
                id="especificacoes"
                className="text-left max-w-2xl mx-auto bg-[#FAFAFA] border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200 mt-8"
              >
                {TECHNICAL_SPECS.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-5 py-3 text-sm"
                  >
                    <span className="text-zinc-500 font-medium">{spec.label}</span>
                    <span className="text-[#111113] font-semibold sm:text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 3: ALL 168 CLONED CUSTOMER REVIEWS (HIGHLIGHTED)
           ============================================================ */}
        <section id="avaliacoes" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24 space-y-10">
          {/* Header matching original */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-extrabold tracking-wide uppercase text-[#028030]">
              Mais de 10 mil clientes satisfeitos
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#111113] tracking-tight">
              Veja o que nossos clientes estão recebendo
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Clientes reais mostrando seus produtos e compartilhando a experiência com a Escova
              Alisadora 5 em 1.
            </p>
          </div>

          {/* Real Customer Photos Strip (10 Highlighted Photos) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#111113] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#028030]" />
                <span>Fotos reais enviadas por clientes ({photoReviews.length})</span>
              </h3>
              <span className="text-xs text-zinc-500">Clique na foto para ampliar</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {photoReviews.map((rev) => (
                <button
                  key={`thumb-${rev.id}`}
                  type="button"
                  onClick={() => setLightboxReview(rev)}
                  aria-label={`Ampliar foto da avaliação de ${rev.author}`}
                  className="aspect-square rounded-xl overflow-hidden border border-zinc-200 hover:border-[#028030] transition-all hover:scale-[1.03] bg-white cursor-pointer shadow-2xs"
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs items-center">
            <div className="md:col-span-4 flex items-center gap-4">
              <div>
                <p className="font-display text-5xl font-extrabold text-[#111113] tabular-nums">
                  4.9
                </p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-4 h-4 fill-[#F3C621] text-[#F3C621]" />
                  ))}
                </div>
              </div>
              <div className="text-sm text-zinc-600">
                <p className="font-bold text-[#111113] tabular-nums">
                  {reviews.length} avaliações
                </p>
                <p>95% deram 5 estrelas</p>
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
                  <span className="w-8 font-semibold text-zinc-700">{row.stars} ★</span>
                  <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/70">
                    <div
                      className="h-full bg-[#F3C621] rounded-full"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-zinc-500 font-medium">{row.count}</span>
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
                        ? 'bg-[#111113] text-white'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-700 hover:border-zinc-400'
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
                className="px-4 py-2 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-[#111113] transition-colors cursor-pointer"
              >
                {showReviewForm ? 'Fechar formulário' : 'Escrever uma avaliação'}
              </button>
            </div>
          </div>

          {reviewSuccess && (
            <div className="p-4 rounded-xl bg-[#028030]/10 border border-[#028030]/25 text-sm font-semibold text-[#028030]">
              Obrigada! Sua avaliação foi adicionada com sucesso.
            </div>
          )}

          {showReviewForm && (
            <form
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-4 max-w-xl"
            >
              <h3 className="font-display text-lg font-bold text-[#111113]">
                Deixe sua opinião sobre a Escova 5 em 1
              </h3>
              <input
                type="text"
                required
                value={newReview.author}
                onChange={(e) => setNewReview((p) => ({ ...p, author: e.target.value }))}
                placeholder="Seu nome completo"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#028030]"
              />
              <textarea
                required
                rows={3}
                value={newReview.comment}
                onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                placeholder="Escreva o que achou do produto..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[#028030]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#03A13D] hover:bg-[#028030] text-white text-sm font-bold transition-colors cursor-pointer"
              >
                Enviar Avaliação
              </button>
            </form>
          )}

          {/* Reviews Grid (All 168 Real Reviews Accessible) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedReviews.map((review) => (
              <article
                key={review.id}
                className="p-5 rounded-xl border border-zinc-200 bg-white shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-display text-sm font-bold text-[#111113] truncate">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#028030] shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.stars }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#F3C621] text-[#F3C621]" />
                    ))}
                  </div>

                  <p className="text-sm text-zinc-700 leading-relaxed">{review.comment}</p>
                </div>

                {review.localImgs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightboxReview(review)}
                    className="w-full h-44 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 hover:opacity-95 transition-opacity cursor-pointer"
                  >
                    <ResilientImage
                      src={review.localImgs[0]}
                      alt={`Foto do produto enviada por ${review.author}`}
                      fallbackLabel={review.author}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </article>
            ))}
          </div>

          {/* Pagination / Load More Controls */}
          {visibleReviewCount < filteredReviews.length && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleReviewCount((c) => Math.min(filteredReviews.length, c + 15))
                }
                className="px-6 py-3 rounded-xl bg-white border border-zinc-300 hover:border-[#111113] text-sm font-bold text-[#111113] transition-colors cursor-pointer tabular-nums"
              >
                Carregar mais avaliações ({filteredReviews.length - visibleReviewCount} restantes)
              </button>

              <button
                type="button"
                onClick={() => setVisibleReviewCount(filteredReviews.length)}
                className="px-6 py-3 rounded-xl bg-[#111113] hover:bg-zinc-800 text-sm font-bold text-white transition-colors cursor-pointer tabular-nums"
              >
                Ver todas as {filteredReviews.length} avaliações
              </button>
            </div>
          )}

          {/* Closing Highlighted Offer Banner */}
          <div className="rounded-2xl bg-[#111113] text-white p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Envio Nacional · Frete Grátis para Todo o Brasil
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-balance">
                Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional
              </h3>
              <p className="text-base text-zinc-200 tabular-nums">
                Apenas <strong className="text-white text-lg">{formatBRL(PRODUCT_PRICING.cashPrice)} à vista</strong>{' '}
                ou em até{' '}
                <strong className="text-white text-lg">
                  12x de {formatBRL(PRODUCT_PRICING.installmentValue)}
                </strong>{' '}
                no cartão de crédito.
              </p>
            </div>

            <button
              type="button"
              onClick={() => addToCartAndOpen(selectedVariant, 1)}
              className="px-8 py-4 rounded-xl bg-[#03A13D] hover:bg-[#028030] text-white font-extrabold text-sm sm:text-base tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg"
            >
              COMPRAR AGORA ({selectedVariant.name.toUpperCase()})
            </button>
          </div>
        </section>

        {/* ============================================================
            SECTION 4: 3 TRUST PILLARS (CLONE OF ORIGINAL STORE BAR)
           ============================================================ */}
        <section className="bg-white border-t border-zinc-200 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-[#FAFAFA]">
              <div className="w-11 h-11 rounded-lg bg-[#028030]/10 text-[#028030] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-[#111113]">Entrega Garantida</h4>
                <p className="text-xs text-zinc-600">Envio imediato após o pagamento.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-[#FAFAFA]">
              <div className="w-11 h-11 rounded-lg bg-[#028030]/10 text-[#028030] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-[#111113]">Pagamento Seguro</h4>
                <p className="text-xs text-zinc-600">Aceitamos Cartão em 12x e PIX.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 bg-[#FAFAFA]">
              <div className="w-11 h-11 rounded-lg bg-[#028030]/10 text-[#028030] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-[#111113]">Suporte ao Cliente</h4>
                <p className="text-xs text-zinc-600">Atendimento Seg. a Sex. 9:00h às 18:00h.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-zinc-200 text-sm text-zinc-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2.5">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#111113]">
              Central de Atendimento
            </h4>
            <p className="text-xs text-zinc-600">Segunda à Sexta, 9:00h às 18:00h</p>
            <p className="text-xs font-semibold text-[#111113]">suporte@multiglambrasil.com.br</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#111113]">
              Políticas
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacidade')}
                  className="hover:text-[#111113] hover:underline cursor-pointer"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('devolucao')}
                  className="hover:text-[#111113] hover:underline cursor-pointer"
                >
                  Política de Troca, Reembolso e Devolução
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('entrega')}
                  className="hover:text-[#111113] hover:underline cursor-pointer"
                >
                  Política de Frete e Entrega
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#111113]">
              Informações
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('rastreio')}
                  className="hover:text-[#111113] hover:underline font-semibold text-[#028030] cursor-pointer"
                >
                  Rastreie seu Pedido
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsInstallmentsOpen(true)}
                  className="hover:text-[#111113] hover:underline cursor-pointer"
                >
                  Formas de Pagamento
                </button>
              </li>
              <li>
                <a href="#avaliacoes" className="hover:text-[#111113] hover:underline">
                  Avaliações de Clientes (168)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-[#111113]">
              Loja Verificada
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-zinc-700">
              {['Visa', 'Mastercard', 'Hipercard', 'Elo', 'Amex', 'Diners', 'Pix'].map((m) => (
                <span key={m} className="px-2 py-1 rounded border border-zinc-200 bg-white">
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#028030] font-semibold pt-1">
              <Award className="w-4 h-4 shrink-0" />
              <span>Compra 100% Segura · SSL Criptografado</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 py-5 px-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} MultiGlam Brasil — Todos os Direitos Reservados
        </div>
      </footer>

      {/* Mobile Sticky Bottom Buy Bar */}
      {showStickyBar && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-extrabold text-[#111113] leading-tight tabular-nums">
              {formatBRL(PRODUCT_PRICING.cashPrice)}{' '}
              <span className="text-xs font-semibold text-[#028030]">à vista</span>
            </p>
            <p className="text-[11px] text-zinc-600 truncate tabular-nums">
              12x de {formatBRL(PRODUCT_PRICING.installmentValue)} · Cor {selectedVariant.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addToCartAndOpen(selectedVariant, 1)}
            className="px-5 py-2.5 rounded-lg bg-[#03A13D] hover:bg-[#028030] text-white text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            COMPRAR AGORA
          </button>
        </div>
      )}

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
