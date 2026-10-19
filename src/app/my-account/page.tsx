import Link from "next/link";
import { STORE_URL } from "@/lib/woocommerce";

export default function AccountPage() {
  return (
    <main className="page-shell account-page"><span className="eyebrow">Your Farmeralot account</span><h1>Welcome <em>back.</em></h1><p className="lead">Sign in to view your orders and manage your account securely through the existing WooCommerce store.</p><a className="button button-copper" href={`${STORE_URL}/my-account/`}>Open my account <span aria-hidden="true">↗</span></a><p className="policy-note">Account login and order history stay with the secure Farmeralot store.</p><Link className="text-link" href="/shop">Continue shopping <span aria-hidden="true">↗</span></Link></main>
  );
}
