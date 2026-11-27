// popup.js
// Uses chrome.tabs.sendMessage to ask the content script for scraped data

// --------------------------
//   Helper to get the DogJams API endpoint
// --------------------------
const DEFAULT_ENDPOINT = 'https://dogjams.com/api/product';

function getEndpoint() {
  return localStorage.getItem('dogjams_endpoint') || DEFAULT_ENDPOINT;
}

function setEndpoint(url) {
  localStorage.setItem('dogjams_endpoint', url);
}

// --------------------------
//   OpenAI key handling
// --------------------------
async function getOpenAIKey() {
  // Prefer Chrome sync storage (requires permission in manifest)
  if (chrome && chrome.storage && chrome.storage.sync) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['openai_key'], (result) => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
        const key = result.openai_key;
        if (key) { resolve(key); return; }
        // No key stored, prompt user
        const userKey = prompt('Enter your OpenAI API key:');
        if (!userKey) { reject(new Error('No key provided')); return; }
        chrome.storage.sync.set({ openai_key: userKey }, () => {
          if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return; }
          localStorage.setItem('openai_key', userKey); // fallback
          resolve(userKey);
        });
      });
    });
  }

  // Fallback to localStorage
  const key = localStorage.getItem('openai_key');
  if (key) return Promise.resolve(key);

  // Prompt user
  const userKey = prompt('Enter your OpenAI API key:');
  if (!userKey) return Promise.reject(new Error('No key provided'));
  localStorage.setItem('openai_key', userKey);
  return Promise.resolve(userKey);
}

// --------------------------
//   OpenAI generation
// --------------------------
async function generateAiDescriptionOpenAI(title, description) {
  const apiKey = await getOpenAIKey();
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a witty, persuasive e-commerce copywriter who writes fun, engaging sales copy for pet products sold on DogJams. Keep it to 1-2 short paragraphs. Be playful but clear.',
      },
      {
        role: 'user',
        content: `Write fun, compelling sales copy for a product titled "${title}". Current description: ${description || '(none provided)'}.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const rawText = await res.text();
  const contentType = res.headers.get('content-type') || '';
  console.log('[DogJams] OpenAI raw status:', res.status, 'content-type:', contentType, 'body:', rawText.slice(0, 200));
  let data;
  try { data = JSON.parse(rawText); } catch { data = { error: rawText }; }
  if (!res.ok) {
    throw new Error(data.error || data.detail || `OpenAI returned status ${res.status}`);
  }
  if (!data.choices || !data.choices[0] || typeof data.choices[0].message.content !== 'string') {
    throw new Error(`OpenAI returned an empty description. Raw: ${rawText.slice(0, 200)}`);
  }
  return data.choices[0].message.content.trim();
}

// --------------------------
//   UI logic
// --------------------------
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

  // Load saved endpoint
  endpointInput.value = getEndpoint();

  saveEndpointBtn.addEventListener('click', () => {
    const url = endpointInput.value.trim();
    if (!url) { showStatus('Please enter a valid endpoint URL', 'error'); return; }
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
    if (!currentProduct) { showStatus('No product data to send. Open a TEMU product page and try again.', 'error'); return; }

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

    if (!title) { showStatus('Enter a title before using Write with AI.', 'error'); return; }

    aiWriteBtn.disabled = true;
    aiWriteBtn.textContent = 'Writing...';
    showStatus('');

    try {
      const newDesc = await generateAiDescriptionOpenAI(title, description);
      editDescription.value = newDesc;
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
      ? `<img src=\"${escapeHtml(data.image_urls[0])}\" alt=\"\" style=\"max-width:100%;max-height:120px;border-radius:6px;\">`
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
    if (type !== 'error') {
      setTimeout(() => { statusDiv.style.display = 'none'; }, 4000);
    }
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
