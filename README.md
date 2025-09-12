# AudioMax Pro - Static Website

This is a static version of the AudioMax Pro speaker sales application, converted from the original React/Express full-stack application. It can be hosted directly on static hosting platforms like Netlify, GitHub Pages, or Vercel.

## Features

- **Product Showcase**: Premium speaker presentation with high-quality images
- **Customer Order Form**: Complete order form with validation
- **Photo Upload**: Simulated photo upload functionality with preview
- **Location Services**: Browser geolocation integration for delivery coordination
- **Admin Dashboard**: View customer orders with credentials `aitrail92@gmail.com` / `909090`
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Apple/Shopify-inspired Design**: Clean, modern aesthetic with orange accent colors

## File Structure

```
static/
├── index.html          # Main HTML file (entry point)
├── css/
│   └── style.css       # All styling (converted from Tailwind)
├── js/
│   └── script.js       # All functionality (converted from React)
├── assets/
│   ├── images/
│   │   ├── premium-speaker.png
│   │   ├── portable-speaker.png
│   │   └── lifestyle-speakers.png
│   └── favicon.svg
└── README.md          # This file
```

## Deployment Instructions

### GitHub Pages
1. Upload all files to a GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (main/master)
4. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop the entire `static` folder to Netlify
2. Or connect your GitHub repository for automatic deployments
3. Your site will be available at a generated Netlify URL

### Vercel
1. Import your GitHub repository to Vercel
2. Set build output directory to `static` (if needed)
3. Deploy with automatic SSL and CDN

### Simple HTTP Server (Local Testing)
```bash
cd static
python3 -m http.server 8080
# Visit http://localhost:8080
```

**Note**: Some features like geolocation require HTTPS. Use Netlify/GitHub Pages for full functionality testing.

## Admin Access

- **Email**: `aitrail92@gmail.com`
- **Password**: `909090`

⚠️ **Security Notice**: This admin authentication is client-side only and suitable for demonstration purposes only. It provides no real security and can be easily bypassed. Do not use in production without implementing proper server-side authentication.

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Full responsive support

## Data Storage

Since this is a static website, customer orders are stored in browser localStorage including uploaded photos as base64 data. **Important considerations:**

- **Privacy**: Sensitive customer data (addresses, emails, phone numbers) is stored locally
- **Persistence**: Data is only available in the same browser/device
- **Size Limits**: Photos are limited to 2MB to prevent localStorage bloat

In production, integrate with secure backend services:
- Netlify Forms
- Formspree
- EmailJS  
- Custom serverless functions
- Database with proper encryption

## Technical Details

- **No build process required**: Pure HTML, CSS, and JavaScript
- **Framework-free**: No React, no dependencies
- **Modern browser APIs**: Uses Geolocation API and File API
- **Responsive images**: Optimized for all screen sizes
- **SEO-ready**: Proper meta tags and semantic HTML

## License

All rights reserved. This is a demonstration application for AudioMax Pro.