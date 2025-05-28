import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SponsorsProvider } from "./contexts/SponsorsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ReactNode } from "react";
import LayoutWrapper from "./layoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Axis Sponsor Hub",
  description: "Manage in-app sponors for the Axis app",
  icons: {
    icon: '/AxisLogo.jpg',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SponsorsProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </SponsorsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}