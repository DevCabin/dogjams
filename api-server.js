const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const PRODUCTS_FILE = path.join(__dirname, 'src', 'data', 'products.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Receive product from Chrome extension
app.post('/api/product', (req, res) => {
  try {
    const body = req.body;

    // Validation
    if (!body.title || body.price === undefined || body.price === null) {
      return res.status(400).json({ error: 'Missing required fields: title and price' });
    }

    // Read existing products
    let existingProducts = [];
    try {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      existingProducts = JSON.parse(raw);
      if (!Array.isArray(existingProducts)) existingProducts = [];
    } catch {
      existingProducts = [];
    }

    // Deduplication: skip if same product_url already exists
    const productUrl = body.product_url || '';
    if (productUrl) {
      const duplicate = existingProducts.find(p => p.product_url === productUrl);
      if (duplicate) {
        return res.status(409).json({
          error: 'Product already exists',
          product: duplicate
        });
      }
    }

    // Parse price
    let priceNum = 0;
    if (typeof body.price === 'number') {
      priceNum = body.price;
    } else {
      const cleaned = String(body.price).replace(/[^0-9.]/g, '');
      priceNum = parseFloat(cleaned) || 0;
    }

    const newProduct = {
      id: body.id || `temu-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      title: String(body.title).trim().slice(0, 200),
      price: priceNum,
      description: String(body.description || body.title).trim().slice(0, 1000),
      image_urls: Array.isArray(body.image_urls)
        ? body.image_urls.filter(Boolean).slice(0, 10)
        : body.image_url
          ? [body.image_url]
          : [],
      video_url: body.video_url || '',
      product_url: productUrl
    };

    existingProducts.push(newProduct);

    // Write back
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(existingProducts, null, 2));

    return res.json({
      success: true,
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Failed to add product', detail: error.message });
  }
});

// List all products
app.get('/api/products', (_req, res) => {
  try {
    let products = [];
    try {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      products = JSON.parse(raw);
      if (!Array.isArray(products)) products = [];
    } catch {
      products = [];
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

app.listen(PORT, () => {
  console.log(`DogJams API running on http://localhost:${PORT}`);
  console.log(`  POST /api/product  - add a product from the extension`);
  console.log(`  GET  /api/products - list all products`);
  console.log(`  GET  /health       - health check`);
});
