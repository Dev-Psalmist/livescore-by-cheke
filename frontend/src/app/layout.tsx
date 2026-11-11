import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LiveScore by Cheke",
    template: "%s | LiveScore by Cheke",
  },

  description:
    "LiveScore by Cheke brings you live football scores, match fixtures, results, league standings, team information and match updates from around the world.",

  applicationName: "LiveScore by Cheke",

  keywords: [
    "LiveScore",
    "Live football scores",
    "Football fixtures",
    "Football results",
    "League standings",
    "Football teams",
    "LiveScore by Cheke",
  ],

  authors: [
    {
      name: "LiveScore by Cheke",
    },
  ],

  openGraph: {
    title: "LiveScore by Cheke",
    description:
      "Every Match. Every Goal. Every Moment. Follow live football scores, fixtures and competitions.",
    siteName: "LiveScore by Cheke",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}