import { Hono } from 'https://deno.land/x/hono@v3.5.8/mod.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const app = new Hono();

// Endpoint to receive product data from Chrome extension
app.post('/api/product', async (c) => {
  try {
    const body = await c.req.json();
    
    // Basic validation
    if (!body.title || !body.price || !body.image_urls) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get existing products from file
    const fs = await import('https://deno.land/std@0.224.0/fs/mod.ts');
    
    // Read existing products
    let existingProducts = [];
    try {
      const productsFile = await Deno.readTextFile('./src/data/products.json');
      existingProducts = JSON.parse(productsFile);
    } catch (e) {
      existingProducts = [];
    }
    
    // Add new product
    const newProduct = {
      id: `temu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: body.title,
      price: parseFloat(body.price),
      description: body.description || body.title,
      image_urls: Array.isArray(body.image_urls) ? body.image_urls : [body.image_urls],
      video_url: body.video_url || '',
      product_url: body.product_url || ''
    };
    
    existingProducts.push(newProduct);
    
    // Save updated products
    await Deno.writeTextFile('./src/data/products.json', JSON.stringify(existingProducts, null, 2));
    
    return c.json({ 
      success: true, 
      message: 'Product added successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    return c.json({ error: 'Failed to add product' }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'healthy' });
});

// Serve the site files
app.get('/*', (c) => {
  return c.text('DogJams API Endpoint');
});

// Handle all other routes as 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = 8000;
console.log(`Server running on http://localhost:${port}`);

serve(app.fetch, { port });