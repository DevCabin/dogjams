# DogJams - Pet Costumes Site

This is a static site for dog costumes, built with Vite and React. The site pulls product data from TEMU and displays it.

## Features

- Responsive design with Tailwind CSS
- Product listings with images and prices
- Search functionality
- Auto-updating from TEMU data

## Development

To develop locally:

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Build for production: `npm run build`

## Data Source

Product data is scraped from TEMU and stored in `src/data/products.json`.

## Automation

This project includes an automated scraping system:

1. The scraper script is in `enhanced-scraper.js`
2. The scraping process is documented in the `dogjams-scraper` skill
3. The automation can be triggered manually or via cron job

## Chrome Extension

This project includes a Chrome extension that allows you to manually send product information from TEMU directly to your site:

1. The extension is in the `chrome-extension/` directory
2. You can load it in Chrome manually for testing
3. It sends product data via the API endpoint at `http://localhost:8000/api/product`

## Deployment

The site is designed for deployment on Vercel. It's a static site that will build automatically when you push to your repository.

## Getting Started

To get started with the site:

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. The site will be available at http://localhost:5173

## Updating Products

1. To update with new products, run the scraper manually:
   ```bash
   node enhanced-scraper.js
   ```
2. Or set up a cron job to run the scraper automatically
3. The site will rebuild automatically when new products are added

## Using the Chrome Extension

To use the Chrome extension:

1. Run the API server: `npm run api`
2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory
3. The extension will appear in your toolbar
4. When viewing a TEMU product page, click the extension icon
5. The product will be sent to your local endpoint

## Project Structure

- `src/data/products.json` - Product data (scraped from TEMU)
- `src/components/ProductCard.jsx` - Single product display component
- `src/components/ProductGrid.jsx` - Main product grid layout
- `src/main.jsx` - Entry point
- `src/index.css` - Base styling with Tailwind
- `index.html` - HTML entry point