import { G } from "../lib/tokens.js";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using StraBook ("Platform", "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any updated Terms.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 18 years of age to use StraBook. By using the Platform, you represent and warrant that you meet this requirement and that you have the full legal authority to enter into these Terms. Accounts created on behalf of a business or organization must be authorized by that entity.`,
  },
  {
    title: "3. User Accounts",
    body: `You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify StraBook immediately of any unauthorized use of your account. StraBook will not be liable for any loss or damage arising from your failure to protect your account information.`,
  },
  {
    title: "4. Booking Services",
    body: `StraBook acts as an intermediary platform that facilitates bookings between clients and celebrity talent. All bookings are subject to the individual availability and approval of the talent. StraBook does not guarantee the availability of any celebrity listed on the Platform. Booking confirmation is only final when you receive a written confirmation from StraBook.`,
  },
  {
    title: "5. Payments & Fees",
    body: `All prices displayed on the Platform are in US Dollars unless otherwise stated. A non-refundable platform service fee applies to all bookings. Full payment is required to secure a booking unless a specific installment plan has been agreed upon in writing. StraBook uses industry-standard encryption for all payment processing.`,
  },
  {
    title: "6. Cancellations & Refunds",
    body: `Cancellations made more than 30 days before a booked event may be eligible for a partial refund, minus the platform service fee. Cancellations within 30 days of the event are non-refundable. In the event that a celebrity cancels due to circumstances outside their control (force majeure), StraBook will work with you to find an alternative or issue a credit.`,
  },
  {
    title: "7. Prohibited Conduct",
    body: `You agree not to: misrepresent your identity or the purpose of a booking; use the Platform for any unlawful purpose; attempt to contact or solicit talent directly outside of the StraBook Platform; scrape, copy, or redistribute Platform content without express written consent; or introduce malware or disruptive code to the Platform.`,
  },
  {
    title: "8. Intellectual Property",
    body: `All content on the StraBook Platform — including but not limited to text, graphics, logos, and software — is the property of StraBook or its licensors and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    title: "9. Limitation of Liability",
    body: `To the fullest extent permitted by law, StraBook shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data, arising from your use of the Platform or any booking made through it. Our total liability to you shall not exceed the amount paid by you to StraBook in the three months preceding the claim.`,
  },
  {
    title: "10. Governing Law",
    body: `These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.`,
  },
  {
    title: "11. Contact",
    body: `If you have any questions about these Terms, please contact our legal team at legal@strabook.io or write to us at StraBook Inc., 350 Fifth Avenue, New York, NY 10118, United States.`,
  },
];

export default function TermsPage({ setPage }) {
  return (
    <div style={{ paddingTop: 72, minHeight: "100vh" }}>
      <section style={{ padding: "80px 40px", maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ color: G.gold, fontSize: 11, letterSpacing: 3, fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
          Legal
        </div>
        <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontFamily: G.serif, color: G.cream, margin: "0 0 12px", fontWeight: 700, lineHeight: 1.1 }}>
          Terms of Service
        </h1>
        <p style={{ color: G.dim, fontSize: 13, marginBottom: 48 }}>
          Last updated: March 24, 2026
        </p>

        <p style={{ color: G.muted, fontSize: 15, lineHeight: 2, marginBottom: 52 }}>
          Please read these Terms of Service carefully before using the StraBook platform. These Terms govern your access to and use of our website, services, and celebrity booking platform.
        </p>

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

          {/* Bottom border */}
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
              Questions about our Terms?
            </div>
            <div style={{ color: G.dim, fontSize: 13, lineHeight: 1.7 }}>
              Our legal and support team is ready to help you understand your rights.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("privacy")}
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
              Privacy Policy
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
