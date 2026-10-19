import Link from "next/link";
import Image from "next/image";
import { SALES_EMAIL } from "@/lib/store-config";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <Image className="brand-logo" src="/catalogue/farmeralot-logo.webp" alt="Farmeralot" width={220} height={95} />
          </Link>
          <p>Farm delivery and logistics for machinery parts and everyday essentials, delivered to farms around South Africa.</p>
        </div>
        <div className="footer-links">
          <p className="footer-label">Explore</p>
          <Link href="/shop">Shop parts</Link>
          <Link href="/about">Our story</Link>
          <Link href="/request-quote">Request a quote</Link>
          <Link href="/my-account">My account</Link>
        </div>
        <div className="footer-links">
          <p className="footer-label">Customer care</p>
          <Link href="/warranty-policy">Warranty</Link>
          <Link href="/refund_policy">Refund policy</Link>
          <Link href="/terms-of-service">Terms of service</Link>
          <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL} ↗</a>
        </div>
        <div className="footer-note">
          <span className="eyebrow">Built for the field</span>
          <p>From the workshop to the farthest farm gate, we help you find the right part.</p>
          <Link className="text-link" href="/shop">Find your part <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Farmeralot. All rights reserved.</span>
        <span>South Africa · ZAR</span>
      </div>
    </footer>
  );
}
