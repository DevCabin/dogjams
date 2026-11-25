function cleanTitleForSlug(title) {
  return String(title || '')
    .replace(/[\u2013\u2014]/g, '-')   // en/em dashes to hyphens
    .replace(/\s*[-|]\s*Temu\s*$/i, '') // strip trailing " - Temu" / " | Temu"
    .replace(/\bTemu\b/gi, '')          // remove any standalone "Temu"
    .trim()
    .replace(/\s+/g, ' ');
}

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getProductSlug(product) {
  if (product?.slug) return product.slug;
  const base = slugify(cleanTitleForSlug(product?.title || product?.id || 'product'));
  return base || `product-${product?.id || Date.now()}`;
}
