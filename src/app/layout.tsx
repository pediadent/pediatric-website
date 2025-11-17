import type { Metadata } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pediatric Dentist in Queens, NY - Expert Child Dental Care",
  description: "Find the best pediatric dentists in Queens, NY. Comprehensive directory with reviews, services, and expert dental care for children.",
  keywords: "pediatric dentist, Queens NY, children dentist, dental care, kids dentist",
  authors: [{ name: "Pediatric Dentist Queens NY" }],
  creator: "Pediatric Dentist Queens NY",
  publisher: "Pediatric Dentist Queens NY",
  robots: "index, follow",
  metadataBase: new URL('https://pediatricdentistinqueensny.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pediatricdentistinqueensny.com',
    title: 'Pediatric Dentist in Queens, NY - Expert Child Dental Care',
    description: 'Find the best pediatric dentists in Queens, NY. Comprehensive directory with reviews, services, and expert dental care for children.',
    siteName: 'Pediatric Dentist Queens NY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pediatric Dentist in Queens, NY - Expert Child Dental Care',
    description: 'Find the best pediatric dentists in Queens, NY. Comprehensive directory with reviews, services, and expert dental care for children.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${openSans.variable} ${poppins.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
