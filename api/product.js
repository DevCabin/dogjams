// Vercel serverless function: POST /api/product
// Accepts scraped product data from the DogJams Chrome extension.

const fs = require('fs');
const path = require('path');

// Vercel functions only have a writable /tmp directory.
const PRODUCTS_FILE = path.join('/tmp', 'products.json');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function readProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function parsePrice(input) {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const cleaned = String(input).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await parseBody(req);

    if (!body.title || body.price === undefined || body.price === null) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Missing required fields: title and price' }));
      return;
    }

    const existingProducts = readProducts();

    const productUrl = body.product_url || '';
    if (productUrl) {
      const duplicate = existingProducts.find(p => p.product_url === productUrl);
      if (duplicate) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'Product already exists', product: duplicate }));
        return;
      }
    }

    const newProduct = {
      id: body.id || `temu-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: String(body.title).trim().slice(0, 200),
      price: parsePrice(body.price),
      description: String(body.description || body.title || '').trim().slice(0, 1000),
      image_urls: Array.isArray(body.image_urls)
        ? body.image_urls.filter(Boolean).slice(0, 10)
        : body.image_url
        ? [body.image_url]
        : [],
      video_url: body.video_url || '',
      product_url: productUrl,
    };

    existingProducts.push(newProduct);
    writeProducts(existingProducts);

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'Product added successfully',
      product: newProduct,
    }));
  } catch (err) {
    console.error('Error adding product:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to add product', detail: err.message }));
  }
};
