# DogJams - Chrome Extension

This is a Chrome extension that allows you to send product information from TEMU directly to your DogJams site.

## Features

- Capture product data from TEMU pages
- Send product information to your site's endpoint
- User feedback when data is successfully sent

## Installation

1. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this directory

2. The extension will appear in your toolbar

## How to Use

1. Navigate to a product page on TEMU
2. Click the DogJams icon in your toolbar
3. The product data will be sent to your site

## Security Notes

This extension is designed to work with your local development environment. In production, you would need to:
- Set up a proper API endpoint
- Include proper authentication
- Handle CORS policies correctly

## Limitations

- Currently designed for local testing only
- Only works with TEMU product pages
- Data is sent to the local endpoint