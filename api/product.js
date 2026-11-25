// Vercel serverless function: POST /api/product
// Accepts scraped product data from the DogJams Chrome extension.
// If GITHUB_TOKEN is set, commits the updated products.json to GitHub
// so Vercel rebuilds the site with the new product.

const fs = require('fs');
const path = require('path');

// Vercel functions only have a writable /tmp directory.
const PRODUCTS_FILE = path.join('/tmp', 'products.json');

const GITHUB_OWNER = 'DevCabin';
const GITHUB_REPO = 'dogjams';
const GITHUB_PATH = 'src/data/products.json';
const GITHUB_BRANCH = 'main';

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

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueSlug(existingProducts, title) {
  let base = slugify(title);
  if (!base) base = `product-${Date.now()}`;
  let slug = base;
  let counter = 2;
  while (existingProducts.some(p => p.slug === slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

async function getGitHubFile(token) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'dogjams-api',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub GET failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { sha: data.sha, content: JSON.parse(content) };
}

async function updateGitHubFile(token, products, sha, productTitle) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
  const content = Buffer.from(JSON.stringify(products, null, 2)).toString('base64');

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'dogjams-api',
    },
    body: JSON.stringify({
      message: `Add product: ${productTitle}`,
      content,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${err}`);
  }

  return await res.json();
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

    const token = process.env.GITHUB_TOKEN;
    let existingProducts;
    let sha = null;

    if (token) {
      const file = await getGitHubFile(token);
      existingProducts = file.content;
      sha = file.sha;
    } else {
      existingProducts = readProducts();
    }

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
      id: body.id || `dj-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      slug: uniqueSlug(existingProducts, body.title),
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

    if (token) {
      await updateGitHubFile(token, existingProducts, sha, newProduct.title);
    } else {
      writeProducts(existingProducts);
    }

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
