import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Libre_Baskerville } from 'next/font/google'
import './globals.css'

const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const display = Libre_Baskerville({ subsets: ['latin'], variable: '--font-display-family', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'The Chorus Makers | Original songs for meaningful moments',
  description: 'Turn your story into an original song made just for them.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f1eb',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${body.variable} ${display.variable} antialiased`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
