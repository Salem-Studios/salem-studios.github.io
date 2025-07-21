import type { Metadata } from "next";
import "./globals.css";
import { Jacquard_12 } from 'next/font/google'
import { VT323} from 'next/font/google'

const jacquard = Jacquard_12({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jacquard',
})

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  title: "Medieval Pomodoro",
  description: "Medieval pixel style pomodoro game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jacquard.variable} ${vt323.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}