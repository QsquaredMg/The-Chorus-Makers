import type { MetadataRoute } from 'next'

// Web app manifest: used when the site is saved to a phone or desktop home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Chorus Makers',
    short_name: 'Chorus Makers',
    description: 'Custom songs made from your story for weddings, teams, birthdays and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#14072a',
    theme_color: '#14072a',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
