import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Monitoring Dokumen Standar Layanan dan SOP',
  description: 'Kantor Kementerian Agama Kota Tanjungpinang',
  generator: 'Prakom',
  icons: {
    icon: "/logo.ico",
  }
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
