// Vercel serverless function: POST /api/ai-description
// Generates fun, compelling product sales copy using OpenAI.
// Requires OPENAI_API_KEY environment variable.

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'OpenAI API key is not configured' }));
    return;
  }

  try {
    const body = await parseBody(req);
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();

    if (!title) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Title is required' }));
      return;
    }

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });

    const openAiData = await openAiRes.json();

    if (!openAiRes.ok) {
      console.error('OpenAI error:', openAiData);
      res.statusCode = 502;
      res.end(JSON.stringify({
        error: 'OpenAI request failed',
        detail: openAiData?.error?.message || 'Unknown error',
      }));
      return;
    }

    const generated = openAiData.choices?.[0]?.message?.content?.trim();
    if (!generated) {
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'OpenAI returned empty content' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ description: generated }));
  } catch (err) {
    console.error('AI description error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to generate description', detail: err.message }));
  }
};
