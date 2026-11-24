// content.js
// This script runs in the context of TEMU pages
// It's designed to detect product information and make it available to the extension

// Wait for the DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Check if we're on a product page
  if (isProductPage()) {
    // Make product data available to the popup
    makeProductDataAvailable();
  }
}

function isProductPage() {
  // Check if this is a TEMU product page
  return window.location.hostname.includes('temu.com') && 
         (window.location.pathname.includes('/product/') || 
          window.location.pathname.includes('/p/'));
}

function makeProductDataAvailable() {
  // Create a global variable that the popup can access
  // Note: In a real extension, you'd use proper messaging
  const productData = getProductData();
  
  // Store for the popup to use
  window.dogjamsProductData = productData;
}

function getProductData() {
  // Try multiple selectors to find product information
  const titleElement = document.querySelector('h1') || 
                      document.querySelector('.product-title') || 
                      document.querySelector('.title') ||
                      document.querySelector('h1 span');
  
  const priceElement = document.querySelector('.price') || 
                      document.querySelector('.price-current') || 
                      document.querySelector('.product-price') ||
                      document.querySelector('.price-main') ||
                      document.querySelector('.main-price');
  
  const imageElements = document.querySelectorAll('img');
  const imageElement = imageElements.length > 0 ? imageElements[0] : null;
  
  const descriptionElement = document.querySelector('.product-description') || 
                          document.querySelector('.description') ||
                          document.querySelector('.product-details') ||
                          document.querySelector('.description-text');
  
  return {
    title: titleElement ? titleElement.textContent.trim() : 'Unknown Product',
    price: priceElement ? priceElement.textContent.trim() : '0.00',
    description: descriptionElement ? descriptionElement.textContent.trim() : '',
    image_urls: imageElement ? [imageElement.src] : ['https://via.placeholder.com/300'],
    product_url: window.location.href,
    video_url: ''
  };
}