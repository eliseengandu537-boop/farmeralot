import type { Metadata } from "next";
import { isAssistantDemo } from "@/lib/assistant-config";
import { IS_PREVIEW } from "@/lib/store-config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontProvider } from "@/components/StorefrontProvider";
import { PartsAssistant } from "@/components/PartsAssistant";
import { ScrollExperience } from "@/components/ScrollExperience";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./motion.css";
import "./storefront.css";
import "./assistant.css";

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
    <html lang="en-ZA" data-scroll-behavior="smooth" data-storefront-mode={IS_PREVIEW ? "preview" : "live"}>
      <body>
        <StorefrontProvider>
          <ScrollExperience />
          <Header />
          {children}
          <Footer />
          <PartsAssistant demo={isAssistantDemo()} />
        </StorefrontProvider>
      </body>
    </html>
  );
}
