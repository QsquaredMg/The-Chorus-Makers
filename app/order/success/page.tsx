import Link from 'next/link'

export const metadata = {
  title: 'Order received | The Chorus Makers',
  robots: { index: false, follow: false },
}

export default function OrderSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="eyebrow">Payment received</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Thank you. Your story is in good hands.</h1>
      <p className="mt-6 max-w-md leading-7 text-muted-foreground">
        Your payment went through and your song brief is with our team. Watch your inbox for a receipt and a note from us
        as soon as work begins.
      </p>
      <Link href="/" className="mt-10 text-sm font-medium underline underline-offset-4">
        Back to The Chorus Makers
      </Link>
    </main>
  )
}
