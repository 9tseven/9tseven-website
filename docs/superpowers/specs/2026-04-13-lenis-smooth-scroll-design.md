# Lenis Smooth Scroll — Design Spec

**Date:** 2026-04-13  
**Status:** Approved

## Summary

Add global smooth scrolling to the 9TSEVEN website using the already-installed Lenis library (v1.3.21). The implementation wraps the page content in a `<ReactLenis root>` client component, attaching Lenis to the native window scroll so all pages benefit automatically.

## Changes

### New file: `app/components/SmoothScroll.tsx`

A `"use client"` component that renders `<ReactLenis root>` from `lenis/react` around its children. The `root` prop instructs Lenis to intercept and smooth the document-level scroll.

No custom options are required — Lenis defaults (lerp ~0.1, duration ~1.2s) produce a natural, non-overdone feel.

### Edit: `app/layout.tsx`

Import `SmoothScroll` and wrap `{children}` with it. The `<Navbar>` is a fixed element and does not need to be inside the Lenis wrapper.

## Component Tree

```
RootLayout (server)
  └─ <html>
       └─ <body>
            ├─ <Navbar />
            └─ <SmoothScroll>       ← new client component
                 └─ <ReactLenis root>
                      └─ {children}
```

## Compatibility

Lenis 1.x drives the native `window.scrollY` directly (no CSS transform on the page). Motion's `useScroll` reads `window.scrollY`, so scroll-driven animations continue to work unchanged and will feel smoother as a side effect.

## Verification

- Page scrolls smoothly on all routes
- Scroll-driven animations trigger correctly
- No hydration warnings or console errors
