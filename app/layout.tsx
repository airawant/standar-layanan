import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard Monitoring Dokumen',
  description: 'Aplikasi untuk menghimpun dokumen standar layanan dan SOP',
  generator: 'Prakom',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
