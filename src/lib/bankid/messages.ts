/**
 * User messages for BankID hint codes (Swedish), following the BankID
 * relying-party guidelines (RFA codes).
 */
export type HintCode =
  | "outstandingTransaction"
  | "noClient"
  | "started"
  | "userMrtd"
  | "userCallConfirm"
  | "userSign"
  | "expiredTransaction"
  | "certificateErr"
  | "userCancel"
  | "cancelled"
  | "startFailed"
  | "userDeclinedCall"
  | "notSupportedByUserApp"
  | "transactionRiskBlocked"
  | "alreadyInProgress"
  | "requestTimeout"
  | "maintenance"
  | "internalError"
  | "unknown";

const RFA: Record<string, string> = {
  RFA1: "Starta BankID-appen.",
  RFA2: "Du har inte BankID-appen installerad. Kontakta din bank.",
  RFA3: "Åtgärden avbruten. Försök igen.",
  RFA4: "En identifiering eller underskrift för det här personnumret är redan påbörjad. Försök igen.",
  RFA5: "Internt tekniskt fel. Försök igen.",
  RFA6: "Åtgärden avbruten.",
  RFA8: "BankID-appen svarar inte. Kontrollera att den är startad och att du har internetanslutning. Försök sedan igen.",
  RFA9: "Skriv in din säkerhetskod i BankID-appen och välj Identifiera eller Skriv under.",
  RFA13: "Försöker starta BankID-appen.",
  RFA15: "Söker efter BankID, det kan ta en liten stund … Om det har gått några sekunder och inget BankID har hittats har du sannolikt inget BankID som går att använda för den aktuella identifieringen/underskriften i den här enheten.",
  RFA16: "Det BankID du försöker använda är för gammalt eller spärrat. Använd ett annat BankID eller skaffa ett nytt hos din bank.",
  RFA17: "Misslyckades att läsa av QR-koden. Starta BankID-appen och läs av QR-koden. Kontrollera att BankID-appen är uppdaterad. Om du inte har BankID-appen måste du installera den och skaffa ett BankID hos din bank.",
  RFA19: "Vill du identifiera dig eller skriva under med BankID på den här datorn eller med ett Mobilt BankID?",
  RFA21: "Identifiering eller underskrift pågår.",
  RFA22: "Okänt fel. Försök igen.",
  RFA23: "Fotografera och läs av din ID-handling med BankID-appen.",
};

export function messageFor(
  status: "pending" | "failed" | "complete",
  hintCode: string | null | undefined,
  opts: { qr: boolean; intent: "auth" | "sign" },
): string {
  if (status === "complete") return opts.intent === "auth" ? "Identifieringen lyckades." : "Underskriften lyckades.";
  if (status === "pending") {
    switch (hintCode) {
      case "outstandingTransaction":
      case "noClient":
        return opts.qr ? "Starta BankID-appen och läs av QR-koden." : RFA.RFA13;
      case "started":
        return opts.qr ? RFA.RFA15 : RFA.RFA15;
      case "userMrtd":
        return RFA.RFA23;
      case "userSign":
        return RFA.RFA9;
      case "userCallConfirm":
        return "Bekräfta samtalet i BankID-appen.";
      default:
        return RFA.RFA21;
    }
  }
  switch (hintCode) {
    case "expiredTransaction":
      return RFA.RFA8;
    case "certificateErr":
      return RFA.RFA16;
    case "userCancel":
      return RFA.RFA6;
    case "cancelled":
      return RFA.RFA3;
    case "startFailed":
      return RFA.RFA17;
    case "alreadyInProgress":
      return RFA.RFA4;
    case "requestTimeout":
    case "maintenance":
    case "internalError":
      return RFA.RFA5;
    default:
      return RFA.RFA22;
  }
}
