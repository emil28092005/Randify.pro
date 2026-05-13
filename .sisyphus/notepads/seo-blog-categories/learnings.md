## Task 6: Open Graph + Twitter Card Meta Tags

- Added `ogImage?: string` prop to `BaseLayout.astro` Props interface.
- Implemented full OG tag set: `og:site_name`, `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`, `og:image`.
- Implemented full Twitter Card tag set: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.
- Default OG image (`/og-default.jpg`) is used when `ogImage` prop is omitted.
- `ogImageUrl` helper ensures absolute URLs by prefixing `https://randify.pro` to relative paths.
- Default OG image generated via Node.js + sharp (1200x630, dark background with accent radial gradients and "Randify" branding).
- Build passes; tags verified in `dist/index.html` and `dist/generators/dice/index.html`.

