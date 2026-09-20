import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="section">
      <div className="contact-hero">
        <span className="pill" style={{ marginBottom: 20 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          GET IN TOUCH
        </span>
        <h1>
          Let&apos;s <span className="grad">talk</span>.
        </h1>
        <p>Have a question, want to partner with us, or apply for a position? We&apos;re here to help.</p>
      </div>

      <div className="contact-grid">
        {/* Email */}
        <div className="contact-card">
          <div className="contact-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>
          <h3>Email</h3>
          <a href="mailto:nexthire.rec@gmail.com">nexthire.rec@gmail.com</a>
          <div className="sub">We usually reply within 24 hours.</div>
        </div>

        {/* Phone */}
        <div className="contact-card">
          <div className="contact-icon">
            <svg viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h3>Phone</h3>
          <a href="tel:+201069731664">01069731664</a>
          <a href="tel:+201028431835">01028431835</a>
          <div className="sub">Sun–Thu, 10am – 6pm</div>
        </div>

        {/* Location */}
        <div className="contact-card">
          <div className="contact-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3>Location</h3>
          <p>Cairo, Egypt</p>
          <div className="sub">Serving all over Egypt.</div>
        </div>

        {/* WhatsApp */}
        <div className="contact-card">
          <div className="contact-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <h3>WhatsApp</h3>
          <a href="https://wa.me/201069731664" target="_blank" rel="noopener noreferrer">
            01069731664
          </a>
          <a href="https://wa.me/201028431835" target="_blank" rel="noopener noreferrer">
            01028431835
          </a>
          <div className="sub">Chat with us directly.</div>
        </div>
      </div>

      <div className="contact-cta">
        <Link href="/apply" className="btn btn-primary btn-lg">
          Apply Now →
        </Link>
      </div>
    </div>
  );
}