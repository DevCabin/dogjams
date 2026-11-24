// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const sendButton = document.getElementById('sendButton');
  const statusDiv = document.getElementById('status');
  const noProductDiv = document.getElementById('noProduct');
  
  // Check if we're on a TEMU product page
  if (window.location.hostname.includes('temu.com')) {
    sendButton.style.display = 'block';
    noProductDiv.style.display = 'none';
  } else {
    sendButton.style.display = 'none';
    noProductDiv.style.display = 'block';
  }
  
  sendButton.addEventListener('click', function() {
    // Get product data from the current page
    const productData = getProductData();
    
    if (!productData) {
      showStatus('Could not extract product data from the page.', 'error');
      return;
    }
    
    // Send to your endpoint
    sendToEndpoint(productData);
  });
});

function getProductData() {
  // Try to extract product info from TEMU page
  const titleElement = document.querySelector('h1') || document.querySelector('.product-title') || document.querySelector('.title');
  const priceElement = document.querySelector('.price') || document.querySelector('.price-current') || document.querySelector('.product-price');
  const imageElement = document.querySelector('img.product-image') || document.querySelector('.product-image img') || document.querySelector('img');
  const descriptionElement = document.querySelector('.product-description') || document.querySelector('.description');
  
  // Create product data object
  const productData = {
    title: titleElement ? titleElement.textContent.trim() : 'Unknown Product',
    price: priceElement ? priceElement.textContent.trim() : '0.00',
    description: descriptionElement ? descriptionElement.textContent.trim() : '',
    image_urls: imageElement ? [imageElement.src] : ['https://via.placeholder.com/300'],
    product_url: window.location.href,
    video_url: ''
  };
  
  return productData;
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

async function sendToEndpoint(productData) {
  const button = document.getElementById('sendButton');
  button.disabled = true;
  button.textContent = 'Sending...';
  showStatus('Sending product data...', 'loading');
  
  try {
    // In a real extension, this would go to the production endpoint
    // For now, we'll use the local development endpoint
    const response = await fetch('http://localhost:8000/api/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showStatus('Product successfully sent to DogJams!', 'success');
    } else {
      showStatus(`Error: ${result.error || 'Failed to send product'}`, 'error');
    }
  } catch (error) {
    console.error('Error sending product:', error);
    showStatus('Error sending product. Please try again.', 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Send Product Data';
  }
}