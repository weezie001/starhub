import { G } from "../lib/tokens.js";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us when you create an account, make a booking, or contact us for support. This includes your name, email address, phone number, billing information, and any other details you choose to share. We also automatically collect certain technical data when you use our Platform, including IP address, browser type, device identifiers, and usage analytics.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `StraBook uses the information we collect to: process and confirm your bookings; send you transactional emails and booking confirmations; provide personalized celebrity recommendations; improve our Platform and develop new features; respond to your support inquiries; comply with legal obligations; and prevent fraud and abuse on our Platform.`,
  },
  {
    title: "3. Information Sharing",
    body: `We do not sell, rent, or trade your personal information to third parties. We share information only in the following circumstances: with the celebrity talent or their management team as required to fulfill your booking; with trusted service providers who assist us in operating our Platform (payment processors, cloud hosting, analytics); and when required by law, court order, or government authority.`,
  },
  {
    title: "4. Cookies & Tracking Technologies",
    body: `We use cookies and similar tracking technologies to enhance your experience on the Platform. These may include session cookies (deleted when you close your browser), persistent cookies (remain for a set period), and third-party analytics cookies (such as those from Google Analytics). You can control cookie preferences through your browser settings, though disabling certain cookies may affect Platform functionality.`,
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal information for as long as your account is active or as needed to provide you services. We also retain data as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it. You may request deletion of your account data at any time by contacting us.`,
  },
  {
    title: "6. Data Security",
    body: `StraBook takes data security seriously. We implement industry-standard security measures, including TLS encryption for data in transit, AES-256 encryption for data at rest, regular security audits, and strict access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "7. Your Rights",
    body: `Depending on your jurisdiction, you may have the following rights regarding your personal data: the right to access and receive a copy of your data; the right to correct inaccurate data; the right to request deletion of your data (right to erasure); the right to object to or restrict processing; and the right to data portability. To exercise any of these rights, please contact us at privacy@strabook.io.`,
  },
  {
    title: "8. International Transfers",
    body: `StraBook is headquartered in the United States. If you are accessing our Platform from outside the US, please be aware that your information may be transferred to, stored, and processed in the United States. We take appropriate safeguards to ensure that your data is treated in accordance with this Privacy Policy wherever it is processed.`,
  },
  {
    title: "9. Children's Privacy",
    body: `StraBook does not knowingly collect personal information from individuals under the age of 18. If you become aware that a minor has provided us with personal information without parental consent, please contact us immediately. We will take steps to remove such data from our systems.`,
  },
  {
    title: "10. Third-Party Links",
    body: `Our Platform may contain links to third-party websites or services that are not operated by StraBook. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit through links on our Platform.`,
  },
  {
    title: "11. Changes to This Policy",
    body: `StraBook may update this Privacy Policy from time to time. We will notify you of significant changes by posting a prominent notice on our Platform or by sending you an email. Your continued use of the Platform after changes become effective constitutes acceptance of the revised Policy.`,
  },
  {
    title: "12. Contact Us",
    body: `If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Privacy Officer at privacy@strabook.io. You may also write to us at StraBook Inc., 350 Fifth Avenue, New York, NY 10118, United States.`,
  },
];

const HIGHLIGHTS = [
  { icon: "🔒", label: "We never sell your data" },
  { icon: "📧", label: "Minimal data collection" },
  { icon: "🛡️", label: "AES-256 encryption" },
  { icon: "✋", label: "You can delete anytime" },
];

export default function PrivacyPage({ setPage }) {
  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      <section style={{ padding: "80px 40px", maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
          Legal
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontFamily: G.serif, color: G.cream, margin: "0 0 12px", fontWeight: 700, lineHeight: 1.1 }}>
          Privacy Policy
        </h1>
        <p style={{ color: G.dim, fontSize: 13, marginBottom: 48 }}>
          Last updated: March 24, 2026
        </p>

        <p style={{ color: G.muted, fontSize: 15, lineHeight: 2, marginBottom: 40 }}>
          At StraBook, your privacy matters deeply. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform and services.
        </p>

        {/* Highlights */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 52,
        }}>
          {HIGHLIGHTS.map(h => (
            <div key={h.label} style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: 12,
              padding: "20px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>{h.icon}</span>
              <span style={{ color: G.cream, fontSize: 13, fontWeight: 600 }}>{h.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SECTIONS.map((s, i) => (
            <div
              key={i}
              style={{
                borderTop: `1px solid ${G.border}`,
                padding: "32px 0",
              }}
            >
              <h2 style={{
                color: G.cream,
                fontFamily: G.serif,
                fontSize: 18,
                fontWeight: 600,
                margin: "0 0 14px",
              }}>
                {s.title}
              </h2>
              <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.9, margin: 0 }}>
                {s.body}
              </p>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${G.border}` }} />
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 56,
          background: `linear-gradient(135deg, ${G.gold}12, ${G.gold}06)`,
          border: `1px solid ${G.gold}22`,
          borderRadius: 16,
          padding: "36px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{ color: G.cream, fontFamily: G.serif, fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              Have privacy concerns?
            </div>
            <div style={{ color: G.dim, fontSize: 13, lineHeight: 1.7 }}>
              Reach our Data Privacy Officer at privacy@strabook.io
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("terms")}
              style={{
                background: "transparent",
                color: G.gold,
                border: `1px solid ${G.gold}50`,
                borderRadius: 50,
                padding: "12px 24px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: G.sans,
                letterSpacing: 0.6,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = G.gold + "18"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setPage("contact")}
              style={{
                background: `linear-gradient(45deg, ${G.gold}, ${G.goldD})`,
                color: "#261900",
                border: "none",
                borderRadius: 50,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: G.sans,
                letterSpacing: 0.6,
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
