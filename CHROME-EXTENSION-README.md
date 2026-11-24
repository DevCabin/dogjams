# DogJams - Manual Product Import

This is a Chrome extension that allows you to manually send product information from TEMU directly to your DogJams site.

## Features

1. **Product Data Extraction**: Automatically extracts:
   - Product title
   - Price
   - Image URL
   - Description
   - Product URL

2. **Data Submission**: Sends product data to your endpoint via:
   - Simple REST API

3. **User Feedback**: Provides immediate feedback:
   - Success confirmation
   - Error messages
   - Loading states

## Installation

### Option 1: Local Development (Recommended for testing)
1. Run the local API server:
```bash
npm run api
```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory (`dogjams`)

3. The extension will appear in your toolbar

### Option 2: Production Setup (Future)
When ready to deploy:
1. Deploy the API endpoint to your production server
2. Update the `sendToEndpoint` function to use the production URL
3. Submit to Chrome Web Store

## How to Use (Local Testing)

1. Go to a TEMU product page
2. Click the DogJams icon in your toolbar
3. The extension will:
   - Extract product information
   - Send it to `http://localhost:8000/api/product`
   - Show success/error message

## Limitations

1. **Local Only**: Currently only works with `http://localhost:8000`
2. **Manual Process**: You need to manually click the icon on each product page
3. **TEMU Specific**: Designed for TEMU product pages only
4. **No Persistence**: The extension works but doesn't persist data for future use

## How It Works

### Chrome Extension Components

1. **manifest.json**: Extension metadata and permissions
2. **popup.html**: The extension UI (shown when you click the icon)
3. **popup.js**: Handles user interactions and sends data
4. **content.js**: Runs on TEMU pages to extract product info

### API Endpoint

The endpoint at `http://localhost:8000/api/product`:
1. Receives product data as JSON
2. Validates the data
3. Appends it to `src/data/products.json`
4. Returns success/failure response

## For Future Development

### Production Version
When ready to deploy to production:
1. Deploy the `api-server.js` to your Vercel/production server
2. Update the endpoint URL in `popup.js`
3. Handle proper authentication (OAuth or API keys)
4. Set up proper CORS handling

### Enhanced Features
1. Add batch processing (multiple products at once)
2. Add local storage to track sent products
3. Add product ID deduplication
4. Add error logging and retry logic

## Development Notes

The extension is designed to work with the current local development environment:
- API runs at `http://localhost:8000`
- Uses the `src/data/products.json` file as the data store
- Works with the current static site architecture

## Troubleshooting

### Common Issues
1. **"Failed to send product"**:
   - Make sure the API server is running: `npm run api`
   - Check the console for detailed errors

2. **No product data extracted**:
   - The extension only works on product pages
   - The selectors may need to be updated for new TEMU layouts

3. **Extension not loading**:
   - Make sure you're using "Load unpacked" in developer mode
   - Check the console for errors with `chrome://extensions/`

### Running the API Server
```bash
npm run api
```

This will start the local API server on port 8000. The extension will connect to this server to send product data.

## Security Note

This extension is for local development and testing only. In production:
- You'd need proper API authentication
- You'd need to handle CORS correctly
- You'd want to validate/validate the product data

The API endpoint currently has no authentication and is meant for development only.