import { WhopApp } from "@whop/react/components";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add meta tags for iframe compatibility */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors *;"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          // Ensure iframe compatibility
          margin: 0,
          padding: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/* <WhopApp> Temporarily commented out for build compatibility */}
          <ErrorBoundary>
            <WhopUserProvider initialUser={initialUser}>
              <div className="w-full h-full">{children}</div>
            </WhopUserProvider>
          </ErrorBoundary>
        {/* </WhopApp> */}
      </body>
    </html>
  );
}
