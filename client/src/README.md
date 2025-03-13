# MixTube Styling Guide

This document outlines the styling approach for MixTube to maintain a consistent design throughout the application.

## Theme System

The theme system is organized in the `/src/lib/theme.ts` file. This provides a centralized place for all design tokens and component styles.

### Core Design Tokens

The theme file exports several key design token categories:

- `colors`: App color palette with base colors, UI element colors, and status colors
- `spacing`: Consistent spacing scale (xs, sm, md, lg, xl, etc.)
- `typography`: Font sizes, weights, and line heights
- `borders`: Border radius and width options
- `shadows`: Shadow variations from small to extra large
- `transitions`: Duration and timing functions for animations

### Component Styles

The `componentStyles` object provides reusable styles for common components:

- Container layouts
- Cards (header, content, footer)
- Buttons (variants, sizes)
- Form elements
- DJ Controls specific elements

### Utility Styles

The `uiStyles` object contains reusable style groups for specific UI elements:
- Video thumbnails
- Video titles
- Channel names
- Badges
- Tooltips

## Using the Theme System

### 1. Importing

```tsx
import { cn, colors, componentStyles, uiStyles } from "@/lib/theme";
```

### 2. Applying component styles

```tsx
<div className={componentStyles.card}>
  <div className={componentStyles.cardHeader}>Header content</div>
  <div className={componentStyles.cardContent}>Main content</div>
  <div className={componentStyles.cardFooter}>Footer content</div>
</div>
```

### 3. Combining with tailwind classes

Use the `cn()` utility function to combine styles:

```tsx
<button 
  className={cn(
    componentStyles.button.base,
    componentStyles.button.primary,
    "mt-4 mb-2"
  )}
>
  Click Me
</button>
```

### 4. Responsive design

Use the new media query hooks for responsive design:

```tsx
import { useMediaQuery, useIsMobile } from "@/hooks/use-media-query";

function MyComponent() {
  const isMobile = useIsMobile();
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  
  return (
    <div className={isMobile ? "p-2" : "p-6"}>
      {isLargeScreen && <div>Extra content for large screens</div>}
    </div>
  );
}
```

## Best Practices

1. **Use the theme system**: Always use the theme system instead of hardcoding colors, spacing, etc.

2. **Responsive design**: Use the media query hooks for consistent breakpoints.

3. **Consistent component styles**: Use the predefined component styles for consistency.

4. **Class composition**: Use the `cn()` utility to combine classes properly.

5. **DRY principle**: If you find yourself repeating styles, consider adding them to the theme system.

6. **Background transparency**: For components that should adapt to different backgrounds, use transparent backgrounds.

7. **Dark mode compatible**: All components should work well with the dark mode.

## Component Structure

When creating new components:

1. Import the necessary theme utilities
2. Use the componentStyles object for consistent styling
3. Use the cn() function to merge classNames
4. When applicable, make components transparent so they adapt to parent containers

This approach ensures styling consistency across the application and makes the codebase more maintainable. 