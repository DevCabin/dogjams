# DogJams - Enhanced Scraper

This is an improved scraper for TEMU dog costumes that can handle some of the anti-bot protections.

## Setup

1. Install the required dependencies:
```bash
npm install playwright
```

2. Run the scraper:
```bash
node enhanced-scraper.js
```

## How It Works

This improved scraper:
- Uses Playwright with headless browser automation
- Waits for content to load with proper timeouts
- Handles some anti-bot protections
- Saves to the products.json file for the website

## Important Notes

1. TEMU may still present CAPTCHAs or rate limiting
2. You may need to run this manually if TEMU blocks automated access
3. The script tries to handle the most common issues but may need adjustments

## Sample Output

When successful, the script will output:
```
Scraped 9 products from TEMU
Products saved to src/data/products.json
```

## Troubleshooting

If you encounter errors:
- Check if the page structure has changed
- Run the script manually to see the exact error
- You may need to adjust the selectors in the script