import { Button } from "../components/ui/button.jsx";

const SECTIONS = [
  { title: "1. Acceptance of Terms", body: `By accessing or using StarBookNow ("Platform", "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any updated Terms.` },
  { title: "2. Eligibility", body: `You must be at least 18 years of age to use StarBookNow. By using the Platform, you represent and warrant that you meet this requirement and that you have the full legal authority to enter into these Terms. Accounts created on behalf of a business or organization must be authorized by that entity.` },
  { title: "3. User Accounts", body: `You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify StarBookNow immediately of any unauthorized use of your account. StarBookNow will not be liable for any loss or damage arising from your failure to protect your account information.` },
  { title: "4. Booking Services", body: `StarBookNow acts as an intermediary platform that facilitates bookings between clients and celebrity talent. All bookings are subject to the individual availability and approval of the talent. StarBookNow does not guarantee the availability of any celebrity listed on the Platform. Booking confirmation is only final when you receive a written confirmation from StarBookNow.` },
  { title: "5. Payments & Fees", body: `All prices displayed on the Platform are in US Dollars unless otherwise stated. A non-refundable platform service fee applies to all bookings. Full payment is required to secure a booking unless a specific installment plan has been agreed upon in writing. StarBookNow uses industry-standard encryption for all payment processing.` },
  { title: "6. Cancellations & Refunds", body: `Cancellations made more than 30 days before a booked event may be eligible for a partial refund, minus the platform service fee. Cancellations within 30 days of the event are non-refundable. In the event that a celebrity cancels due to circumstances outside their control (force majeure), StarBookNow will work with you to find an alternative or issue a credit.` },
  { title: "7. Prohibited Conduct", body: `You agree not to: misrepresent your identity or the purpose of a booking; use the Platform for any unlawful purpose; attempt to contact or solicit talent directly outside of the StarBookNow Platform; scrape, copy, or redistribute Platform content without express written consent; or introduce malware or disruptive code to the Platform.` },
  { title: "8. Intellectual Property", body: `All content on the StarBookNow Platform — including but not limited to text, graphics, logos, and software — is the property of StarBookNow or its licensors and is protected under applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.` },
  { title: "9. Limitation of Liability", body: `To the fullest extent permitted by law, StarBookNow shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data, arising from your use of the Platform or any booking made through it. Our total liability to you shall not exceed the amount paid by you to StarBookNow in the three months preceding the claim.` },
  { title: "10. Governing Law", body: `These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.` },
  { title: "11. Contact", body: `If you have any questions about these Terms, please contact our legal team at legal@starbooknow.com or write to us at StarBookNow Inc., 350 Fifth Avenue, New York, NY 10118, United States.` },
];

export default function TermsPage({ setPage }) {
  return (
    <div className="pt-[72px] min-h-screen">
      <section className="px-5 py-20 max-w-[860px] mx-auto">

        <div className="text-primary text-[11px] tracking-[3px] font-bold mb-3.5 uppercase">Legal</div>
        <h1 className="font-serif text-foreground font-bold leading-tight mb-3" style={{ fontSize: "clamp(32px,5vw,52px)" }}>
          Terms of Service
        </h1>
        <p className="text-muted-foreground/60 text-[13px] mb-12">Last updated: March 24, 2026</p>

        <p className="text-muted-foreground text-[15px] leading-[2] mb-14">
          Please read these Terms of Service carefully before using the StarBookNow platform. These Terms govern your access to and use of our website, services, and celebrity booking platform.
        </p>

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
            <div className="font-serif text-foreground font-semibold text-[20px] mb-1.5">Questions about our Terms?</div>
            <div className="text-muted-foreground/60 text-[13px] leading-relaxed">Our legal and support team is ready to help you understand your rights.</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => setPage("privacy")} variant="outline">Privacy Policy</Button>
            <Button onClick={() => setPage("contact")}>Contact Support</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
