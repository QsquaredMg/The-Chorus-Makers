import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Montserrat } from 'next/font/google'
import './globals.css'

const body = Montserrat({ subsets: ['latin'], variable: '--font-body' })
const display = Bebas_Neue({ subsets: ['latin'], variable: '--font-display-family', weight: '400' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thechorusmakers.com'),
  title: 'The Chorus Makers | Custom songs for weddings, teams, birthdays and more',
  description: 'Turn your story into an original song made just for the people you love. Every song is written, produced and reviewed by hand.',
  openGraph: {
    title: 'The Chorus Makers | Custom music for special occasions',
    description: 'Original songs made from your story. Weddings, birthdays, memorials, teams and business.',
    images: ['/brand/hero-couple.jpg'],
  },
  icons: { icon: '/brand/logo.png' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#14072a',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
