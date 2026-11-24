export type KycQuestion = { id: string; label: string; multi?: boolean; options: string[] };

export const KYC_QUESTIONS: KycQuestion[] = [
  { id: "occupation", label: "Vad är din huvudsakliga sysselsättning?", options: ["Anställd", "Egenföretagare", "Student", "Pensionär", "Arbetssökande", "Annat"] },
  { id: "income", label: "Vilken är din månadsinkomst före skatt?", options: ["0–20 000 kr/mån", "20 000–40 000 kr/mån", "40 000–60 000 kr/mån", "60 000–100 000 kr/mån", "Över 100 000 kr/mån"] },
  { id: "origin", label: "Varifrån kommer pengarna du sätter in?", multi: true, options: ["Lön", "Pension", "Sparande", "Arv/gåva", "Försäljning av bostad", "Företagsverksamhet", "Annat"] },
  { id: "purpose", label: "Vad är syftet med ditt sparande?", multi: true, options: ["Långsiktigt sparande", "Pension", "Aktiv handel", "Sparande till barn", "Bostadsköp", "Annat"] },
  { id: "deposits", label: "Hur mycket planerar du att sätta in per år?", options: ["Under 100 000 kr/år", "100 000–500 000 kr/år", "500 000–1 000 000 kr/år", "Över 1 000 000 kr/år"] },
  { id: "pep", label: "Är du, eller har du varit, en person i politiskt utsatt ställning (PEP) eller nära familjemedlem/medarbetare till en sådan?", options: ["Nej", "Ja"] },
  { id: "usPerson", label: "Är du skattskyldig i USA (amerikansk medborgare eller bosatt i USA)?", options: ["Nej", "Ja"] },
  { id: "taxCountry", label: "Vilket land har du skatterättslig hemvist i?", options: ["Sverige", "Annat land"] },
];

export function validateKyc(answers: Record<string, string | string[]>): string | null {
  for (const q of KYC_QUESTIONS) {
    const a = answers[q.id];
    if (!a || (Array.isArray(a) && a.length === 0)) return `Svara på: ${q.label}`;
    const vals = Array.isArray(a) ? a : [a];
    if (vals.some((v) => !q.options.includes(v))) return `Ogiltigt svar på: ${q.label}`;
  }
  return null;
}
