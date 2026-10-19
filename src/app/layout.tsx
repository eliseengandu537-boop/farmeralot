import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontProvider } from "@/components/StorefrontProvider";
import { PartsAssistant } from "@/components/PartsAssistant";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Farmeralot | Farm delivery, parts & essentials",
    template: "%s | Farmeralot",
  },
  description:
    "Farm delivery and logistics across South Africa. Find machinery parts, everyday farm essentials, practical support, and delivery to your farm.",
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
