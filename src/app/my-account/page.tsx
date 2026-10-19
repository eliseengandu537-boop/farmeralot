import Link from "next/link";
import { STORE_URL } from "@/lib/woocommerce";
import { IS_PREVIEW } from "@/lib/store-config";

export default function AccountPage() {
  return (
    <main className="page-shell account-page"><span className="eyebrow">Your Farmeralot account</span><h1>Welcome <em>back.</em></h1><p className="lead">{IS_PREVIEW ? "Account sign-in and order history are not connected in this presentation. You can explore the catalogue and build a quote basket without signing in." : "Sign in to view your orders and manage your account securely through the Farmeralot store."}</p><Link className="button button-copper" href="/shop">Continue shopping <span aria-hidden="true">↗</span></Link><p className="policy-note">Existing customers can <a href={`${STORE_URL}/my-account/`} target="_blank" rel="noreferrer">open their account on the live Farmeralot site ↗</a>.</p></main>
  );
}
