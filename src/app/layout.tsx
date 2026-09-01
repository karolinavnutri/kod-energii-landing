import type { Metadata } from 'next';
import { Literata, Golos_Text } from 'next/font/google';
import './globals.css';

const literata = Literata({
  variable: '--font-literata',
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
});

const golosText = Golos_Text({
  variable: '--font-golos',
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Код Энергии — курс о том, что на самом деле забирает твою энергию',
  description:
    '4 недели системной работы с четырьмя причинами хронической усталости: нервная система, ЖКТ, сахар, старение. От автора «Энергии за 7 дней».',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${literata.variable} ${golosText.variable} antialiased`}>
      <body className="bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
