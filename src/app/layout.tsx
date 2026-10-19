import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontProvider } from "@/components/StorefrontProvider";
import { PartsAssistant } from "@/components/PartsAssistant";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Farmeralot | Parts that keep you moving",
    template: "%s | Farmeralot",
  },
  description:
    "Find dependable agricultural and machinery parts with expert support and delivery across South Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <body>
        <StorefrontProvider>
          <Header />
          {children}
          <Footer />
          <PartsAssistant />
        </StorefrontProvider>
      </body>
    </html>
  );
}
