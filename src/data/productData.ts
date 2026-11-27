import clonedReviewsRaw from './clonedReviews.json';
import clonedAssetsRaw from './clonedAssets.json';

export type VariantColorId = 'preto' | 'verde' | 'vermelho' | 'branco';

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

export const PRODUCT_PRICING = {
  cashPrice: 149.9,
  compareAtPrice: 249.9,
  installmentCount: 12,
  installmentValue: 15.49,
  installmentTotal: 185.88,
};

export const GALLERY_IMAGES = [
  {
    src: clonedAssetsRaw.galleryFiles[0].localPath,
    alt: 'Escova Alisadora e Modeladora Elétrica 5 em 1 Bivolt Profissional MultiGlam',
    label: 'Visão Geral',
  },
  {
    src: clonedAssetsRaw.galleryFiles[1].localPath,
    alt: 'Escova Alisadora 5 em 1 — Alisamento fácil e rápido',
    label: 'Alisamento Rápido',
  },
  {
    src: clonedAssetsRaw.galleryFiles[2].localPath,
    alt: 'Escova Alisadora 5 em 1 — Mechas modeladas e alinhadas',
    label: 'Mechas Modeladas',
  },
  {
    src: clonedAssetsRaw.galleryFiles[3].localPath,
    alt: 'Escova Alisadora 5 em 1 — Sistema anti-queimadura que não queima o couro cabeludo',
    label: 'Não Queima',
  },
  {
    src: clonedAssetsRaw.galleryFiles[4].localPath,
    alt: 'Escova Alisadora 5 em 1 — Antes e depois real nos fios',
    label: 'Antes e Depois',
  },
  {
    src: clonedAssetsRaw.galleryFiles[5].localPath,
    alt: 'Escova Alisadora 5 em 1 — Cabelos lisos e brilhantes',
    label: 'Resultado Final',
  },
  {
    src: clonedAssetsRaw.galleryFiles[8].localPath,
    alt: 'Escova Alisadora 5 em 1 MultiGlam — Cor Preto',
    label: 'Preto',
    variantId: 'preto' as VariantColorId,
  },
  {
    src: clonedAssetsRaw.galleryFiles[7].localPath,
    alt: 'Escova Alisadora 5 em 1 MultiGlam — Cor Verde',
    label: 'Verde',
    variantId: 'verde' as VariantColorId,
  },
  {
    src: clonedAssetsRaw.galleryFiles[9].localPath,
    alt: 'Escova Alisadora 5 em 1 MultiGlam — Cor Vermelho',
    label: 'Vermelho',
    variantId: 'vermelho' as VariantColorId,
  },
  {
    src: clonedAssetsRaw.galleryFiles[6].localPath,
    alt: 'Escova Alisadora 5 em 1 MultiGlam — Cor Branco',
    label: 'Branco',
    variantId: 'branco' as VariantColorId,
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
    sku: 'MG-5IN1-PRETO',
    stockLabel: 'Em estoque · Envio imediato',
  },
  {
    id: 'verde',
    shopifyId: 46034261639354,
    name: 'Verde',
    swatchHex: '#166534',
    image: clonedAssetsRaw.galleryFiles[7].localPath,
    sku: 'MG-5IN1-VERDE',
    stockLabel: 'Em estoque · Envio imediato',
  },
  {
    id: 'vermelho',
    shopifyId: 46034261704890,
    name: 'Vermelho',
    swatchHex: '#B91C1C',
    image: clonedAssetsRaw.galleryFiles[9].localPath,
    sku: 'MG-5IN1-VERMELHO',
    stockLabel: 'Em estoque · Envio imediato',
  },
  {
    id: 'branco',
    shopifyId: 46037512913082,
    name: 'Branco',
    swatchHex: '#F4F4F5',
    image: clonedAssetsRaw.galleryFiles[6].localPath,
    sku: 'MG-5IN1-BRANCO',
    stockLabel: 'Em estoque · Envio imediato',
  },
];

export const INSTALLMENT_TABLE: InstallmentOption[] = [
  { count: 1, installmentValue: 149.9, totalValue: 149.9, label: 'À vista no cartão' },
  { count: 2, installmentValue: 78.32, totalValue: 156.64, label: 'No cartão' },
  { count: 3, installmentValue: 52.95, totalValue: 158.85, label: 'No cartão' },
  { count: 4, installmentValue: 40.32, totalValue: 161.28, label: 'No cartão' },
  { count: 5, installmentValue: 32.78, totalValue: 163.9, label: 'No cartão' },
  { count: 6, installmentValue: 27.76, totalValue: 166.56, label: 'No cartão' },
  { count: 7, installmentValue: 24.19, totalValue: 169.33, label: 'No cartão' },
  { count: 8, installmentValue: 21.52, totalValue: 172.16, label: 'No cartão' },
  { count: 9, installmentValue: 19.45, totalValue: 175.05, label: 'No cartão' },
  { count: 10, installmentValue: 17.81, totalValue: 178.1, label: 'No cartão' },
  { count: 11, installmentValue: 16.51, totalValue: 181.61, label: 'No cartão' },
  { count: 12, installmentValue: 15.49, totalValue: 185.88, label: 'No cartão' },
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
  { label: 'Produto', value: 'Escova Alisadora e Modeladora Elétrica 5 em 1 MultiGlam' },
  { label: 'Voltagem', value: 'Bivolt Automático (110V / 220V)' },
  { label: 'Cores Disponíveis', value: 'Preto, Verde, Vermelho e Branco' },
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
