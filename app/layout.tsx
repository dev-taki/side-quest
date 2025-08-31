import type { Metadata, Viewport } from "next";
import { youngSerif, bitter } from "./config/fonts";
import "./globals.css";
import { Providers } from "./providers";
import { clearPWADismissFlag } from "./components/PWAInstall";
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
      title: "Side Quest - Your Adventure Begins Here",
    description: "Join Side Quest and start your journey today. Secure authentication and comprehensive admin panel.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Side Quest",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/mobile-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/mobile-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/mobile-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3B3B3B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Side Quest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body
        className={`${youngSerif.variable} ${bitter.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear PWA dismiss flag on app start
              if (typeof window !== 'undefined') {
                localStorage.removeItem('pwa-install-dismissed');
              }
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        <script src="https://web.squarecdn.com/v1/square.js" async></script>
      </body>
    </html>
  );
}
