import type { Metadata } from "next";
import Link from "next/link";
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
          {IS_PREVIEW && <div className="preview-notice" role="note"><b>Presentation preview</b><span>Saved catalogue · No live orders or payments</span></div>}
          <Header />
          {children}
          <Footer />
          {!IS_PREVIEW && process.env.OPENAI_API_KEY ? <PartsAssistant /> : <div className="assistant-root"><Link className="assistant-launcher" href="/request-quote">Get your quote <span aria-hidden="true">↗</span></Link></div>}
        </StorefrontProvider>
      </body>
    </html>
  );
}
