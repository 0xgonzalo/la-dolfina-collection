# Hero Section Update - Mootown Style

## Changes Made

### New Components Created

1. **`app/components/Hero.tsx`**
   - Mootown-inspired hero design
   - Large main image display with vertical thumbnail gallery
   - Image selection functionality
   - Responsive layout with sticky thumbnail sidebar
   - "La Dolfina" title with serif font
   - "MORE INFO" button with dropdown icon

2. **`app/components/Collection.tsx`**
   - Grid-based gallery of all 8 images
   - Hover effects with overlay showing NFT details
   - Responsive grid (1-4 columns based on screen size)
   - Smooth transitions and animations

### Updated Components

1. **`app/components/Navbar.tsx`**
   - Added "Home" and "Collection" navigation links
   - Links positioned next to the logo
   - Responsive (hidden on mobile, visible on md+)
   - Smooth scroll to sections

2. **`app/page.tsx`**
   - Simplified to use new Hero and Collection components
   - Removed old hero content
   - Clean, minimal structure

## Design Features

### Hero Section
- **Layout**: Side-by-side main image and thumbnail gallery
- **Typography**: Large serif font for title ("La Dolfina")
- **Images**: Uses all 8 images from `/public/img/`
- **Interaction**: Click thumbnails to change main image
- **Responsive**:
  - Desktop: Vertical thumbnail gallery on right
  - Mobile: Horizontal thumbnail scroll below main image

### Collection Section
- **Layout**: Responsive grid (1-4 columns)
- **Hover Effects**: Scale image + show overlay with details
- **Information**: Displays "La Dolfina #X" and "Limited Edition"
- **Spacing**: Clean padding and gaps

### Navigation
- **Links**: Home, Collection
- **Behavior**: Smooth scroll to sections
- **Wallet Button**: Maintained from original design

## Image Structure

All 8 images from `/public/img/`:
- 1.jpg (6.0 MB)
- 2.jpg (4.2 MB)
- 3.jpg (3.8 MB)
- 4.jpg (5.9 MB)
- 5.jpg (5.4 MB)
- 6.jpg (6.9 MB)
- 7.jpg (5.7 MB)
- 8.jpg (3.2 MB)

**Note**: Images are large. Consider optimizing for production.

## Color Scheme

Maintained from original with slight adjustments:
- **Background**: Light gray gradient
- **Text**: Dark gray (#1a1a1a)
- **Accents**: Indigo (#6366f1)
- **Borders**: Gray-200 (#e5e7eb)

## Responsive Breakpoints

- **Mobile** (< 640px): Single column, horizontal thumbnail scroll
- **Tablet** (640px - 1024px): 2-3 columns in collection
- **Desktop** (> 1024px): Full layout with vertical thumbnails, 4 columns in collection

## Technical Details

### Image Optimization
- Using Next.js Image component for automatic optimization
- Proper `sizes` attribute for responsive loading
- `priority` flag on hero images for LCP optimization
- Lazy loading for collection grid

### Performance
- Client-side components for interactivity
- Optimized image loading
- Smooth animations with CSS transitions
- Sticky positioning for thumbnails on desktop

### Accessibility
- Alt text for all images
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels where needed

## Running the App

The dev server is running on:
- **Local**: http://localhost:3001
- **Network**: http://192.168.100.7:3001

(Port 3001 because 3000 was in use)

## Next Steps

### Recommended Optimizations

1. **Image Compression**
   - Images are 3-7 MB each
   - Use image optimization tools (e.g., ImageOptim, Squoosh)
   - Target: < 500KB per image

2. **Progressive Loading**
   - Add blur placeholder for images
   - Implement skeleton loaders

3. **Additional Features**
   - Add image modal/lightbox
   - Implement image navigation arrows
   - Add NFT metadata display

4. **Mobile Menu**
   - Add hamburger menu for mobile
   - Include navigation links in mobile menu

5. **SEO**
   - Update metadata for new content
   - Add structured data for NFT collection

## File Structure

```
app/
├── components/
│   ├── Navbar.tsx (updated - added nav links)
│   ├── Hero.tsx (new - Mootown style hero)
│   └── Collection.tsx (new - NFT gallery grid)
├── page.tsx (updated - uses new components)
└── layout.tsx (unchanged)
```

## Browser Compatibility

Tested features work on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)
