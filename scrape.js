const { chromium } = require('playwright');

async function scrapeTemuProducts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to the TEMU search page for dog costumes
  await page.goto('https://www.temu.com/search_result.html?search_key=dog%20costumes');
  
  // Wait for products to load
  await page.waitForSelector('.search-result-item');
  
  const products = [];
  
  // Get the first 9 products
  for (let i = 0; i < 9; i++) {
    try {
      const product = await page.evaluate((index) => {
        const item = document.querySelectorAll('.search-result-item')[index];
        if (!item) return null;
        
        const title = item.querySelector('.title')?.textContent.trim() || '';
        const price = item.querySelector('.price')?.textContent.trim() || '';
        const image = item.querySelector('img')?.getAttribute('src') || '';
        
        return {
          id: `temu-${Date.now()}-${index}`,
          title,
          price: parseFloat(price.replace(/[^0-9.]/g, '')) || 0,
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
      console.error(`Error scraping product ${i}:`, error);
    }
  }
  
  await browser.close();
  
  return products;
}

async function main() {
  try {
    const products = await scrapeTemuProducts();
    
    // Save to JSON file
    const fs = require('fs');
    const data = JSON.stringify(products, null, 2);
    fs.writeFileSync('./src/data/products.json', data);
    
    console.log(`Scraped ${products.length} products`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();