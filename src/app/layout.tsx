import type { Metadata } from "next";
import "./globals.css";
import { Jacquard_12 } from 'next/font/google'

const jacquard = Jacquard_12({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jacquard',
})

export const metadata: Metadata = {
  title: "Medieval Pomodoro",
  description: "Medieval pixel style pomodoro game",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jacquard.variable} font-jacquard antialiased`}>
        {children}
      </body>
    </html>
  )
}