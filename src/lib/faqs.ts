export interface Faq {
  question: string;
  answer: string;
}

export const MAX_FAQS = 30;

/** Normalises untrusted input into a clean FAQ list (drops incomplete entries). */
export function sanitizeFaqs(input: unknown): Faq[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((f) => ({
      question: String((f as Faq)?.question ?? "").trim().slice(0, 300),
      answer: String((f as Faq)?.answer ?? "").trim().slice(0, 3000),
    }))
    .filter((f) => f.question && f.answer)
    .slice(0, MAX_FAQS);
}

/** schema.org FAQPage JSON-LD for a post's FAQs (embed in a <script type="application/ld+json">). */
export function faqJsonLd(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
