# DogJams

## Overview

DogJams is a Chrome extension that allows users to scrape product data from Temu and send it to your own e-commerce backend. It's designed for easy integration with platforms like Shopify or WooCommerce.

## Features

- **Product Scraping**: Extract product details directly from Temu.
- **Custom API Endpoint**: Send the scraped data to your custom endpoint.
- **AI-Generated Descriptions**: Use the integrated OpenAI API to generate product descriptions.

## Setup

1. Install the Chrome extension.
2. Set your custom API endpoint in the extension.
3. Enter your OpenAI API key in the extension.

## Development

This project was bootstrapped with [Vite](https://vitejs.dev/).

### Project Structure

```
├── public/
│   └── favicon.svg         # Brand favicon
├── src/
│   ├── components/
│   │   └── ProductCard.jsx # Card component for product display
│   ├── App.jsx             # Main App component
│   ├── main.jsx          # Entry point for the React app
│   └── index.css         # Global styles
├── tailwind.config.js      # Tailwind CSS configuration
├── index.html            # Main HTML file
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

### CSS & Styling

- **Fonts**: Uses Google Font `Poppins`.
- **Colors**: 
  - Primary: `#d4a574` (tan)
  - Muted: `#f0f4f8` (soft background)
  - Accent: `#d4a574` (tan)
- **Body Background**: `#f0f4f8` for a soft, muted feel.

### Tailwind Configuration

The project uses Tailwind CSS. The configuration defines custom color palettes and the `Poppins` font family. It's located at `tailwind.config.js`.

### Key Files

- `popup.js`: Manages the UI and API communication.
- `ProductCard.jsx`: Renders product cards with hover effects.
- `App.jsx`: Main application layout.

### Notes

- The extension requires the `storage` permission in `manifest.json`.
- The AI description generation uses the OpenAI API.

## License

MIT