# DogJams Chrome Extension

Scrape product data from TEMU and send it directly to your DogJams catalog.

## What changed in v1.1

- **Node/Express backend** — replaced Deno/Hono with Node/Express (`npm run api`)
- **Messaging architecture** — popup now talks to the content script via `chrome.tabs.sendMessage` instead of trying to read the DOM directly
- **Robust scraping** — tries JSON-LD structured data → OpenGraph meta tags → multiple CSS selector fallbacks
- **Configurable endpoint** — set your API URL in the popup (defaults to `http://localhost:8000/api/product`)
- **Deduplication** — backend skips products with the same `product_url`
- **Price parsing** — extracts numeric price from text like `$12.99`
- **Live preview** — see the scraped title, price, and image before sending
- **Icons** — added 16/48/128px icons

## Installation

### 1. Start the API server

```bash
npm run api
```

Runs on `http://localhost:8000` by default.

### 2. Load the extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dogjams` repo folder

### 3. Use it

1. Navigate to any TEMU product page
2. Click the **DJ** icon in your toolbar
3. Review the preview → click **Send to DogJams**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/product` | Add a product (extension calls this) |
| GET | `/api/products` | List all products |

## Configuring the endpoint

Click the extension icon → enter your API URL in the **API Endpoint** field → click **Save**.

For local dev: `http://localhost:8000/api/product`  
For production: `https://your-domain.com/api/product`

## Production deployment

### Option A: Deploy the API alongside your site

If you're on Vercel/Netlify, move `api-server.js` logic into a serverless function (e.g., `api/product.js`) and point the extension to it.

### Option B: Keep a small dedicated server

Deploy `api-server.js` to any Node host (Railway, Render, Fly.io, etc.) and set the endpoint in the extension.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Failed to read product data" | Reload the TEMU page — the content script may not have injected yet |
| "Network error" | Make sure `npm run api` is running and the endpoint URL is correct |
| "Product already exists" | That TEMU URL is already in `src/data/products.json` — deduplication is working |
| No preview image | TEMU may use lazy-loaded images; try scrolling the product page first |
