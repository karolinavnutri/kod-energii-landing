import type { Metadata } from 'next';
import { Playfair_Display, Golos_Text, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const displayFont = Playfair_Display({
  variable: '--font-display',
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const golosText = Golos_Text({
  variable: '--font-sans-ui',
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-code',
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '700'],
});

export const metadata: Metadata = {
  title: 'Код Энергии — как избавиться от хронической усталости за 4 недели',
  description:
    '4 недели системной работы с четырьмя причинами хронической усталости: нервная система, ЖКТ, сахар, старение. От автора «Энергии за 7 дней».',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${golosText.variable} antialiased`}>
      <body className="bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
