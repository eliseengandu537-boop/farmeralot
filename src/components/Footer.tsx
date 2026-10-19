import Link from "next/link";
import Image from "next/image";
import { STORE_URL } from "@/lib/woocommerce";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <Image className="brand-logo" src={`${STORE_URL}/wp-content/uploads/2024/11/Farmeralot-Logos_FARMALOT_-FC-_-LOGO-ON-BLACK-06-2-1-e1731861053463.png`} alt="Farmeralot" width={220} height={95} />
          </Link>
          <p>Reliable parts for the machines that keep your farm moving.</p>
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
          <a href="mailto:eliseenweb@gmail.com">eliseenweb@gmail.com ↗</a>
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
