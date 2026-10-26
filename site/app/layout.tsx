import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Albert_Sans, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

const sans = Albert_Sans({ subsets: ['latin'], variable: '--font-albert-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: { default: 'Foxy SDK v2', template: '%s | Foxy SDK v2' },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
