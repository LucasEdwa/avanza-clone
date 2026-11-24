import type { PageDef } from "./types";

const join = "/logga-in?ny=1";

export const LAR: Record<string, PageDef> = {
  skolan: {
    title: "Spira-skolan",
    lead: "Korta, raka lektioner om sparande och investeringar. Välj ett ämne och lär dig i din egen takt.",
    art: "book",
    risk: true,
    blocks: [
      {
        type: "features",
        cols: 4,
        items: [
          { icon: "chart", title: "Aktier", text: "Vad en aktie är, hur kursen sätts och hur du värderar bolag.", href: "/info/aktier" },
          { icon: "growth", title: "Fonder", text: "Indexfonder, aktiva fonder, avgifter och risknivåer.", href: "/info/fonder" },
          { icon: "rocket", title: "Sparstrategi", text: "Tidshorisont, riskspridning och ombalansering." },
          { icon: "coins", title: "Privatekonomi", text: "Buffert, budget och lån." },
          { icon: "leaf", title: "Spara hållbart", text: "Så hittar du hållbara placeringar.", href: "/info/hallbart" },
          { icon: "pension", title: "Pension", text: "Allmän pension, tjänstepension och eget sparande.", href: "/info/pensionsspara" },
          { icon: "percent", title: "Börshandlade produkter", text: "ETF:er, certifikat och warranter.", href: "/info/borshandlade-produkter" },
          { icon: "calendar", title: "Börsintroduktioner", text: "Så tecknar du aktier i en notering.", href: "/info/emissioner" },
          { icon: "briefcase", title: "Skatt & deklaration", text: "ISK, KF, AF och K4.", href: "/min-ekonomi/skatt" },
          { icon: "shield", title: "Derivat", text: "Optioner och terminer från grunden.", href: "/info/optioner" },
          { icon: "globe", title: "Räntebärande", text: "Obligationer och räntefonder.", href: "/info/obligationer" },
          { icon: "book", title: "Ordlista", text: "Alla begrepp från A till Ö." },
        ],
      },
      {
        type: "steps",
        title: "Sju steg mot att bli en bättre sparare",
        items: [
          { title: "Bygg en buffert", text: "Ha tre månadslöner på sparkonto innan du investerar." },
          { title: "Bestäm målet", text: "Vad sparar du till och när behöver du pengarna?" },
          { title: "Välj konto", text: "ISK passar de flesta för långsiktigt sparande." },
          { title: "Sprid riskerna", text: "En global indexfond är en bra grund." },
          { title: "Spara regelbundet", text: "Månadssparande jämnar ut köpkursen över tid." },
          { title: "Håll nere avgifterna", text: "Varje tiondels procent spelar roll över tid." },
          { title: "Ha tålamod", text: "Sälj inte i panik när marknaden faller." },
        ],
      },
    ],
  },
  podden: {
    title: "Spirapodden",
    lead: "En podd om börsen, sparande och privatekonomi. Nya avsnitt varje torsdag.",
    art: "phone",
    blocks: [
      {
        type: "cards",
        title: "Senaste avsnitten",
        items: [
          { tag: "Avsnitt 112", title: "Räntorna och bostadsmarknaden", text: "Vad betyder räntebesked för ditt bolån och din portfölj?", href: "/info/podden" },
          { tag: "Avsnitt 111", title: "Så väljer du indexfond", text: "Avgift, index och valutor – vad spelar egentligen roll?", href: "/info/podden" },
          { tag: "Avsnitt 110", title: "Rapportsäsongen i korthet", text: "Vinnare och förlorare bland storbolagen.", href: "/info/podden" },
          { tag: "Avsnitt 109", title: "Pension i 30-årsåldern", text: "Därför lönar det sig att börja tidigt.", href: "/info/podden" },
          { tag: "Avsnitt 108", title: "Utdelningsaktier", text: "Hög direktavkastning – möjlighet eller fälla?", href: "/info/podden" },
          { tag: "Avsnitt 107", title: "Hävstång på börsen", text: "Hur fungerar certifikat och belåning?", href: "/info/podden" },
        ],
      },
    ],
  },
  fragor: {
    title: "Frågor om pengar",
    lead: "Raka svar på vanliga frågor om sparande, lån och ekonomi.",
    art: "book",
    blocks: [{ type: "widget", widget: "faq-search" }],
  },
  bloggar: {
    title: "Våra bloggar",
    lead: "Våra sparekonomer skriver om marknaden, skatter och privatekonomi.",
    art: "book",
    blocks: [
      {
        type: "cards",
        title: "Senaste inläggen",
        items: [
          { tag: "Marknad", title: "Veckans marknadskommentar", text: "Vad drev börsen den här veckan och vad händer framåt?", href: "/borsen-idag" },
          { tag: "Skatt", title: "Skattetips inför deklarationen", text: "Så hittar du underlaget för ISK och K4.", href: "/min-ekonomi/skatt" },
          { tag: "Räntor", title: "Räntefonder när räntan faller", text: "Därför kan korta och långa räntefonder bete sig olika.", href: "/marknad/fonder" },
          { tag: "Pension", title: "Tre misstag med tjänstepensionen", text: "Vanliga fel och hur du undviker dem.", href: "/info/tjanstepension" },
          { tag: "Fonder", title: "Billigaste globalfonderna", text: "Vi jämför avgifter och spårningsfel.", href: "/marknad/fonder/lista?kategori=global&sort=fee" },
          { tag: "Bolån", title: "Rörligt eller bundet?", text: "Hur du kan tänka kring bindningstid.", href: "/info/jamfor-bolan" },
        ],
      },
    ],
  },
  "kom-igang": {
    title: "Kom igång med ditt sparande idag",
    lead: "Oavsett om du vill ha hjälp med allt eller välja själv finns det ett enkelt första steg.",
    art: "rocket",
    cta: { label: "Bli kund", href: join },
    risk: true,
    blocks: [
      {
        type: "features",
        title: "Våra sparverktyg",
        cols: 3,
        items: [
          { icon: "rocket", title: "Låt Autopilot göra allt", text: "Välj risknivå så sköter vi resten.", href: "/info/autopilot" },
          { icon: "chart", title: "Gör det mesta själv", text: "Välj fonder och aktier med våra listor.", href: "/marknad/fonder" },
          { icon: "calendar", title: "Bara sätta in pengar?", text: "Starta ett månadssparande.", href: "/info/manadsspara" },
          { icon: "coins", title: "Bygg en buffert", text: "Börja med ett sparkonto.", href: "/info/sparkonto" },
          { icon: "book", title: "Spira-skolan", text: "Lär dig grunderna.", href: "/info/skolan" },
          { icon: "globe", title: "Fler länkar", text: "Prislista, öppettider och kundservice.", href: "/info/prislista" },
        ],
      },
      { type: "widget", title: "Tre steg till ditt första sparande", widget: "steps" },
    ],
  },
  produktnyheter: {
    title: "Produktnyheter",
    lead: "Det senaste vi har lanserat i Spira.",
    art: "rocket",
    blocks: [
      {
        type: "news",
        title: "Nytt i Spira",
        items: [
          { date: "2026-11-24", title: "Nytt: Börsen idag", text: "Index, räntor, råvaror, valutor, vinnare och förlorare samlat på en sida.", href: "/borsen-idag" },
          { date: "2026-11-24", title: "Nytt: Aktiescreener", text: "Filtrera aktier på bransch, land, P/E, börsvärde, utveckling och direktavkastning.", href: "/marknad/aktier/screener" },
          { date: "2026-11-24", title: "Nytt: fondlistan med flikar", text: "Se fonder efter utveckling, avgifter, fondinfo och handelsinfo.", href: "/marknad/fonder/lista" },
          { date: "2026-11-24", title: "Bolånekalkylator", text: "Räkna ut hur mycket du kan låna utifrån inkomst, utgifter och andra lån.", href: "/info/lanelofte" },
          { date: "2026-11-20", title: "Kursvarningar med notiser", text: "Få en notis när en aktie passerar en nivå du valt.", href: "/kursvarningar" },
          { date: "2026-11-18", title: "Mörkt läge", text: "Byt tema under Profil.", href: "/profil" },
          { date: "2026-11-15", title: "K4-underlag", text: "Realiserade vinster och förluster för aktie- & fondkonto.", href: "/min-ekonomi/skatt" },
          { date: "2026-11-12", title: "BankID med animerad QR-kod", text: "Snabbare och säkrare inloggning.", href: "/logga-in" },
        ],
      },
    ],
  },
  kundservice: {
    title: "Frågor och svar",
    lead: "Sök bland vanliga frågor eller kontakta oss.",
    art: "handshake",
    blocks: [{ type: "widget", widget: "faq-search" }],
  },
  marknadsnytt: { title: "Marknadsnytt", lead: "Det senaste från Stockholmsbörsen och världens marknader.", art: "chart", cta: { label: "Börsen idag", href: "/borsen-idag" }, blocks: [{ type: "widget", widget: "market-news" }] },
  nyheter: { title: "Nyheter", lead: "Nyheter om bolag, ekonomi och räntor.", art: "globe", blocks: [{ type: "widget", widget: "news" }] },
  isk: {
    title: "Investeringssparkonto (ISK)",
    lead: "Spara i aktier och fonder utan att deklarera affärer. Du betalar en låg schablonskatt.",
    art: "growth",
    cta: { label: "Öppna ISK", href: join },
    risk: true,
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "percent", title: "Schablonskatt", text: "Skatten baseras på kontots värde, inte på vinsten." }, { icon: "shield", title: "Skattefritt grundbelopp", text: "De första 300 000 kr är skattefria från 2026." }, { icon: "move", title: "Fria uttag", text: "Ta ut pengar när du vill." }] },
      { type: "text", title: "När passar ISK?", paragraphs: ["När du förväntar dig högre avkastning än schablonräntan, vilket historiskt gäller för aktier och aktiefonder på lång sikt."] },
    ],
  },
  kf: {
    title: "Kapitalförsäkring (KF)",
    lead: "Beskattas som ISK men är en försäkring: du kan ange förmånstagare.",
    art: "umbrella",
    cta: { label: "Öppna KF", href: join },
    risk: true,
    blocks: [{ type: "features", cols: 3, items: [{ icon: "percent", title: "Avkastningsskatt", text: "Dras kvartalsvis från kontot." }, { icon: "handshake", title: "Förmånstagare", text: "Pengarna går direkt till den du valt." }, { icon: "globe", title: "Utländsk källskatt", text: "Kan delvis återfås på utdelningar." }] }],
  },
  af: {
    title: "Aktie- & fondkonto (AF)",
    lead: "Den klassiska depån: skatt på vinster och utdelningar, avdrag för förluster.",
    art: "chart",
    cta: { label: "Öppna AF", href: join },
    risk: true,
    blocks: [{ type: "features", cols: 3, items: [{ icon: "percent", title: "30 % skatt", text: "På realiserade vinster och utdelningar." }, { icon: "shield", title: "Kvitta förluster", text: "Förluster kan dras av mot vinster." }, { icon: "briefcase", title: "K4", text: "Affärer deklareras på blankett K4." }] }],
  },
};
