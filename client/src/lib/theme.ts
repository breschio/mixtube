import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function to merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// App color palette
export const colors = {
  // Base colors
  primary: 'rgb(var(--primary))',
  primaryHover: 'rgb(var(--primary-hover))',
  secondary: 'rgb(var(--secondary))',
  accent: 'rgb(var(--accent))',
  background: 'rgb(var(--background))',
  foreground: 'rgb(var(--foreground))',
  muted: 'rgb(var(--muted))',
  mutedForeground: 'rgb(var(--muted-foreground))',
  border: 'rgb(var(--border))',
  
  // UI element colors
  card: 'rgb(var(--card))',
  cardForeground: 'rgb(var(--card-foreground))',
  input: 'rgb(var(--input))',
  ring: 'rgb(var(--ring))',
  
  // Status colors
  destructive: 'rgb(var(--destructive))',
  success: 'rgb(var(--success))',
  warning: 'rgb(var(--warning))',
  info: 'rgb(var(--info))'
};

// Spacing scale
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Typography
export const typography = {
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
};

// Borders
export const borders = {
  radius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Transitions
export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Theme-based styles for components
export const componentStyles = {
  // Container layouts
  container: 'mx-auto px-4 sm:px-6 lg:px-8',
  
  // Card styles
  card: 'bg-card text-card-foreground rounded-lg border shadow-sm',
  cardHeader: 'p-6 flex flex-col space-y-1.5',
  cardContent: 'p-6 pt-0',
  cardFooter: 'p-6 pt-0 flex items-center',
  
  // Button styles
  button: {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    sizes: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  
  // Form elements
  input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  
  // DJ Controls specific
  djControls: {
    container: 'grid gap-8',
    slider: 'relative flex flex-col items-center',
    button: 'flex items-center justify-center px-4 py-2 rounded-md transition-colors',
    tabs: 'grid w-full grid-cols-2 rounded-lg p-1 bg-muted',
    tabItem: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  },
};

// Reusable style groups for specific components
export const uiStyles = {
  videoThumbnail: 'relative overflow-hidden rounded-md',
  videoTitle: 'line-clamp-2 text-sm font-medium',
  channelName: 'text-xs text-muted-foreground',
  badge: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  tooltip: 'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
}; 