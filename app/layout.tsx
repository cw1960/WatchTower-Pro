import { WhopIframeSdkProvider } from "@whop/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WhopUserProvider } from "@/lib/context/WhopUserContext";
import { getCurrentWhopUser } from "@/lib/auth/whop-auth-middleware";
import ErrorBoundary from "@/components/ErrorBoundary";
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
  title: "WatchTower Pro",
  description:
    "Advanced website monitoring and alert platform for Whop creators",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get initial user data on server side
  let initialUser = null;
  try {
    initialUser = await getCurrentWhopUser();
  } catch (error) {
    console.log("No authenticated user on initial load");
  }

  return (
    <html lang="en" suppressHydrationWarning data-whop-theme="dark">
      <head>
        {/* Critical meta tags for Whop iframe compatibility */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0f172a" />
        {/* Prevent zoom on mobile in iframe */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased iframe-background`}
        style={{
          // Critical iframe compatibility styles
          margin: 0,
          padding: 0,
          height: "100vh",
          width: "100vw",
          overflow: "auto",
          backgroundColor: "#0f172a",
          color: "#f1f5f9",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          // Prevent iOS bounce scrolling in iframe
          overscrollBehavior: "none",
          // Ensure proper rendering in iframe
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
        }}
      >
        <WhopIframeSdkProvider>
          <ErrorBoundary>
            <WhopUserProvider initialUser={initialUser}>
              <div 
                className="w-full h-full min-h-screen iframe-background iframe-safe"
                style={{
                  backgroundColor: "#0f172a",
                  minHeight: "100vh",
                  width: "100%",
                }}
              >
                {children}
              </div>
            </WhopUserProvider>
          </ErrorBoundary>
        </WhopIframeSdkProvider>
      </body>
    </html>
  );
}
