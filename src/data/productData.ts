import clonedReviewsRaw from './clonedReviews.json';
import clonedAssetsRaw from './clonedAssets.json';

export type VariantColorId = 'preto';

export interface ProductVariant {
  id: VariantColorId;
  shopifyId: number;
  name: string;
  swatchHex: string;
  image: string;
  sku: string;
  stockLabel: string;
}

export interface InstallmentOption {
  count: number;
  installmentValue: number;
  totalValue: number;
  label: string;
}

export interface ClonedReviewItem {
  id: string;
  author: string;
  stars: number;
  comment: string;
  localImgs: string[];
  verified: boolean;
}

export const CHECKOUT_URL = 'https://pay.kaiross.com.br/IBAMuQRlcOl3';

export const PRODUCT_PRICING = {
  cashPrice: 119.9,
  compareAtPrice: 249.9,
  installmentCount: 12,
  installmentValue: 12.39,
  installmentTotal: 148.68,
};

// Vídeo 16:9 em reprodução automática
export const PRODUCT_VIDEO_URL = 'https://www.youtube.com/watch?v=sEld7-Qpkug';

export const GALLERY_IMAGES = [
  {
    src: clonedAssetsRaw.galleryFiles[8].localPath,
    alt: 'LisseMAX Pro — Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt (Preto)',
    label: 'LisseMAX Pro Preto',
    variantId: 'preto' as VariantColorId,
  },
  {
    src: clonedAssetsRaw.galleryFiles[1].localPath,
    alt: 'LisseMAX Pro — Alisamento fácil e rápido',
    label: 'Alisamento Rápido',
  },
  {
    src: clonedAssetsRaw.galleryFiles[2].localPath,
    alt: 'LisseMAX Pro — Mechas modeladas e alinhadas',
    label: 'Mechas Modeladas',
  },
  {
    src: clonedAssetsRaw.galleryFiles[3].localPath,
    alt: 'LisseMAX Pro — Sistema anti-queimadura que não queima o couro cabeludo',
    label: 'Não Queima',
  },
  {
    src: clonedAssetsRaw.galleryFiles[4].localPath,
    alt: 'LisseMAX Pro — Antes e depois real nos fios',
    label: 'Antes e Depois',
  },
  {
    src: clonedAssetsRaw.galleryFiles[5].localPath,
    alt: 'LisseMAX Pro — Cabelos lisos e brilhantes',
    label: 'Resultado Final',
  },
];

export const DESCRIPTION_IMAGES = clonedAssetsRaw.descFiles;

export const PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'preto',
    shopifyId: 46034261672122,
    name: 'Preto',
    swatchHex: '#18181B',
    image: clonedAssetsRaw.galleryFiles[8].localPath,
    sku: 'LMX-5IN1-PRETO',
    stockLabel: 'Em estoque · Envio imediato',
  },
];

export const INSTALLMENT_TABLE: InstallmentOption[] = [
  { count: 1, installmentValue: 119.9, totalValue: 119.9, label: 'À vista no cartão' },
  { count: 2, installmentValue: 62.65, totalValue: 125.3, label: 'No cartão' },
  { count: 3, installmentValue: 42.35, totalValue: 127.05, label: 'No cartão' },
  { count: 4, installmentValue: 32.25, totalValue: 129.0, label: 'No cartão' },
  { count: 5, installmentValue: 26.22, totalValue: 131.1, label: 'No cartão' },
  { count: 6, installmentValue: 22.21, totalValue: 133.26, label: 'No cartão' },
  { count: 7, installmentValue: 19.35, totalValue: 135.45, label: 'No cartão' },
  { count: 8, installmentValue: 17.21, totalValue: 137.68, label: 'No cartão' },
  { count: 9, installmentValue: 15.56, totalValue: 140.04, label: 'No cartão' },
  { count: 10, installmentValue: 14.24, totalValue: 142.4, label: 'No cartão' },
  { count: 11, installmentValue: 13.2, totalValue: 145.2, label: 'No cartão' },
  { count: 12, installmentValue: 12.39, totalValue: 148.68, label: 'No cartão' },
];

export const CLONED_REVIEWS: ClonedReviewItem[] = (
  clonedReviewsRaw as Array<{
    author: string;
    stars: number;
    comment: string;
    localImgs: string[];
  }>
).map((rev, idx) => ({
  id: `rev-${idx + 1}`,
  author: rev.author,
  stars: rev.stars || 5,
  comment: rev.comment,
  localImgs: rev.localImgs || [],
  verified: true,
}));

export const TECHNICAL_SPECS = [
  { label: 'Produto', value: 'LisseMAX Pro — Escova Alisadora e Modeladora 5 em 1' },
  { label: 'Voltagem', value: 'Bivolt Automático (110V / 220V)' },
  { label: 'Cor', value: 'Preto Fosco Profissional' },
  { label: 'Funções', value: 'Alisamento, Alinhamento, Modelagem, Selagem de Cutículas e Anti-Frizz' },
  { label: 'Aquecimento', value: 'Rápido com placas de cerâmica PTC e tecnologia iônica' },
  { label: 'Segurança', value: 'Cerdas externas anti-queimadura que protegem o couro cabeludo' },
  { label: 'Portabilidade', value: 'Compacta e leve com cabo giratório 360° para levar a qualquer lugar' },
];

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
