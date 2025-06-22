
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5a3c' },
    { media: '(prefers-color-scheme: dark)', color: '#d4af37' }
  ]
};

export const metadata: Metadata = {
  title: 'Dashboard Elite - Celeste | Ballet Folklórico Argentino',
  description: 'Panel de control personalizado para bailarina profesional de ballet folklórico argentino. Monitoreo integral de salud, fitness y rendimiento.',
  keywords: 'ballet folklórico, salud, fitness, dashboard, monitoreo, Argentina, bailarina, entrenamiento',
  authors: [{ name: 'Celeste Dashboard Team' }],
  creator: 'Celeste Dashboard',
  publisher: 'Celeste Dashboard',
  robots: 'index, follow',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://celeste-dashboard.netlify.app',
    title: 'Dashboard Elite - Celeste',
    description: 'Panel de control personalizado para bailarina de ballet folklórico argentino',
    siteName: 'Dashboard Elite - Celeste',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dashboard Elite - Celeste'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Elite - Celeste',
    description: 'Panel de control personalizado para bailarina de ballet folklórico argentino',
    images: ['/og-image.png']
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Celeste Dashboard',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#8b5a3c',
    'msapplication-config': '/browserconfig.xml'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)'
              },
              success: {
                iconTheme: {
                  primary: 'var(--success-color)',
                  secondary: 'white'
                }
              },
              error: {
                iconTheme: {
                  primary: 'var(--error-color)',
                  secondary: 'white'
                }
              }
            }}
          />
        </ThemeProvider>

        {/* Service Worker Registration */}
        <Script id="sw-registration" strategy="afterInteractive">
          {`
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
          `}
        </Script>

        {/* PWA Install Prompt */}
        <Script id="pwa-install" strategy="afterInteractive">
          {`
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              
              // Show install button
              const installButton = document.getElementById('pwa-install');
              if (installButton) {
                installButton.style.display = 'block';
                installButton.addEventListener('click', () => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                  });
                });
              }
            });
          `}
        </Script>

        {/* Analytics (Optional - replace with your analytics code) */}
        {process.env.NODE_ENV === 'production' && (
          <Script id="analytics" strategy="afterInteractive">
            {`
              // Add your analytics script here
              console.log('Analytics initialized for Celeste Dashboard');
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
