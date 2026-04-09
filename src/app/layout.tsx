import type { Metadata, Viewport } from "next";
import { ZCOOL_KuaiLe, Orbitron } from "next/font/google";
import "./globals.css";

const zcool = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-game",
  display: "swap",
});

const orbitron = Orbitron({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-arcade",
  display: "swap",
});

export const metadata: Metadata = {
  title: "贴膜大亨 - 手膜产业帝国",
  description: "从路边贴膜摊到全球屏保集团，打造你的贴膜帝国！",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "贴膜大亨",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${zcool.variable} ${orbitron.variable}`}>
      <body className="antialiased text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
