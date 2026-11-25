// content.js — runs on TEMU pages to extract product data
// Uses multiple strategies: JSON-LD > OpenGraph > CSS selectors

(function () {
  'use strict';

  const DEBUG = false;
  function log(...args) {
    if (DEBUG) console.log('[DogJams]', ...args);
  }

  function isProductPage() {
    const host = window.location.hostname;
    const path = window.location.pathname;
    return host.includes('temu.com') &&
      (path.includes('/product/') || path.includes('/p/') || path.includes('/goods/') || path.includes('/item/') || path.includes('.html'));
  }

  function getJsonLdProduct() {
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        const data = JSON.parse(script.textContent);
        const products = Array.isArray(data) ? data : [data];
        for (const item of products) {
          if (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product'))) {
            return item;
          }
        }
      }
    } catch (e) {
      log('JSON-LD parse error', e);
    }
    return null;
  }

  function getMetaContent(selector) {
    const el = document.querySelector(selector);
    return el ? el.getAttribute('content')?.trim() : null;
  }

  function getText(selectors) {
    for (const sel of selectors) {
      const el = typeof sel === 'function' ? sel() : document.querySelector(sel);
      if (el) {
        const text = el.textContent?.trim();
        if (text) return text;
      }
    }
    return '';
  }

  function isValidImageUrl(url) {
    return url && typeof url === 'string' && url.startsWith('http');
  }

  function getTemuGalleryImages() {
    const found = [];
    try {
      // The main product image is inside the second <ol> on the page,
      // specifically the second <li>'s <img>.
      const allOls = document.querySelectorAll('ol');
      if (allOls.length >= 2) {
        const secondOl = allOls[1];
        const lis = secondOl.querySelectorAll('li');
        if (lis.length >= 2) {
          const img = lis[1].querySelector('img');
          const src = img ? (img.src || img.dataset.src) : null;
          if (isValidImageUrl(src)) found.push(src);
        }
      }

      // Fallback using nth-of-type in case the <ol> is typed among siblings.
      const ol2 = document.querySelector('ol:nth-of-type(2)');
      if (ol2) {
        const li2 = ol2.querySelector('li:nth-of-type(2)');
        if (li2) {
          const img = li2.querySelector('img');
          const src = img ? (img.src || img.dataset.src) : null;
          if (isValidImageUrl(src) && !found.includes(src)) found.push(src);
        }
      }
    } catch (e) {
      log('Temu gallery selector error', e);
    }
    return found;
  }

  function getImages() {
    const images = [];

    // 1. TEMU gallery image — this is the most reliable source for the
    //    actual product photo and avoids the solid-red background element.
    const galleryImages = getTemuGalleryImages();
    images.push(...galleryImages);

    // JSON-LD images
    const jsonLd = getJsonLdProduct();
    if (jsonLd?.image) {
      if (Array.isArray(jsonLd.image)) {
        images.push(...jsonLd.image);
      } else {
        images.push(jsonLd.image);
      }
    }

    // OpenGraph
    const ogImage = getMetaContent('meta[property="og:image"]');
    if (ogImage) images.push(ogImage);

    // TEMU-specific image selectors
    const selectors = [
      'img[class*="main" i]',
      'img[class*="product" i]',
      'img[class*="gallery" i]',
      '[data-testid*="image"] img',
      '.product-detail img',
      'img[src*="cdn"]', // TEMU CDN images
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const src = el.src || el.dataset.src;
        if (src && !images.includes(src) && src.startsWith('http')) {
          images.push(src);
        }
      }
    }

    // Fallback: largest visible image
    if (images.length === 0) {
      const allImgs = Array.from(document.querySelectorAll('img'));
      const visible = allImgs.filter(img => img.naturalWidth > 200 && img.naturalHeight > 200);
      if (visible.length > 0) {
        visible.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
        images.push(visible[0].src);
      }
    }

    return images.filter((url, i, arr) => arr.indexOf(url) === i).slice(0, 10);
  }

  function parsePrice(input) {
    if (typeof input === 'number') return input;
    if (!input) return 0;
    const text = String(input);
    // Match patterns like $12.99, 12.99 USD, $1,234.56, etc.
    const match = text.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, '')) || 0;
    }
    return 0;
  }

  function scrapeProduct() {
    const jsonLd = getJsonLdProduct();
    const url = window.location.href;

    // Title
    let title = '';
    if (jsonLd?.name) title = jsonLd.name;
    if (!title) title = getMetaContent('meta[property="og:title"]');
    if (!title) {
      title = getText([
        'h1',
        '[data-testid*="title"]',
        '.product-title',
        '[class*="title" i]',
      ]);
    }

    // Price
    let price = 0;
    if (jsonLd?.offers?.price) {
      price = parsePrice(jsonLd.offers.price);
    }
    if (!price) {
      const priceText = getText([
        '[class*="price" i][class*="current" i]',
        '[class*="price" i]',
        '[data-testid*="price"]',
        '.main-price',
      ]);
      price = parsePrice(priceText);
    }

    // Description
    let description = '';
    if (jsonLd?.description) description = jsonLd.description;
    if (!description) description = getMetaContent('meta[property="og:description"]');
    if (!description) {
      description = getText([
        '[class*="description" i]',
        '[data-testid*="description"]',
        '.product-details',
      ]);
    }

    // Images
    const imageUrls = getImages();

    return {
      title: title || 'Unknown Product',
      price: price,
      description: description || title || '',
      image_urls: imageUrls,
      product_url: url,
      video_url: '',
    };
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'scrape') {
      if (!isProductPage()) {
        sendResponse({
          success: false,
          error: 'Not a TEMU product page. Navigate to a product page and try again.',
        });
        return true;
      }
      const data = scrapeProduct();
      sendResponse({ success: true, data });
    }
    return true;
  });

  // Also store for popup direct access fallback
  if (isProductPage()) {
    try {
      window.dogjamsProductData = scrapeProduct();
    } catch (e) {
      log('Failed to pre-scrape', e);
    }
  }
})();
