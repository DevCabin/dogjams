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
  const base = slugify(product?.title || product?.id || 'product');
  return base || `product-${product?.id || Date.now()}`;
}
