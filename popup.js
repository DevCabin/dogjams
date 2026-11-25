// popup.js
// Uses chrome.tabs.sendMessage to ask the content script for scraped data

const DEFAULT_ENDPOINT = 'https://dogjams.com/api/product';

function getEndpoint() {
  return localStorage.getItem('dogjams_endpoint') || DEFAULT_ENDPOINT;
}

function setEndpoint(url) {
  localStorage.setItem('dogjams_endpoint', url);
}

document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('sendButton');
  const statusDiv = document.getElementById('status');
  const previewImageDiv = document.getElementById('previewImage');
  const noProductDiv = document.getElementById('noProduct');
  const endpointInput = document.getElementById('endpoint');
  const saveEndpointBtn = document.getElementById('saveEndpoint');
  const editTitle = document.getElementById('editTitle');
  const editPrice = document.getElementById('editPrice');
  const editDescription = document.getElementById('editDescription');
  const aiWriteBtn = document.getElementById('aiWriteBtn');

  let currentProduct = null;

  function getAiEndpoint() {
    return getEndpoint().replace(/\/api\/product\/?$/, '/api/ai-description');
  }

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
      noProductDiv.style.display = 'none';

      // Ask content script for data to preview
      chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (response) => {
        if (chrome.runtime.lastError) {
          previewImageDiv.textContent = 'Reload the page if this is a TEMU product page.';
          console.error('[DogJams] Content script error:', chrome.runtime.lastError);
          return;
        }
        if (response?.success) {
          currentProduct = response.data;
          renderForm(currentProduct);
          sendBtn.style.display = 'inline-block';
        } else {
          previewImageDiv.textContent = response?.error || 'Could not read product data.';
          console.error('[DogJams] Scraping error:', response?.error);
        }
      });
    } else {
      sendBtn.style.display = 'none';
      aiWriteBtn.style.display = 'none';
      noProductDiv.style.display = 'block';
      previewImageDiv.textContent = '';
    }
  });

  sendBtn.addEventListener('click', async () => {
    if (!currentProduct) {
      showStatus('No product data to send. Open a TEMU product page and try again.', 'error');
      return;
    }

    const editedProduct = {
      ...currentProduct,
      title: editTitle.value.trim() || currentProduct.title,
      price: parseFloat(editPrice.value) || 24.99,
      description: editDescription.value.trim(),
    };

    await sendToEndpoint(editedProduct);
  });

  aiWriteBtn.addEventListener('click', async () => {
    const title = editTitle.value.trim();
    const description = editDescription.value.trim();

    if (!title) {
      showStatus('Enter a title before using Write with AI.', 'error');
      return;
    }

    aiWriteBtn.disabled = true;
    aiWriteBtn.textContent = 'Writing...';
    showStatus('');

    try {
      const res = await fetch(getAiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const contentType = res.headers.get('content-type') || '';
      const rawText = await res.text();
      console.log('[DogJams] AI status:', res.status, 'content-type:', contentType, 'body:', rawText);

      const data = contentType.includes('application/json') && rawText
        ? JSON.parse(rawText)
        : { error: rawText };

      if (!res.ok) {
        showStatus(data.error || data.detail || 'AI generation failed.', 'error');
        return;
      }

      if (typeof data.description !== 'string' || !data.description.trim()) {
        console.error('[DogJams] AI response missing description:', data);
        showStatus(`AI returned an empty description. Raw: ${rawText.slice(0, 200)}`, 'error');
        return;
      }

      editDescription.value = data.description;
      showStatus('Description updated!', 'success');
    } catch (err) {
      showStatus('AI request failed: ' + err.message, 'error');
    } finally {
      aiWriteBtn.disabled = false;
      aiWriteBtn.textContent = '✨ Write with AI';
    }
  });

  function renderForm(data) {
    const img = data.image_urls?.[0]
      ? `<img src="${escapeHtml(data.image_urls[0])}" alt="" style="max-width:100%;max-height:120px;border-radius:6px;">`
      : '';
    previewImageDiv.innerHTML = img;

    editTitle.value = data.title || '';
    editPrice.value = (data.price || 24.99).toFixed(2);
    editDescription.value = data.description || '';
    aiWriteBtn.style.display = 'inline-block';
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

     console.log('[DogJams] Attempting to send product data:', productData);
     console.log('[DogJams] Using endpoint:', getEndpoint());

     try {
       const response = await fetch(getEndpoint(), {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(productData),
       });
      
       console.log('[DogJams] API Response Status:', response.status);
       console.log('[DogJams] API Response Headers:', response.headers);
      
       const contentType = response.headers.get('content-type') || '';
       let result = {};
       try {
         if (contentType.includes('application/json')) {
           result = await response.json();
         } else {
           result = { error: await response.text() };
         }
       } catch (parseErr) {
         result = { error: `Non-JSON response (status ${response.status})` };
       }
       console.log('[DogJams] API Response Body:', result);

       if (response.status === 409) {
         showStatus('This product is already in your catalog.', 'error');
       } else if (response.ok) {
         showStatus('Product added to DogJams!', 'success');
       } else {
         showStatus(`Error: ${result.error || 'Failed to send product'}`, 'error');
       }
     } catch (err) {
       console.error('[DogJams] Network error:', err);
       showStatus('Network error. Is the API server running? Check the console for details.', 'error');
       // Also show a more specific error to the user
       console.error('[DogJams] Failed to send to endpoint:', getEndpoint(), err);
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
