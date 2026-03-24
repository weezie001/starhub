import { Button } from "../components/ui/button.jsx";

const SECTIONS = [
  { title: "1. Information We Collect", body: `We collect information you provide directly to us when you create an account, make a booking, or contact us for support. This includes your name, email address, phone number, billing information, and any other details you choose to share. We also automatically collect certain technical data when you use our Platform, including IP address, browser type, device identifiers, and usage analytics.` },
  { title: "2. How We Use Your Information", body: `StarBookNow uses the information we collect to: process and confirm your bookings; send you transactional emails and booking confirmations; provide personalized celebrity recommendations; improve our Platform and develop new features; respond to your support inquiries; comply with legal obligations; and prevent fraud and abuse on our Platform.` },
  { title: "3. Information Sharing", body: `We do not sell, rent, or trade your personal information to third parties. We share information only in the following circumstances: with the celebrity talent or their management team as required to fulfill your booking; with trusted service providers who assist us in operating our Platform (payment processors, cloud hosting, analytics); and when required by law, court order, or government authority.` },
  { title: "4. Cookies & Tracking Technologies", body: `We use cookies and similar tracking technologies to enhance your experience on the Platform. These may include session cookies (deleted when you close your browser), persistent cookies (remain for a set period), and third-party analytics cookies (such as those from Google Analytics). You can control cookie preferences through your browser settings, though disabling certain cookies may affect Platform functionality.` },
  { title: "5. Data Retention", body: `We retain your personal information for as long as your account is active or as needed to provide you services. We also retain data as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, we securely delete or anonymize it. You may request deletion of your account data at any time by contacting us.` },
  { title: "6. Data Security", body: `StarBookNow takes data security seriously. We implement industry-standard security measures, including TLS encryption for data in transit, AES-256 encryption for data at rest, regular security audits, and strict access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.` },
  { title: "7. Your Rights", body: `Depending on your jurisdiction, you may have the following rights regarding your personal data: the right to access and receive a copy of your data; the right to correct inaccurate data; the right to request deletion of your data (right to erasure); the right to object to or restrict processing; and the right to data portability. To exercise any of these rights, please contact us at privacy@starbooknow.com.` },
  { title: "8. International Transfers", body: `StarBookNow is headquartered in the United States. If you are accessing our Platform from outside the US, please be aware that your information may be transferred to, stored, and processed in the United States. We take appropriate safeguards to ensure that your data is treated in accordance with this Privacy Policy wherever it is processed.` },
  { title: "9. Children's Privacy", body: `StarBookNow does not knowingly collect personal information from individuals under the age of 18. If you become aware that a minor has provided us with personal information without parental consent, please contact us immediately. We will take steps to remove such data from our systems.` },
  { title: "10. Third-Party Links", body: `Our Platform may contain links to third-party websites or services that are not operated by StarBookNow. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit through links on our Platform.` },
  { title: "11. Changes to This Policy", body: `StarBookNow may update this Privacy Policy from time to time. We will notify you of significant changes by posting a prominent notice on our Platform or by sending you an email. Your continued use of the Platform after changes become effective constitutes acceptance of the revised Policy.` },
  { title: "12. Contact Us", body: `If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Privacy Officer at privacy@starbooknow.com. You may also write to us at StarBookNow Inc., 350 Fifth Avenue, New York, NY 10118, United States.` },
];

const HIGHLIGHTS = [
  { icon: "🔒", label: "We never sell your data" },
  { icon: "📧", label: "Minimal data collection" },
  { icon: "🛡️", label: "AES-256 encryption" },
  { icon: "✋", label: "You can delete anytime" },
];

export default function PrivacyPage({ setPage }) {
  return (
    <div className="pt-[72px] min-h-screen">
      <section className="px-5 py-20 max-w-[860px] mx-auto">

        <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3.5 uppercase">Legal</div>
        <h1 className="font-serif text-foreground font-bold leading-tight mb-3" style={{ fontSize: "clamp(32px,5vw,52px)" }}>
          Privacy Policy
        </h1>
        <p className="text-muted-foreground/60 text-[13px] mb-12">Last updated: March 24, 2026</p>

        <p className="text-muted-foreground text-[15px] leading-[2] mb-10">
          At StarBookNow, your privacy matters deeply. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform and services.
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-14">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.4)] px-4 py-5">
              <span className="text-[22px]">{h.icon}</span>
              <span className="text-foreground text-[13px] font-semibold">{h.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {SECTIONS.map((s, i) => (
            <div key={i} className="border-t border-white/8 py-8">
              <h2 className="font-serif text-foreground font-semibold text-[18px] mb-3.5">{s.title}</h2>
              <p className="text-muted-foreground text-[14px] leading-[1.9] m-0">{s.body}</p>
            </div>
          ))}
          <div className="border-t border-white/8" />
        </div>

        <div className="mt-14 rounded-2xl border border-primary/20 p-9 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: "linear-gradient(135deg, rgba(240,191,90,0.07), rgba(240,191,90,0.03))" }}>
          <div>
            <div className="font-serif text-foreground font-semibold text-[20px] mb-1.5">Have privacy concerns?</div>
            <div className="text-muted-foreground/60 text-[13px] leading-relaxed">Reach our Data Privacy Officer at privacy@starbooknow.com</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => setPage("terms")} variant="outline">Terms of Service</Button>
            <Button onClick={() => setPage("contact")}>Contact Support</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
