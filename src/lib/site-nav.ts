/**
 * Public site navigation (header dropdowns) and the content rendered by the single
 * /info/[slug] page. Leaves with `slug` render here; leaves with `href` go to app pages.
 */

export type Widget =
  | "loan-calculator"
  | "rates"
  | "news"
  | "market-news"
  | "pricelist"
  | "accounts"
  | "savings-calculator"
  | "steps"
  | "trading-calendar"
  | "credit-calculator"
  | "autopilot-levels"
  | "pension-calculator"
  | "loan-compare"
  | "faq-search"
  | "mortgage-affordability"
  | "rate-finder"
  | "portfolio-fee"
  | "glide-path";

export type Topic = {
  slug: string;
  title: string;
  lead: string;
  points?: string[];
  sections?: { h: string; p: string }[];
  widget?: Widget;
  steps?: { h: string; p: string }[];
  faq?: { q: string; a: string }[];
  cta?: { label: string; href: string };
};

export type NavItem = { label: string; slug?: string; href?: string; children?: NavItem[] };
export type NavGroup = { key: string; label: string; items: NavItem[] };

const join = "/logga-in?ny=1";

export const NAV: NavGroup[] = [
  {
    key: "spara",
    label: "Spara & investera",
    items: [
      {
        label: "Aktier",
        children: [
          { label: "Aktieinspiration", href: "/marknad/aktier" },
          { label: "Aktiescreener", href: "/marknad/aktier/screener" },
          { label: "Externa analyser", href: "/marknad/aktier/analyser" },
          { label: "Rätter & teckningsoptioner", href: "/marknad/produkter/ratter" },
          { label: "Öppettider & handelskalender", slug: "oppettider" },
          { label: "Så handlar du aktier", slug: "aktier" },
          { label: "Aktielånsprogrammet", slug: "aktielan" },
        ],
      },
      {
        label: "Fonder",
        children: [
          { label: "Fondinspiration", href: "/marknad/fonder" },
          { label: "Fondkategorier", href: "/marknad/fonder/kategorier" },
          { label: "Fondlistan", href: "/marknad/fonder/lista" },
          { label: "Våra egna fonder", slug: "egna-fonder" },
          { label: "Så sparar du i fonder", slug: "fonder" },
        ],
      },
      {
        label: "Börshandlade produkter",
        children: [
          { label: "Om börshandlade produkter", slug: "borshandlade-produkter" },
          { label: "Spira Markets", slug: "spira-markets" },
          { label: "ETF:er", href: "/marknad/borshandlade-fonder" },
          { label: "Trackers", href: "/marknad/produkter/trackers" },
          { label: "Bull & Bear", href: "/marknad/produkter/bull-bear" },
          { label: "Mini Futures", href: "/marknad/produkter/mini-futures" },
          { label: "Unlimited Turbos", href: "/marknad/produkter/turbos" },
          { label: "Optioner & terminer", href: "/marknad/produkter/optioner" },
          { label: "Obligationer", href: "/marknad/produkter/obligationer" },
        ],
      },
      { label: "Spira Autopilot", slug: "autopilot" },
      { label: "Värdepapperskredit", slug: "vardepapperskredit" },
      { label: "Månadsspara", slug: "manadsspara" },
      { label: "Sparkonto", slug: "sparkonto" },
      { label: "Spara till barn", slug: "spara-till-barn" },
      {
        label: "Flytta sparande",
        children: [
          { label: "Flytta hit värdepapper", slug: "flytta-vardepapper" },
          { label: "Ge värdepapper i gåva", slug: "gava" },
        ],
      },
      { label: "Börsintroduktioner & emissioner", slug: "emissioner" },
      { label: "Spara hållbart", slug: "hallbart" },
      {
        label: "Private Banking & Pro",
        children: [
          { label: "Private Banking", slug: "private-banking" },
          { label: "Pro", slug: "pro" },
          { label: "Portföljförvaltning", slug: "portfoljforvaltning" },
          { label: "Valutakonto på KF", slug: "valutakonto" },
        ],
      },
      {
        label: "Företag",
        children: [
          { label: "Företagstjänster", slug: "foretagstjanster" },
          { label: "Företagskonton", slug: "foretagskonto" },
          { label: "Corporate Finance", slug: "corporate-finance" },
          { label: "Emissionsinstitut", slug: "emissionsinstitut" },
          { label: "Vilande bolag", slug: "vilande-bolag" },
        ],
      },
      {
        label: "Konton & prislista",
        children: [
          { label: "Konton", slug: "konton" },
          { label: "Prislista", slug: "prislista" },
        ],
      },
    ],
  },
  {
    key: "bolan",
    label: "Bolån",
    items: [
      { label: "Allt om vårt bolån", slug: "bolan" },
      { label: "Flytta ditt bolån till oss", slug: "flytta-bolan" },
      { label: "Låna till ny bostad", slug: "ny-bostad" },
      { label: "Se alla räntor", slug: "rantor" },
      { label: "Hur mycket får jag låna?", slug: "lanelofte" },
      { label: "Jämför bolån", slug: "jamfor-bolan" },
      { label: "Låna till gård, lantbruk & skog", slug: "lantbruk" },
    ],
  },
  {
    key: "pension",
    label: "Pension",
    items: [
      { label: "Flytta din pension", slug: "flytta-pension" },
      { label: "Börja pensionsspara", slug: "pensionsspara" },
      { label: "Din tjänstepension hos oss", slug: "tjanstepension" },
      { label: "Ta ut pension", slug: "ta-ut-pension" },
      {
        label: "För företag",
        children: [
          { label: "Tjänstepension", slug: "tjanstepension-foretag" },
          { label: "Företagswebben", slug: "foretagswebben" },
          { label: "Pensionsportalen", slug: "pensionsportalen" },
        ],
      },
      { label: "Förmedlare", slug: "formedlare" },
      { label: "Gruppförsäkringar", slug: "gruppforsakring" },
      { label: "Hållbarhet", slug: "pension-hallbarhet" },
    ],
  },
  {
    key: "nyheter",
    label: "Nyheter",
    items: [
      { label: "Marknadsnytt", slug: "marknadsnytt" },
      { label: "Nyheter", slug: "nyheter" },
    ],
  },
  {
    key: "lar",
    label: "Lär dig mer",
    items: [
      { label: "Spira-skolan", slug: "skolan" },
      { label: "Spirapodden", slug: "podden" },
      { label: "Frågor om pengar", slug: "fragor" },
      { label: "Våra bloggar", slug: "bloggar" },
      { label: "Kom igång", slug: "kom-igang" },
      { label: "Produktnyheter", slug: "produktnyheter" },
    ],
  },
];

const T: Topic[] = [
  // ---------- Spara & investera ----------
  {
    slug: "aktier",
    title: "Så handlar du aktier",
    lead: "Bli delägare i bolag du tror på. Handla svenska och utländska aktier direkt i webben och mobilen, från 1 kr i courtage.",
    points: ["Över 100 aktier på Stockholmsbörsen, i USA och Norden", "Realtidskurser under börsens öppettider", "Limit- och stop loss-ordrar", "0 kr courtage som ny kund upp till 50 000 kr"],
    sections: [
      { h: "Så fungerar en aktieaffär", p: "Du lägger en order med antal och pris. När någon på marknaden vill sälja till ditt pris eller lägre blir det en affär. Likviden dras två bankdagar senare (T+2), men du ser innehavet direkt." },
      { h: "Risk", p: "Aktier kan både stiga och falla kraftigt i värde. Sprid ditt sparande på flera bolag och branscher och ha en lång tidshorisont." },
    ],
    cta: { label: "Till aktiescreenern", href: "/marknad/aktier/screener" },
  },
  {
    slug: "fonder",
    title: "Så sparar du i fonder",
    lead: "En fond sprider dina pengar på många värdepapper på en gång. Köp från 100 kr, helt utan courtage.",
    points: ["Indexfonder, aktivt förvaltade fonder och räntefonder", "Risknivå 1–7 och årlig avgift visas för varje fond", "Fondordrar före 15:00 handlas till dagens kurs", "Perfekt för månadssparande"],
    cta: { label: "Hitta din fond", href: "/marknad/fonder/lista" },
  },
  {
    slug: "autopilot",
    title: "Spira Autopilot",
    lead: "Låt oss sköta sparandet. Välj risknivå och månadsbelopp, så fördelar och ombalanserar vi automatiskt mellan aktie- och räntefonder.",
    points: ["Tre risknivåer: försiktig, balanserad, offensiv", "Automatisk ombalansering varje kvartal", "Inga extra avgifter utöver fondavgiften"],
    widget: "savings-calculator",
    cta: { label: "Kom igång", href: join },
  },
  {
    slug: "vardepapperskredit",
    title: "Värdepapperskredit",
    lead: "Belåna dina aktier och fonder för att få större köpkraft. Räntan beräknas bara på det du faktiskt lånar.",
    sections: [
      { h: "Belåningsvärde", p: "Varje värdepapper har ett belåningsvärde, till exempel 70 % för stora svenska aktier och 0 % för mindre bolag. Faller värdet under din skuld får du ett marginalkrav." },
      { h: "Tänk på", p: "Belåning förstärker både vinster och förluster. Låna aldrig mer än du har råd att förlora." },
    ],
  },
  {
    slug: "manadsspara",
    title: "Månadsspara i fonder",
    lead: "Spara automatiskt varje månad. Pengarna dras via autogiro och investeras direkt i de fonder du valt.",
    points: ["Från 100 kr per månad och fond", "Välj dragningsdag 1–28", "Pausa eller ändra när du vill", "Inget courtage"],
    widget: "savings-calculator",
    cta: { label: "Starta månadssparande", href: "/min-ekonomi/manadsspara" },
  },
  {
    slug: "sparkonto",
    title: "Sparkonto med ränta",
    lead: "Ett tryggt ställe för bufferten. Rörlig ränta som betalas ut varje månad och fria uttag.",
    points: ["2,25 % rörlig ränta (exempel)", "Ränta utbetalas månadsvis", "Inga uttagsavgifter", "Öppna direkt med BankID"],
    cta: { label: "Öppna sparkonto", href: "/min-ekonomi/oppna-konto" },
  },
  {
    slug: "spara-till-barn",
    title: "Spara till barn",
    lead: "Ge barnen en bra start. Ett litet månadsbelopp i en bred fond kan bli en ordentlig summa till 18-årsdagen.",
    sections: [
      { h: "I ditt eller barnets namn?", p: "Sparar du i ditt eget namn behåller du kontrollen. Sparar du i barnets namn är pengarna barnets, men förvaltas av vårdnadshavarna tills barnet fyller 18." },
    ],
    widget: "savings-calculator",
    cta: { label: "Börja spara", href: join },
  },
  {
    slug: "flytta-vardepapper",
    title: "Flytta hit värdepapper",
    lead: "Samla allt på ett ställe. Vi hämtar dina värdepapper från din nuvarande bank, du behöver inte sälja något.",
    points: ["Kostnadsfritt", "Tar normalt 1–3 veckor", "Du behåller GAV och historik", "Signera fullmakten med BankID"],
    cta: { label: "Starta flytt", href: join },
  },
  {
    slug: "flytta-pension",
    title: "Flytta din pension",
    lead: "Har du pension med höga avgifter? Flytta ditt pensionskapital och välj själv hur det ska förvaltas.",
    points: ["Se vad som går att flytta på några minuter", "Låga fondavgifter", "Vi sköter kontakten med ditt nuvarande bolag"],
    cta: { label: "Se vad du kan flytta", href: join },
  },
  {
    slug: "emissioner",
    title: "Börsintroduktioner & emissioner",
    lead: "Teckna aktier när bolag noteras på börsen eller tar in nytt kapital. Anmäl dig direkt i Spira.",
    sections: [
      { h: "Hur fungerar en notering?", p: "Bolaget säljer aktier till ett fast pris före första handelsdag. Är intresset stort kan du få färre aktier än du anmält (tilldelning)." },
      { h: "Nyemission", p: "Befintliga ägare får ofta teckningsrätter som ger rätt att köpa nya aktier till rabatt. Glömmer du att använda dem kan de förfalla." },
    ],
  },
  {
    slug: "hallbart",
    title: "Spara hållbart",
    lead: "Välj fonder och bolag som tar hänsyn till miljö, sociala frågor och bolagsstyrning (ESG).",
    points: ["Filtrera fonder efter hållbarhetsbetyg", "Fonder med uteslutning av fossila bränslen", "Information enligt EU:s disclosureförordning (artikel 8 och 9)"],
    cta: { label: "Se fonder", href: "/marknad/fonder" },
  },
  {
    slug: "private-banking",
    title: "Private Banking",
    lead: "För dig med över 5 miljoner kronor i sparkapital. Personlig rådgivare, lägre avgifter och tillgång till fler produkter.",
    points: ["Egen kontaktperson", "Courtage från 0,025 %", "Analys och placeringsförslag"],
  },
  {
    slug: "pro",
    title: "Pro för aktiva handlare",
    lead: "För dig som handlar ofta. Snabbare verktyg, orderdjup i realtid och lägre courtage vid hög volym.",
    points: ["Avancerade ordertyper", "Grafverktyg och tekniska indikatorer", "Volymrabatt på courtage"],
  },
  {
    slug: "foretagskonto",
    title: "Företagskonto",
    lead: "Placera företagets överskottslikviditet i aktier, fonder eller på sparkonto.",
    points: ["Aktie- & fondkonto eller kapitalförsäkring för företag", "Firmatecknare signerar med BankID", "Samma låga avgifter som för privatpersoner"],
  },
  { slug: "konton", title: "Konton", lead: "Vilket konto passar dig? Skillnaden handlar främst om skatt och om du vill kunna ange förmånstagare.", widget: "accounts", cta: { label: "Öppna konto", href: join } },
  { slug: "prislista", title: "Prislista", lead: "Inga fasta avgifter. Du betalar courtage när du handlar aktier och ETF:er, fonder köper du utan courtage.", widget: "pricelist" },

  // ---------- Bolån ----------
  {
    slug: "bolan",
    title: "Allt om vårt bolån",
    lead: "Ett bolån med låg ränta och utan krångel. Ju mer du har i sparande hos oss, desto lägre ränta.",
    points: ["Ränterabatt baserad på ditt sparkapital", "Ansök digitalt med BankID", "Ingen uppläggningsavgift"],
    widget: "rates",
    cta: { label: "Räkna på ditt lån", href: "/info/lanelofte" },
  },
  {
    slug: "flytta-bolan",
    title: "Flytta ditt bolån till oss",
    lead: "Byt till lägre ränta. Flytten tar några veckor och vi sköter kontakten med din nuvarande bank.",
    points: ["Lös lån med rörlig ränta utan avgift", "Bundna lån kan ha ränteskillnadsersättning", "Signera pantbrev digitalt"],
    widget: "rates",
  },
  {
    slug: "ny-bostad",
    title: "Låna till ny bostad",
    lead: "Hittat drömboendet? Ansök om lånelöfte och visa säljaren att du har finansieringen klar.",
    sections: [
      { h: "Kontantinsats", p: "Du behöver minst 10 % av köpeskillingen i egen kontantinsats. Resten kan finansieras med bolån." },
      { h: "Amorteringskrav", p: "Lånar du över 50 % av bostadens värde amorterar du 1 % per år, över 70 % amorterar du 2 %. Lånar du mer än 4,5 gånger din bruttoinkomst tillkommer 1 procentenhet." },
    ],
    widget: "loan-calculator",
  },
  { slug: "rantor", title: "Se alla räntor", lead: "Våra aktuella listräntor. Din faktiska ränta beror på belåningsgrad och sparkapital.", widget: "rates" },
  { slug: "lanelofte", title: "Hur mycket får jag låna?", lead: "Räkna på hur mycket du kan låna och vad det kostar per månad.", widget: "loan-calculator", cta: { label: "Ansök om lånelöfte", href: join } },
  {
    slug: "jamfor-bolan",
    title: "Jämför bolån",
    lead: "Rörlig eller bunden ränta? Jämför vad lånet kostar med olika bindningstider.",
    sections: [
      { h: "Rörlig ränta", p: "Följer marknadsräntan och ändras var tredje månad. Historiskt ofta billigast, men månadskostnaden kan variera." },
      { h: "Bunden ränta", p: "Samma ränta under hela bindningstiden ger förutsägbar kostnad. Löser du lånet i förtid kan du behöva betala ränteskillnadsersättning." },
    ],
    widget: "rates",
  },
  {
    slug: "lantbruk",
    title: "Låna till gård, lantbruk & skog",
    lead: "Finansiering för lantbruksfastigheter och skogsmark, med långa löptider och rådgivning från specialister.",
  },

  // ---------- Pension ----------
  {
    slug: "pensionsspara",
    title: "Börja pensionsspara",
    lead: "Den allmänna pensionen räcker sällan hela vägen. Ett eget sparande ger dig frihet att välja när du vill sluta jobba.",
    points: ["Spara på ISK eller i en kapitalförsäkring", "Ju tidigare du börjar, desto mer jobbar ränta-på-ränta", "Välj fonder med låg avgift för lång sikt"],
    widget: "savings-calculator",
  },
  {
    slug: "tjanstepension",
    title: "Din tjänstepension hos oss",
    lead: "Välj själv hur din tjänstepension förvaltas. Låga avgifter och ett stort fondutbud.",
    points: ["Se all din tjänstepension på ett ställe", "Byt fonder när du vill utan kostnad", "Välj återbetalningsskydd"],
  },
  {
    slug: "ta-ut-pension",
    title: "Ta ut pension",
    lead: "Bestäm när och hur länge din pension ska betalas ut. Uttaget kan börja från 55 år för de flesta privata pensioner.",
    sections: [{ h: "Uttagstid", p: "Kortare uttagstid ger högre månadsbelopp men tar slut tidigare. Livsvarigt uttag ger lägre belopp men betalas så länge du lever." }],
  },
  { slug: "tjanstepension-foretag", title: "Tjänstepension för företag", lead: "Erbjud dina anställda en tjänstepension med låga avgifter, administrerad helt digitalt." },
  { slug: "formedlare", title: "Förmedlare", lead: "För försäkringsförmedlare som vill erbjuda sina kunder Spiras pensionslösningar." },
  { slug: "gruppforsakring", title: "Gruppförsäkringar", lead: "Sjuk-, liv- och olycksfallsförsäkring för anställda till förmånligt grupppris." },
  { slug: "pension-hallbarhet", title: "Hållbarhet i pensionen", lead: "Ditt pensionskapital investeras under många år. Vi väljer bort bolag som inte lever upp till internationella normer." },

  // ---------- Nyheter ----------
  { slug: "marknadsnytt", title: "Marknadsnytt", lead: "Det senaste från Stockholmsbörsen och världens marknader.", widget: "market-news", cta: { label: "Börsen idag", href: "/borsen-idag" } },
  { slug: "nyheter", title: "Nyheter", lead: "Nyheter om bolag, ekonomi och räntor.", widget: "news" },

  // ---------- Lär dig mer ----------
  {
    slug: "skolan",
    title: "Spira-skolan",
    lead: "Korta lektioner om sparande, från grunderna till mer avancerade strategier.",
    sections: [
      { h: "Lektion 1: Ränta-på-ränta", p: "När avkastningen återinvesteras växer kapitalet exponentiellt. 1 000 kr i månaden i 30 år med 7 % årlig avkastning blir omkring 1,2 miljoner kronor." },
      { h: "Lektion 2: Riskspridning", p: "Lägg inte alla ägg i samma korg. Genom att äga många bolag i olika branscher och länder minskar risken utan att den förväntade avkastningen sjunker lika mycket." },
      { h: "Lektion 3: Avgifter", p: "Avgifter dras varje år oavsett hur det går. Jämför alltid den årliga avgiften när du väljer fond." },
    ],
  },
  { slug: "podden", title: "Spirapodden", lead: "Veckans podd om börsen, sparande och privatekonomi. Nya avsnitt varje torsdag.", points: ["Avsnitt 112: Räntorna och bostadsmarknaden", "Avsnitt 111: Så väljer du indexfond", "Avsnitt 110: Rapportsäsongen i korthet"] },
  {
    slug: "fragor",
    title: "Frågor om pengar",
    lead: "Svar på de vanligaste frågorna.",
    sections: [
      { h: "Hur lång tid tar en insättning?", p: "Direktinsättningar syns på kontot direkt. Vanliga överföringar tar 1–2 bankdagar." },
      { h: "När dras pengarna för ett köp?", p: "Köpbeloppet reserveras när ordern läggs och dras på likviddagen, två bankdagar efter affären." },
      { h: "Varför gick inte min order igenom?", p: "En order utförs bara om någon vill handla till ditt pris. Ligger ditt köppris under säljarnas lägsta pris ligger ordern kvar i orderboken till och med giltighetsdagen." },
      { h: "Hur loggar jag ut alla enheter?", p: "Gå till Profil → Säkerhet och välj Logga ut överallt." },
    ],
  },
  { slug: "bloggar", title: "Våra bloggar", lead: "Våra ekonomer och sparexperter skriver om marknaden, skatter och privatekonomi.", points: ["Veckans marknadskommentar", "Skattetips inför deklarationen", "Så tänker du kring räntefonder"] },
  { slug: "kom-igang", title: "Kom igång", lead: "Från noll till första investeringen på några minuter.", widget: "steps", cta: { label: "Bli kund", href: join } },
  {
    slug: "produktnyheter",
    title: "Produktnyheter",
    lead: "Det senaste vi har byggt.",
    points: ["Nytt: kursvarningar med notiser", "Nytt: mörkt läge", "Nytt: K4-underlag för aktie- & fondkonto", "Förbättrat: snabbare BankID-inloggning med QR-kod"],
  },
  // ---------- Aktier ----------
  {
    slug: "ratter-teckningsoptioner",
    title: "Rätter & teckningsoptioner",
    lead: "När ett bolag gör en nyemission får befintliga ägare ofta teckningsrätter. De ger rätt att köpa nya aktier, oftast till rabatt.",
    sections: [
      { h: "Teckningsrätter (TR)", p: "Du kan använda rätterna för att teckna nya aktier, eller sälja dem på börsen under teckningsperioden. Gör du ingenting förfaller de utan värde." },
      { h: "Betalda tecknade aktier (BTA)", p: "När du tecknat får du BTA som senare omvandlas till vanliga aktier när emissionen registrerats." },
      { h: "Teckningsoptioner (TO)", p: "Ger rätt att köpa aktier till ett bestämt pris under en viss period längre fram. Värdet beror på hur aktiekursen utvecklas." },
    ],
  },
  {
    slug: "oppettider",
    title: "Öppettider & handelskalender",
    lead: "När kan du handla? Stockholmsbörsen har öppet 09:00–17:30 vardagar, amerikanska börser 15:30–22:00 svensk tid.",
    widget: "trading-calendar",
  },
  {
    slug: "aktielan",
    title: "Aktielånsprogrammet",
    lead: "Låna ut dina aktier och få en extra intäkt. Aktierna lånas av institutionella aktörer och du får ersättning varje månad.",
    points: ["Du äger fortfarande aktierna och kan sälja dem när du vill", "Ersättningen beror på efterfrågan på den aktuella aktien", "Gäller aktie- & fondkonto och kapitalförsäkring"],
  },
  // ---------- Fonder ----------
  {
    slug: "egna-fonder",
    title: "Våra egna fonder",
    lead: "Spiras egna indexfonder har låg avgift och följer breda index. Ett enkelt grundsparande.",
    points: ["Spira Global (planerad): världens största bolag, avgift 0,10 %", "Spira Sverige (planerad): Stockholmsbörsen, avgift 0,10 %", "Tills vidare hittar du jämförbara indexfonder i fondlistan"],
    cta: { label: "Se indexfonder", href: "/marknad/fonder?kategori=Globalfond%20(index)" },
  },
  // ---------- Börshandlade produkter ----------
  {
    slug: "borshandlade-produkter",
    title: "Om börshandlade produkter",
    lead: "ETF:er, certifikat, warranter och optioner handlas på börsen precis som aktier. Vissa ger hävstång och passar bara erfarna placerare.",
    sections: [
      { h: "ETF:er", p: "Fonder som handlas under dagen. Låg avgift och bred spridning, lämpliga för långsiktigt sparande." },
      { h: "Hävstångsprodukter", p: "Bull & Bear, Mini Futures och Turbos förstärker rörelsen i en underliggande tillgång. De kan ge snabba vinster men också förlust av hela insatsen." },
    ],
    cta: { label: "Se ETF:er", href: "/marknad/borshandlade-fonder" },
  },
  { slug: "spira-markets", title: "Spira Markets", lead: "Börshandlade produkter med Spira som emittent, med låga spreadar och utan courtage på affärer över 1 000 kr.", points: ["Trackers på index och råvaror", "Bull & Bear med fast hävstång", "Finns ännu inte i demo-versionen"] },
  { slug: "trackers", title: "Trackers", lead: "En tracker följer en underliggande tillgång, till exempel ett index eller guld, ett-till-ett utan hävstång.", points: ["Enkelt sätt att få exponering mot råvaror och valutor", "Emittentrisk: värdet beror även på utgivarens betalningsförmåga"] },
  { slug: "bull-bear", title: "Bull & Bear", lead: "Certifikat med daglig fast hävstång. Bull stiger när marknaden stiger, Bear när den faller.", sections: [{ h: "Viktigt om daglig hävstång", p: "Hävstången nollställs varje dag. I en marknad som går upp och ner kan certifikatet tappa värde även om underliggande tillgång slutar på samma nivå (volatilitetsminskning)." }] },
  { slug: "mini-futures", title: "Mini Futures", lead: "Hävstångsprodukter med stop loss-nivå. Hävstången blir högre ju närmare kursen ligger stop loss-nivån.", points: ["Ingen daglig ombalansering", "Förfaller om stop loss-nivån nås", "Kräver kunskapstest"] },
  { slug: "turbos", title: "Unlimited Turbos", lead: "Liknar Mini Futures men knock out-nivån är samma som finansieringsnivån, vilket ger högre hävstång och högre risk.", points: ["Ingen löptid", "Kan förfalla värdelös vid knock out"] },
  { slug: "optioner", title: "Optioner & terminer", lead: "Derivat där du köper eller säljer rätten att handla en aktie till ett bestämt pris vid en viss tidpunkt.", sections: [{ h: "Köpoption och säljoption", p: "En köpoption stiger i värde när aktien stiger, en säljoption när den faller. Säljer du optioner (utfärdar) kan förlusten bli större än insatsen och kräver säkerhet." }] },
  { slug: "obligationer", title: "Obligationer", lead: "Räntebärande värdepapper utgivna av stater och företag. Du får en fast eller rörlig ränta och pengarna tillbaka på förfallodagen.", points: ["Statsobligationer har lägst risk", "Företagsobligationer ger högre ränta men kreditrisk", "Värdet påverkas av marknadsräntan om du säljer före förfall"] },
  // ---------- Flytta / gåva ----------
  { slug: "gava", title: "Ge värdepapper i gåva", lead: "Ge bort aktier eller fonder till en annan person, till exempel ditt barn. Mottagaren tar över ditt anskaffningsvärde.", points: ["Mottagaren behöver vara kund hos Spira", "Gåvan signeras med BankID av givaren", "Från ISK räknas gåvan som ett uttag"] },
  // ---------- Private Banking & Pro ----------
  { slug: "portfoljforvaltning", title: "Portföljförvaltning", lead: "Låt våra förvaltare sköta din portfölj utifrån en överenskommen risknivå. Passar dig som inte vill välja enskilda värdepapper.", points: ["Lägsta belopp 1 miljon kr", "Löpande rapportering", "Fast årlig avgift"] },
  { slug: "valutakonto", title: "Valutakonto på KF", lead: "Ha pengar i USD eller EUR direkt på din kapitalförsäkring och slipp växla vid varje affär i utländska aktier.", points: ["Växla bara när du vill", "Spara in valutaväxlingsavgiften vid frekvent handel"] },
  // ---------- Företag ----------
  { slug: "foretagstjanster", title: "Företagstjänster", lead: "Tjänster för bolag: placering av överskottslikviditet, kapitalanskaffning och administration av ägarlistor." },
  { slug: "corporate-finance", title: "Corporate Finance", lead: "Vi hjälper bolag med nyemissioner, börsnoteringar och spridningsemissioner riktade till privatpersoner." },
  { slug: "emissionsinstitut", title: "Emissionsinstitut", lead: "Som emissionsinstitut hanterar vi teckning, tilldelning och betalning i bolagets emission." },
  { slug: "vilande-bolag", title: "Vilande bolag", lead: "Har ditt aktiebolag ingen verksamhet just nu? Placera kapitalet i bolaget på ett företagskonto till låg kostnad." },
  // ---------- Pension företag ----------
  { slug: "foretagswebben", title: "Företagswebben", lead: "Administrera de anställdas tjänstepension digitalt: anmäl nyanställda, ändra lön och se premier." },
  { slug: "pensionsportalen", title: "Pensionsportalen", lead: "En portal för arbetsgivare och förmedlare med översikt över alla tjänstepensionsavtal." },
];


const EXTRA: Record<string, Partial<Topic>> = {
  manadsspara: {
    steps: [
      { h: "Välj konto", p: "Månadsspara på ISK eller kapitalförsäkring för fonder, eller på sparkonto för en buffert." },
      { h: "Välj belopp och dag", p: "Från 100 kr per fond. Pengarna dras via autogiro den dag du väljer, 1–28." },
      { h: "Välj fonder", p: "Fördela beloppet på en eller flera fonder. Du kan ändra fördelningen när du vill." },
    ],
    faq: [
      { q: "Hur mycket ska jag spara?", a: "En tumregel är 10 % av lönen efter skatt, men det viktigaste är att komma igång. Även 200 kr i månaden gör skillnad över tid." },
      { q: "Kan jag pausa sparandet?", a: "Ja, du kan pausa, ändra eller avsluta ditt månadssparande när som helst under Min ekonomi." },
      { q: "När köps fonderna?", a: "Fonderna köps samma dag som pengarna kommit in, till fondens kurs den dagen." },
    ],
  },
  sparkonto: {
    points: ["Ingen bindningstid", "Ränta betalas ut varje månad", "Insättningsgaranti upp till 1 050 000 kr (i verkligheten)", "Månadsspara med autogiro", "Överföringar dygnet runt mellan dina konton", "Uttag till annan bank inom 1–2 bankdagar"],
    faq: [
      { q: "Kostar det något att ha ett sparkonto?", a: "Nej, det finns inga avgifter för att öppna eller ha ett sparkonto." },
      { q: "När betalas räntan ut?", a: "Räntan räknas dagligen och betalas ut till kontot i början av varje månad." },
      { q: "Hur lång tid tar ett uttag?", a: "Överföringar till dina andra konton hos oss sker direkt. Uttag till en annan bank tar normalt 1–2 bankdagar." },
    ],
  },
  "spara-till-barn": {
    steps: [
      { h: "Spara i eget namn", p: "Du äger pengarna och bestämmer när och hur de ska användas. Enkelt att komma igång direkt." },
      { h: "Spara i barnets namn", p: "Pengarna tillhör barnet. Båda vårdnadshavarna behöver godkänna, och barnet tar över vid 18." },
    ],
    faq: [
      { q: "Hur mycket ska man spara?", a: "Barnbidraget, eller en del av det, är ett vanligt belopp. 500 kr i månaden i 18 år kan bli flera hundra tusen kronor." },
      { q: "Vilket konto passar bäst?", a: "ISK är vanligast eftersom skatten blir låg och det är enkelt att deklarera." },
    ],
  },
  "flytta-vardepapper": {
    steps: [
      { h: "Fyll i flyttblanketten", p: "Ange vilken bank du flyttar från och vilka värdepapper som ska flyttas." },
      { h: "Signera med BankID", p: "Fullmakten skrivs under digitalt. Vi skickar den till din nuvarande bank." },
      { h: "Vi sköter resten", p: "Innehaven flyttas utan att säljas. Du ser dem på ditt konto när flytten är klar, oftast inom 1–3 veckor." },
    ],
    faq: [
      { q: "Kostar det något?", a: "Vi tar inte betalt för flytten. Vissa banker tar ut en avgift för att flytta ut värdepapper." },
      { q: "Kan jag flytta från ISK till ISK?", a: "Ja, då räknas det inte som ett uttag och påverkar inte skatten." },
    ],
  },
  gava: {
    steps: [
      { h: "Välj värdepapper", p: "Välj vilka aktier eller fonder och hur många du vill ge bort." },
      { h: "Ange mottagare", p: "Mottagaren behöver vara kund hos oss. Ange personnummer och kontonummer." },
      { h: "Signera med BankID", p: "Gåvan genomförs normalt inom några bankdagar." },
    ],
    faq: [
      { q: "Kostar det något?", a: "Nej, överföringar mellan kunder är kostnadsfria." },
      { q: "Påverkas mottagarens skatt?", a: "På ISK räknas gåvan som en insättning och höjer kapitalunderlaget för året." },
    ],
  },
  emissioner: {
    points: ["Just nu finns inga aktuella erbjudanden", "Anmälan sker direkt i Spira när ett erbjudande är öppet", "Du får besked om tilldelning via notis"],
    faq: [
      { q: "Vad är en TR och en BTA?", a: "En teckningsrätt (TR) ger rätt att teckna nya aktier. Betald tecknad aktie (BTA) är det du får efter teckning, tills emissionen är registrerad." },
      { q: "Vad är en teckningsoption (TO)?", a: "En rätt att köpa aktier till ett förutbestämt pris under en viss period längre fram." },
      { q: "Hur vet jag om jag fått tilldelning?", a: "Du får en notis och tilldelade aktier syns på ditt konto efter likviddagen." },
    ],
  },
  vardepapperskredit: { widget: "credit-calculator", faq: [{ q: "Vad händer om värdet faller?", a: "Om skulden blir större än belåningsvärdet får du ett marginalkrav och behöver sätta in pengar eller sälja värdepapper." }, { q: "Hur räknas räntan?", a: "Räntan räknas dagligen på den del du faktiskt lånar och dras månadsvis." }] },
  autopilot: { widget: "autopilot-levels", faq: [{ q: "Kan jag köpa Autopilot utan att månadsspara?", a: "Ja, du kan göra engångsinsättningar och komplettera med månadssparande när du vill." }, { q: "Vilka konton kan jag använda?", a: "ISK, kapitalförsäkring och pensionskonton." }] },
  pensionsspara: { widget: "pension-calculator", steps: [{ h: "Välj konto", p: "Kapitalförsäkring eller ISK för privat pensionssparande." }, { h: "Bestäm belopp", p: "Spara ett fast belopp varje månad, gärna en procentsats av lönen." }, { h: "Låt tiden jobba", p: "Sparandet blir automatiskt försiktigare ju närmare pensionen du kommer." }] },
  "flytta-pension": {
    steps: [
      { h: "Vi letar upp dina pensioner", p: "Med ditt godkännande hämtar vi information om dina pensioner och visar vad som går att flytta." },
      { h: "Du väljer vad som ska flyttas", p: "Vi visar avgifter före och efter flytten så att du kan jämföra." },
      { h: "Vi flyttar åt dig", p: "Gamla innehav säljs och pengarna placeras enligt ditt val. En flytt tar ungefär 1–3 månader." },
    ],
  },
  "ta-ut-pension": { steps: [{ h: "Fundera", p: "När vill du sluta jobba och hur mycket behöver du per månad?" }, { h: "Planera", p: "Se vilka pensioner du har och när de tidigast kan betalas ut." }, { h: "Agera", p: "Välj uttagstid för varje pension. Kortare tid ger högre belopp." }] },
  bolan: { widget: "rates", steps: [{ h: "Se din ränta", p: "Ange bostadens värde och lånebelopp, så visar vi din ränta direkt." }, { h: "Ansök digitalt", p: "Ansökan tar några minuter och signeras med BankID." }, { h: "Vi sköter resten", p: "Vid flytt löser vi ditt gamla lån. Vid köp betalas lånet ut på tillträdesdagen." }] },
  "flytta-bolan": {
    widget: "rates",
    steps: [
      { h: "Se vilken ränta du kan få och ansök", p: "Fyll i bostadens värde och nuvarande lån." },
      { h: "Ansökan godkänns", p: "En handläggare går igenom ansökan, oftast inom några dagar." },
      { h: "Välj bindningstid och skriv under", p: "Skuldebrev och pantsättning signeras digitalt." },
      { h: "Vi flyttar bolånet åt dig", p: "Vi löser det gamla lånet och flyttar pantbreven." },
      { h: "Klart", p: "Lånet syns under Min ekonomi när du är inloggad." },
    ],
  },
  "ny-bostad": { steps: [{ h: "Hitta bostaden", p: "Ansök om lånelöfte i förväg så vet du vad du har råd med." }, { h: "Ansökan", p: "En handläggare hjälper dig när du har hittat bostaden." }, { h: "Kontrakt", p: "Skriv på köpekontraktet och betala handpenningen." }, { h: "Bindningstid", p: "Välj rörlig eller bunden ränta och skriv under." }, { h: "Tillträde", p: "Lånet betalas ut till säljaren på tillträdesdagen." }] },
  "jamfor-bolan": { widget: "loan-compare" },
  lantbruk: { faq: [{ q: "Vilka fastigheter kan jag låna till?", a: "Jord- och skogsbruksfastigheter med taxeringsvärde för lantbruksenhet." }, { q: "Hur sätts räntan?", a: "Räntan sätts individuellt utifrån fastighetens värde och verksamhetens ekonomi." }] },
  kundservice: { widget: "faq-search" },
  fragor: { widget: "faq-search" },
};

T.push({ slug: "kundservice", title: "Kundservice", lead: "Sök bland vanliga frågor och svar, eller kontakta oss." });
export const TOPICS: Record<string, Topic> = Object.fromEntries(T.map((t) => [t.slug, { ...t, ...EXTRA[t.slug] }]));

export function hrefFor(i: NavItem): string {
  return i.href ?? (i.slug ? `/info/${i.slug}` : "#");
}

/** Which nav group a topic belongs to (first match). */
export function groupForSlug(slug: string): NavGroup | undefined {
  const has = (items: NavItem[]): boolean => items.some((i) => i.slug === slug || (i.children ? has(i.children) : false));
  return NAV.find((g) => has(g.items));
}
