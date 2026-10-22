const WHATSAPP_NUMBER = "27836303818";
const WHATSAPP_DISPLAY = "+27 83 630 3818";

export function WhatsAppLink({
  message = "Hi Farmeralot, please help me find a product.",
}: {
  message?: string;
}) {
  return (
    <a
      className="whatsapp-contact"
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z" />
        <path d="m8.5 7.5 1.3 2.6-1 1.1a10 10 0 0 0 4.5 4.1l1-1.2 2.6 1.2c-.2 1.7-1.4 2.2-2.8 1.8-3.5-1-6.6-4-7.5-7.1-.4-1.3.2-2.4 1.9-2.5Z" />
      </svg>
      <span><strong>Get in chat with us</strong><small>WhatsApp · {WHATSAPP_DISPLAY}</small></span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
