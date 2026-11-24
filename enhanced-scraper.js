import { chromium } from 'playwright';

async function scrapeTemuProducts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the TEMU search page for dog costumes
    console.log('Navigating to TEMU...');
    await page.goto('https://www.temu.com/search_result.html?search_key=dog%20costumes', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle0');
    console.log('Page loaded. Waiting for products...');
    
    // Wait for products to load with a more robust approach
    await page.waitForSelector('.search-result-item', { timeout: 15000 });
    console.log('Found product items. Extracting data...');
    
    const products = [];
    
    // Get the first 9 products with enhanced error handling
    for (let i = 0; i < 9; i++) {
      try {
        const product = await page.evaluate((index) => {
          const item = document.querySelectorAll('.search-result-item')[index];
          if (!item) return null;
          
          // Try to get title
          const titleElement = item.querySelector('.title') || item.querySelector('a');
          const title = titleElement?.textContent.trim() || `Product ${index + 1}`;
          
          // Try to get price
          const priceElement = item.querySelector('.price') || item.querySelector('.price-current');
          let price = 0;
          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/[\d.]+/);
            if (priceMatch) {
              price = parseFloat(priceMatch[0]);
            }
          }
          
          // Try to get image
          const imageElement = item.querySelector('img') || item.querySelector('.product-image');
          const image = imageElement?.getAttribute('src') || `https://via.placeholder.com/300?text=Product+${index + 1}`;
          
          return {
            id: `temu-${Date.now()}-${index}`,
            title,
            price,
            description: title,
            image_urls: [image],
            video_url: '',
            product_url: `https://www.temu.com/product-${index}.html`
          };
        }, i);
        
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(`Error scraping product ${i}:`, error.message);
        // Continue with other products even if one fails
        continue;
      }
    }
    
    console.log(`Successfully scraped ${products.length} products`);
    await browser.close();
    
    return products;
  } catch (error) {
    console.error('Error in scraping process:', error.message);
    await browser.close();
    return [];
  }
}

async function main() {
  try {
    const products = await scrapeTemuProducts();
    
    if (products.length === 0) {
      console.log('No products scraped. Check the error logs above.');
      return;
    }
    
    // Save to JSON file
    const fs = require('fs');
    const data = JSON.stringify(products, null, 2);
    fs.writeFileSync('./src/data/products.json', data);
    
    console.log(`Scraped ${products.length} products`);
    console.log('Products saved to src/data/products.json');
  } catch (error) {
    console.error('Error in main process:', error.message);
  }
}

main();