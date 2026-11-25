// popup.js
// Uses chrome.tabs.sendMessage to ask the content script for scraped data

const DEFAULT_ENDPOINT = 'http://localhost:8000/api/product';

function getEndpoint() {
  return localStorage.getItem('dogjams_endpoint') || DEFAULT_ENDPOINT;
}

function setEndpoint(url) {
  localStorage.setItem('dogjams_endpoint', url);
}

document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendButton');
  const statusDiv = document.getElementById('status');
  const previewDiv = document.getElementById('preview');
  const noProductDiv = document.getElementById('noProduct');
  const endpointInput = document.getElementById('endpoint');
  const saveEndpointBtn = document.getElementById('saveEndpoint');

  // Load saved endpoint
  endpointInput.value = getEndpoint();

  saveEndpointBtn.addEventListener('click', () => {
    const url = endpointInput.value.trim();
    if (!url) {
      showStatus('Please enter a valid endpoint URL', 'error');
      return;
    }
    setEndpoint(url);
    showStatus('Endpoint saved!', 'success');
  });

  // Check active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const isTemu = tab?.url?.includes('temu.com');

    if (isTemu) {
      sendBtn.style.display = 'inline-block';
      noProductDiv.style.display = 'none';

      // Ask content script for data to preview
      chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (response) => {
        if (chrome.runtime.lastError) {
          previewDiv.textContent = 'Reload the page if this is a TEMU product page.';
          return;
        }
        if (response?.success) {
          renderPreview(response.data);
        } else {
          previewDiv.textContent = response?.error || 'Could not read product data.';
        }
      });
    } else {
      sendBtn.style.display = 'none';
      noProductDiv.style.display = 'block';
      previewDiv.textContent = '';
    }
  });

  sendBtn.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, async (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        showStatus(response?.error || 'Failed to read product data. Reload the page and try again.', 'error');
        return;
      }

      const data = response.data;
      await sendToEndpoint(data);
    });
  });

  function renderPreview(data) {
    const title = data.title || 'Unknown';
    const price = typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : data.price;
    const img = data.image_urls?.[0] ? `<img src="${data.image_urls[0]}" alt="" style="max-width:100%;max-height:120px;border-radius:6px;margin-bottom:8px;">` : '';

    previewDiv.innerHTML = `
      ${img}
      <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(title)}</div>
      <div style="color:#2563eb;font-weight:700;">${escapeHtml(price)}</div>
    `;
  }

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';
    setTimeout(() => { statusDiv.style.display = 'none'; }, 4000);
  }

  async function sendToEndpoint(productData) {
    sendBtn.disabled = true;
    const originalText = sendBtn.textContent;
    sendBtn.textContent = 'Sending...';
    showStatus('Sending to DogJams...', 'loading');

    try {
      const response = await fetch(getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.status === 409) {
        showStatus('This product is already in your catalog.', 'error');
      } else if (response.ok) {
        showStatus('Product added to DogJams!', 'success');
      } else {
        showStatus(`Error: ${result.error || 'Failed to send product'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showStatus('Network error. Is the API server running?', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = originalText;
    }
  }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
