"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useStorefront } from "@/components/StorefrontProvider";
import { STORE_URL } from "@/lib/woocommerce";

export function Header() {
  const { cart } = useStorefront();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement">
        <span>Fast parts. Less downtime.</span>
        <span className="announcement-detail">Delivery across South Africa</span>
      </div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Farmeralot home">
          <Image className="brand-logo" src={`${STORE_URL}/wp-content/uploads/2024/11/Farmeralot-Logos_FARMALOT_-FC-_-LOGO-ON-BLACK-06-2-1-e1731861053463.png`} alt="Farmeralot" width={220} height={95} priority />
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className={`main-nav${menuOpen ? " is-open" : ""}`}>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop parts</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>Our story</Link>
          <Link href="/request-quote" onClick={() => setMenuOpen(false)}>Get a quote</Link>
        </nav>
        <div className="header-actions">
          <form action="/shop" className="header-search">
            <label className="visually-hidden" htmlFor="header-search">Search parts</label>
            <input id="header-search" type="search" name="search" placeholder="Find a part or SKU" />
            <button aria-label="Search" type="submit">⌕</button>
          </form>
          <Link className="cart-link" href="/cart" aria-label={`Cart with ${cart?.items_count ?? 0} items`}>
            <span className="cart-icon" aria-hidden="true">Bag</span>
            <span className="cart-count">{cart?.items_count ?? 0}</span>
          </Link>
        </div>
      </header>
    </>
  );
}
