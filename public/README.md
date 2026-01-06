# Public Directory

This directory contains static assets that are served at the root of your application.

## Structure

```
public/
├── images/          # All images for the website
├── favicon.ico      # Site favicon (if you have one)
└── README.md        # This file
```

## How It Works

In Vite, files in the `public` directory are:
- Served at the root path (e.g., `public/images/logo.png` → `/images/logo.png`)
- Copied to the `dist` folder during build
- Not processed by Vite's build pipeline

## Usage in Code

### In React Components

```tsx
// Using images in your components
<img src="/images/logo.png" alt="Logo" />

// Or with dynamic paths
const imagePath = "/images/hero-bg.jpg"
<img src={imagePath} alt="Hero background" />
```

### In CSS

```css
.hero {
  background-image: url('/images/hero-bg.jpg');
}
```

## Best Practices

1. **Organize by purpose**: Group images by section (hero, about, resources, etc.)
2. **Optimize images**: Compress images before adding them
3. **Use appropriate formats**: 
   - WebP for photos (with fallbacks)
   - SVG for icons and logos
   - PNG for images with transparency
4. **Naming conventions**: Use kebab-case (e.g., `hero-background.jpg`)

## Adding Images

1. Place your image files in the `public/images/` directory
2. Reference them in your code using `/images/filename.ext`
3. The images will be automatically available in both development and production

