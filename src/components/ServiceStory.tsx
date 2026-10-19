import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { ScrollText } from "@/components/ScrollText";
import { ServiceVideo } from "@/components/ServiceVideo";

function ServicePhoto({ src, alt, caption, href, label }: { src: string; alt: string; caption: string; href: string; label: string }) {
  return (
    <Link className="service-visual service-photo-visual" href={href} aria-label={label}>
      <Image src={src} alt={alt} fill sizes="(max-width: 899px) 88vw, 70vw" />
      <div className="visual-caption"><span>{caption}</span><span aria-hidden="true">↗</span></div>
    </Link>
  );
}

export function ServiceStory() {
  return (
    <section id="our-service" className="section service-story" aria-labelledby="offer-heading">
      <div className="offer-intro">
        <div><span className="eyebrow">The Farmeralot difference</span><ScrollText id="offer-heading" lines={["More than parts.", "Made for farms."]} highlightWord="farms." /></div>
        <Reveal><p>Farmalot helps farmers and machinery operators find, order, and receive what they need. Machinery parts, everyday essentials, and a team that understands the work behind every order.</p></Reveal>
      </div>
      <div className="service-stack">
        <article className="service-panel" data-stack-panel>
          <div className="service-panel-copy">
            <span className="panel-index">01 <span>/ THE RIGHT PARTS</span></span>
            <ScrollText as="h3" lines={["Small parts.", "Big difference."]} highlightWord="difference." />
            <p>A working day depends on the details. Explore our machinery parts catalogue, or let us help source the essentials your farm needs.</p>
            <div className="service-tags"><span>Machinery parts</span><span>Farm essentials</span></div>
            <Link className="text-link" href="/shop">Find your next part <span aria-hidden="true">↗</span></Link>
          </div>
          <ServiceVideo />
        </article>
        <article className="service-panel service-panel-support" data-stack-panel>
          <div className="service-panel-copy">
            <span className="panel-index">02 <span>/ PEOPLE WHO HELP</span></span>
            <ScrollText as="h3" lines={["A real person.", "A practical answer."]} highlightWord="answer." />
            <p>A machine model, a part number, even a photo. Start with what you have and our dedicated team will help you work out what comes next.</p>
            <div className="service-tags"><span>Practical guidance</span><span>Tailored quotes</span></div>
            <Link className="text-link" href="/request-quote">Talk to our parts team <span aria-hidden="true">↗</span></Link>
          </div>
          <ServicePhoto src="/service-tractor.webp" alt="A green tractor standing in cultivated farmland at sunset" caption="YOUR MACHINE. OUR ATTENTION." href="/request-quote" label="Get help finding parts for your farm machinery" />
        </article>
        <article className="service-panel" data-stack-panel>
          <div className="service-panel-copy">
            <span className="panel-index">03 <span>/ BEYOND THE MAIN ROAD</span></span>
            <ScrollText as="h3" lines={["Your farm.", "Within reach."]} highlightWord="reach." />
            <p>Farm delivery and logistics across South Africa. We coordinate the journey from your parts list to your farm gate, so you can focus on the work ahead.</p>
            <div className="service-tags"><span>Nationwide delivery</span><span>Rural destinations</span></div>
            <Link className="text-link" href="/about">See what we offer <span aria-hidden="true">↗</span></Link>
          </div>
          <ServicePhoto src="/service-farm-truck.webp" alt="A farm truck carrying wooden crates through a rural farm gate" caption="FROM SOURCING TO YOUR FARM GATE" href="/about" label="Learn about our farm delivery service" />
        </article>
      </div>
    </section>
  );
}
