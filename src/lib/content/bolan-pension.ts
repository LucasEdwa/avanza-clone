import type { Block, PageDef } from "./types";

const join = "/logga-in?ny=1";

const BOLAN_STEPS_MOVE: Block = {
  type: "steps",
  title: "Så flyttar du ditt bolån",
  items: [
    { title: "Se din ränta och ansök", text: "Ange bostadens värde och lånebelopp. Ansökan tar några minuter." },
    { title: "Ansökan godkänns", text: "En handläggare går igenom ansökan, oftast inom ett par dagar." },
    { title: "Välj bindningstid och skriv under", text: "Skuldebrev och pantsättning signeras med BankID." },
    { title: "Vi flyttar lånet", text: "Vi löser det gamla lånet och tar hand om pantbreven." },
    { title: "Klart", text: "Lånet syns under Min ekonomi tillsammans med ditt sparande." },
  ],
};

const BOLAN_FAQ: Block = {
  type: "faq",
  items: [
    { q: "Kostar det något att flytta?", a: "Vi tar ingen avgift. Har du bunden ränta kan din nuvarande bank ta ut ränteskillnadsersättning." },
    { q: "Hur lång tid tar en flytt?", a: "Normalt 3–6 veckor från godkänd ansökan, beroende på pantbrev och nuvarande bank." },
    { q: "Vilka bostäder lånar ni till?", a: "Villor, radhus, bostadsrätter och fritidshus i Sverige." },
    { q: "Hur sätts min ränta?", a: "Utifrån belåningsgrad och hur mycket du sparar hos oss. Ju lägre belåning, desto lägre ränta." },
    { q: "Hur mycket måste jag amortera?", a: "1 % per år om du lånar över 50 % av bostadens värde, 2 % över 70 %. Plus 1 procentenhet om lånen överstiger 4,5 gånger inkomsten." },
    { q: "Kan jag lösa lånet i förtid?", a: "Lån med rörlig ränta kan lösas när som helst utan kostnad. Bundna lån kan ha ränteskillnadsersättning." },
    { q: "Kan vi vara två låntagare?", a: "Ja, upp till två låntagare per lån." },
    { q: "Vad är ett lånelöfte?", a: "Ett besked om hur mycket du kan låna, giltigt i normalt sex månader." },
    { q: "Påverkar ansökan min kreditvärdighet?", a: "En kreditupplysning tas vid ansökan. Flera förfrågningar under kort tid kan påverka andra långivares bedömning." },
  ],
};

const RATE_TABLE: Block = { type: "widget", title: "Aktuella räntor för dig", widget: "rates" };

export const BOLAN: Record<string, PageDef> = {
  bolan: {
    title: "Ett enkelt och billigt bolån",
    lead: "Låg ränta, ingen förhandling och allt digitalt. Samla bolånet och sparandet på samma ställe.",
    art: "house",
    cta: { label: "Se din ränta", href: "/info/rantor" },
    cta2: { label: "Hur mycket får jag låna?", href: "/info/lanelofte" },
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "move", title: "Vill du flytta ditt bolån?", text: "Vi sköter flytten från din nuvarande bank.", href: "/info/flytta-bolan" }, { icon: "house", title: "Ska du köpa ny bostad?", text: "Få lånelöfte och veta vad du har råd med.", href: "/info/ny-bostad" }, { icon: "percent", title: "Se din bästa ränta", text: "Din ränta direkt, utan att ansöka.", href: "/info/rantor" }] },
      { type: "widget", title: "Se hur mycket du kan spara", lead: "Jämför din nuvarande ränta med vår.", widget: "loan-compare" },
      { type: "features", cols: 3, items: [{ icon: "briefcase", title: "Bolån för Private Banking", text: "Individuell ränta för dig med större kapital.", href: "/info/private-banking" }, { icon: "leaf", title: "Gård, lantbruk eller skog", text: "Finansiering för lantbruksfastigheter.", href: "/info/lantbruk" }, { icon: "growth", title: "Gröna bolån", text: "Lägre ränta för energieffektiva bostäder (energiklass A–B)." }] },
      BOLAN_FAQ,
      { type: "band", title: "Redo att ansöka?", text: "Det tar några minuter och du får besked snabbt.", cta: { label: "Ansök nu", href: join } },
    ],
  },
  "flytta-bolan": {
    title: "Flytta ditt bolån och slipp förhandla",
    lead: "Du får vår bästa ränta direkt, och vi sköter allt pappersarbete med din nuvarande bank.",
    art: "move",
    blocks: [
      { type: "widget", title: "Vilken ränta kan du få?", widget: "rate-finder" },
      RATE_TABLE,
      BOLAN_STEPS_MOVE,
      BOLAN_FAQ,
      { type: "band", title: "Flytta ditt bolån idag", text: "Ansök digitalt och signera med BankID.", cta: { label: "Ansök", href: join } },
    ],
  },
  "ny-bostad": {
    title: "När du ska köpa ny bostad",
    lead: "Få lånelöfte, se vad du har råd med och låt oss hjälpa dig hela vägen till tillträdet.",
    art: "house",
    blocks: [
      { type: "split", title: "Hur mycket får jag låna?", text: "Räkna på vad du kan låna utifrån inkomst, utgifter och kontantinsats.", art: "percent", cta: { label: "Räkna nu", href: "/info/lanelofte" } },
      { type: "widget", title: "Vilken ränta kan du få?", widget: "rate-finder" },
      RATE_TABLE,
      {
        type: "steps",
        title: "Så här går det till",
        items: [
          { title: "Hitta bostaden", text: "Med lånelöfte i handen vet du vad du kan bjuda." },
          { title: "Ansökan", text: "En handläggare hjälper dig med ansökan när budet är accepterat." },
          { title: "Kontrakt", text: "Skriv köpekontrakt och betala handpenning." },
          { title: "Bindningstid och underskrift", text: "Välj rörlig eller bunden ränta och signera." },
          { title: "Tillträde", text: "Lånet betalas ut till säljaren på tillträdesdagen." },
        ],
      },
      { type: "features", title: "Vanliga funderingar", cols: 3, items: [{ icon: "calendar", title: "Binder jag mig?", text: "Nej, ett lånelöfte är inte bindande." }, { icon: "coins", title: "Kontantinsats", text: "Minst 15 % av köpeskillingen behövs i egna pengar." }, { icon: "percent", title: "Ränta vid tillträde", text: "Räntan sätts när lånet betalas ut." }] },
      BOLAN_FAQ,
    ],
  },
  rantor: {
    title: "Se din bästa ränta och ansök",
    lead: "Fyll i bostadens värde och lånebelopp så ser du din ränta direkt.",
    art: "percent",
    blocks: [
      { type: "widget", widget: "rate-finder" },
      RATE_TABLE,
      { type: "features", title: "Varför samarbetar vi med andra?", cols: 3, items: [{ icon: "handshake", title: "Heltäckande", text: "Genom samarbeten kan vi erbjuda lån till fler typer av bostäder." }, { icon: "percent", title: "Så låg ränta som möjligt", text: "Låg kostnad för upplåning ger lägre ränta till dig." }, { icon: "shield", title: "Noga utvalda partner", text: "Vi samarbetar bara med etablerade svenska långivare." }] },
      { type: "features", title: "Så här funkar det", cols: 2, items: [{ icon: "move", title: "Att flytta ditt bolån", text: "Vi löser lånet hos din nuvarande bank.", href: "/info/flytta-bolan" }, { icon: "house", title: "Att köpa ny bostad", text: "Lånelöfte och utbetalning vid tillträde.", href: "/info/ny-bostad" }] },
      { type: "features", title: "Varför flytta bolånet hit?", cols: 3, items: [{ icon: "rocket", title: "Sköter sig självt", text: "Ingen förhandling: du får vår bästa ränta direkt." }, { icon: "phone", title: "Snabb kontakt", text: "Bolåneexperter som svarar snabbt." }, { icon: "chart", title: "Samlad överblick", text: "Bolån och sparande på samma ställe." }] },
      BOLAN_FAQ,
    ],
  },
  lanelofte: {
    title: "Hur mycket får jag låna?",
    lead: "Fyll i uppgifter om låntagare, bostad, hushåll och andra lån, så räknar vi ut ungefär hur mycket du kan låna.",
    art: "house",
    blocks: [{ type: "widget", widget: "mortgage-affordability" }],
  },
  "jamfor-bolan": {
    title: "Se hur mycket du kan spara",
    lead: "Jämför ditt nuvarande bolån med vårt erbjudande.",
    art: "percent",
    blocks: [
      { type: "widget", widget: "loan-compare" },
      { type: "faq", title: "Frågor och svar", items: [{ q: "Hur funkar jämförelsen?", a: "Vi jämför din nuvarande ränta med vår listränta för samma bindningstid och räknar på besparingen efter ränteavdrag." }, { q: "Vilka uppgifter används?", a: "Bara de uppgifter du själv fyller i. Inget hämtas från andra banker i demotjänsten." }, { q: "Min bank finns inte med?", a: "Fyll i din ränta manuellt så fungerar jämförelsen för alla banker." }] },
    ],
  },
  lantbruk: {
    title: "Låna till gård, lantbruk och skog",
    lead: "Finansiering för jord- och skogsbruksfastigheter med specialister som förstår din verksamhet.",
    art: "leaf",
    blocks: [
      { type: "features", cols: 2, items: [{ icon: "move", title: "Vill du flytta ditt lån?", text: "Vi tar över lånet och pantbreven." }, { icon: "house", title: "Ska du köpa nytt?", text: "Finansiering av köp av gård eller skog." }] },
      { type: "split", title: "Vi förstår din verksamhet", text: "Lantbruksfastigheter värderas annorlunda än villor. Våra rådgivare har erfarenhet av jord- och skogsbruk och tar hänsyn till intäkter från verksamheten.", art: "leaf" },
      { type: "text", title: "Räntan sätts individuellt", paragraphs: ["Räntan bestäms utifrån fastighetens värde, verksamhetens ekonomi och belåningsgrad. Kontakta oss för ett förslag."] },
      { type: "faq", items: [{ q: "Vilka fastigheter kan jag låna till?", a: "Fastigheter som är taxerade som lantbruksenhet." }, { q: "Vilken ränta får jag?", a: "Individuell, se ovan." }, { q: "Hur värderas fastigheten?", a: "Av en lantbruksvärderare utifrån mark, skog och byggnader." }, { q: "Skillnad mot vanligt bolån?", a: "Längre löptider och hänsyn till verksamhetens kassaflöde." }, { q: "Kan jag placera pengar via er?", a: "Ja, överskott kan placeras på sparkonto eller i fonder." }] },
      { type: "band", title: "Kontakta en rådgivare", text: "Berätta om din fastighet så återkommer vi.", cta: { label: "Kontakt", href: "/info/kundservice" } },
    ],
  },
};

const RISK_TEXT: Block = { type: "notice", text: "Pensionssparande i fonder innebär risk. Värdet kan både öka och minska." };

export const PENSION: Record<string, PageDef> = {
  "flytta-pension": {
    title: "Flytta hit din pension",
    lead: "Samla dina pensioner, sänk avgifterna och välj själv hur pengarna ska placeras.",
    art: "pension",
    cta: { label: "Se vad du kan flytta", href: join },
    risk: true,
    blocks: [
      { type: "steps", title: "Så funkar det", items: [{ title: "Vi letar upp dina pensioner", text: "Med ditt godkännande hämtar vi uppgifter om alla dina pensioner. Du väljer vad som ska flyttas." }, { title: "Vi jobbar, du väntar", text: "Vi kontaktar dina nuvarande bolag och sköter administrationen." }, { title: "Pengarna flyttas", text: "Gamla innehav säljs och pengarna placeras enligt ditt val." }] },
      { type: "split", title: "Få koll på alla avgifter", text: "Även små skillnader i avgift blir stora belopp över tid. Vi visar vad du betalar idag och vad du skulle betala hos oss.", art: "percent" },
      { type: "features", title: "Mer om att flytta pension", cols: 4, items: [{ icon: "calendar", title: "1–3 månader", text: "Så lång tid tar en flytt normalt." }, { icon: "briefcase", title: "Det här kan flyttas", text: "Tjänstepension, pensionsförsäkring och IPS." }, { icon: "shield", title: "Återbetalningsskydd", text: "Du väljer om det ska finnas med efter flytten." }, { icon: "coins", title: "Ingen avgift hos oss", text: "Vissa bolag tar ut en flyttavgift." }] },
      { type: "faq", items: [{ q: "Kan all pension flyttas?", a: "Allmän pension kan inte flyttas. Många tjänstepensioner och privata pensionsförsäkringar kan det." }, { q: "Kostar det något?", a: "Vi tar ingen avgift. Ditt nuvarande bolag kan ta ut en flyttavgift." }, { q: "Påverkas min arbetsgivare?", a: "Nej, framtida inbetalningar fortsätter enligt avtal." }, { q: "Vad är återbetalningsskydd?", a: "Att pengarna går till efterlevande om du avlider före eller under utbetalningen." }, { q: "Kan jag flytta tillbaka?", a: "Ja, pensioner hos oss kan flyttas vidare." }, { q: "Vilka fonder kan jag välja?", a: "Ett brett urval av indexfonder och aktivt förvaltade fonder." }, { q: "Får jag besked när flytten är klar?", a: "Ja, du får en notis när pengarna är placerade." }, { q: "Kan jag flytta en pension under utbetalning?", a: "Oftast inte. Det beror på villkoren i försäkringen." }] },
    ],
  },
  pensionsspara: {
    title: "Pensionsspara smart och enkelt",
    lead: "Ett automatiskt pensionssparande som anpassas efter din ålder, med låga avgifter.",
    art: "pension",
    cta: { label: "Kom igång", href: join },
    risk: true,
    blocks: [
      { type: "steps", title: "Så här funkar det", items: [{ title: "Öppna kontot", text: "Kapitalförsäkring eller ISK, signera med BankID." }, { title: "Bestäm sparbelopp", text: "Ett fast belopp varje månad." }, { title: "Pengarna placeras", text: "I indexnära fonder anpassade efter din ålder." }, { title: "Ta det lugnt", text: "Fördelningen justeras automatiskt över tid." }] },
      RISK_TEXT,
      { type: "widget", title: "Så anpassas sparandet efter din ålder", widget: "glide-path" },
      { type: "widget", title: "Hur stor pension kan du få ihop?", widget: "pension-calculator" },
      { type: "split", title: "Smarta fonder med låga avgifter", text: "Sparandet består av globala aktiefonder och räntefonder med en total avgift under 0,2 % per år.", art: "growth" },
      { type: "faq", items: [{ q: "Vad skiljer detta från en generationsfond?", a: "Principen är densamma, men avgiften är lägre och du kan när som helst ändra." }, { q: "Kan jag välja fonder själv?", a: "Ja, du kan byta till egna fonder när du vill." }, { q: "När kan jag ta ut pengarna?", a: "På ISK och KF när du vill. Pengarna är inte inlåsta." }, { q: "Är det avdragsgillt?", a: "Privat pensionssparande är inte avdragsgillt för de flesta anställda." }, { q: "Kan jag pausa?", a: "Ja, månadssparandet kan pausas när som helst." }, { q: "Vad händer om jag dör?", a: "Pengarna på KF går till förmånstagare, på ISK till dödsboet." }, { q: "Vilken ålder gäller?", a: "Från 18 år." }] },
    ],
  },
  tjanstepension: {
    title: "Tjänstepensionen – din framtida lön",
    lead: "Din arbetsgivare sätter av pengar till din pension. Här ser du vad du fått och hur du kan påverka den.",
    art: "briefcase",
    risk: true,
    blocks: [
      RISK_TEXT,
      { type: "features", title: "Vad har du fått?", cols: 3, items: [{ icon: "chart", title: "Hur investeras pengarna?", text: "Om du inte väljer själv placeras de automatiskt efter din ålder." }, { icon: "shield", title: "Återbetalningsskydd", text: "Pengarna går till dina efterlevande om du avlider." }, { icon: "briefcase", title: "Avtalet", text: "Premien bestäms av ditt anställningsavtal." }] },
      { type: "split", title: "Automatiskt pensionssparande", text: "Det förvalda alternativet flyttar gradvis från aktier till räntor ju närmare pensionen du kommer.", art: "pension" },
      { type: "text", title: "Sjukförsäkring och premiebefrielse", paragraphs: ["Din arbetsgivare kan ha valt till försäkringar som ger ersättning om du blir sjuk och som betalar pensionspremien under tiden."] },
      { type: "steps", title: "Vad kan du göra nu?", items: [{ title: "Hitta din pension", text: "Logga in och se den första inbetalningen." }, { title: "Se placeringen", text: "Se hur pengarna är investerade." }, { title: "Ändra placering", text: "Välj fonder för kommande inbetalningar." }, { title: "Välj förmånstagare", text: "Bestäm vem som ska få pengarna." }, { title: "Samla pensioner", text: "Flytta in äldre pensioner." }, { title: "Planera uttag", text: "Se när du kan börja ta ut pension." }] },
    ],
  },
  "ta-ut-pension": {
    title: "Planera för din pension",
    lead: "Bestäm när du vill sluta jobba och hur länge pensionen ska betalas ut.",
    art: "calendar",
    blocks: [
      { type: "steps", title: "Tre steg till en smartare pension", items: [{ title: "Fundera", text: "När vill du gå i pension och hur mycket behöver du per månad?" }, { title: "Planera", text: "Se vilka pensioner du har och när de tidigast kan betalas ut." }, { title: "Agera", text: "Välj uttagstid för varje pension." }] },
      { type: "split", title: "Aktier även under utbetalningen", text: "Pengarna kan fortsätta växa medan de betalas ut. Med flexibla uttag kan du ändra belopp och uttagstid.", art: "growth" },
      { type: "split", title: "Samla pensionerna", text: "Med alla pensioner på samma ställe blir det enklare att planera uttagen.", art: "move", reverse: true, cta: { label: "Flytta pension", href: "/info/flytta-pension" } },
      { type: "table", title: "Hur betalas olika pensioner ut?", head: ["Pensionstyp", "Tidigaste uttag", "Uttagstid"], rows: [["Tjänstepension", "55 år", "Minst 5 år eller livsvarigt"], ["IPS", "55 år", "Minst 5 år"], ["Pensionsförsäkring", "55 år", "Minst 5 år"], ["Kapitalförsäkring", "Valfritt", "Valfritt"]], note: "Allmän pension kan tas ut från 63 år (2026)." },
      { type: "features", title: "Läs och lyssna mer", cols: 3, items: [{ icon: "book", title: "Bloggen", text: "Tips inför pensionen.", href: "/info/bloggar" }, { icon: "phone", title: "Podden", text: "Avsnitt om pension.", href: "/info/podden" }, { icon: "growth", title: "Låt pengarna växa", text: "Fortsätt spara under pensionen.", href: "/info/pensionsspara" }] },
    ],
  },
  "tjanstepension-foretag": {
    title: "En riktigt bra tjänstepension",
    lead: "Tjänstepension för ditt företag med låga avgifter och digital administration.",
    art: "briefcase",
    blocks: [
      { type: "text", title: "Vad får ni hos oss?", paragraphs: ["Låga avgifter, ett brett fondutbud och en digital administration där ni anmäler anställda och ändrar löner själva."] },
      { type: "features", title: "Vilken lösning passar?", cols: 2, items: [{ icon: "briefcase", title: "Ensam i bolaget", text: "Avdragsgill pension för dig som äger och driver bolaget." }, { icon: "handshake", title: "Flera anställda", text: "Paket med pension och försäkringar för hela personalen." }] },
      { type: "text", title: "Varför tjänstepension?", paragraphs: ["En bra tjänstepension gör er till en attraktiv arbetsgivare och är ett skatteeffektivt sätt att spara för ägare."] },
      { type: "split", title: "Automatisk entrélösning", text: "Anställda som inte gör ett eget val får ett åldersanpassat sparande med låg avgift.", art: "pension" },
      { type: "stats", items: [{ value: "0,15 %", label: "fondavgift i entrélösningen" }, { value: "100 %", label: "digital administration" }, { value: "1 000+", label: "fonder att välja bland" }, { value: "0 kr", label: "i uppstartsavgift" }] },
      { type: "features", cols: 2, items: [{ icon: "book", title: "Tips till arbetsgivare", text: "Så kommunicerar ni pensionen." }, { icon: "growth", title: "Lär dig mer", text: "Grunderna i tjänstepension.", href: "/info/skolan" }] },
      { type: "faq", items: [{ q: "Vad kostar det?", a: "Inga avgifter för företaget utöver premierna." }, { q: "Hur anmäler vi anställda?", a: "Via Företagswebben." }, { q: "Kan ägare få tjänstepension?", a: "Ja, avsättningen är avdragsgill inom gränserna." }, { q: "Måste vi ha kollektivavtal?", a: "Nej, ni kan ha tjänstepension utan kollektivavtal." }, { q: "Kan vi lägga till försäkringar?", a: "Ja, sjukförsäkring och premiebefrielse." }, { q: "Hur betalas premien?", a: "Månadsvis via faktura." }, { q: "Kan vi byta tillbaka?", a: "Ja, avtalet kan sägas upp." }] },
    ],
  },
  foretagswebben: { title: "Företagswebben", lead: "Administrera tjänstepensionen för era anställda, digitalt och enkelt.", art: "briefcase", blocks: [{ type: "features", cols: 3, items: [{ icon: "briefcase", title: "Anmäl anställda", text: "Lägg till nyanställda och avsluta anställningar." }, { icon: "coins", title: "Ändra lön", text: "Premien räknas om automatiskt." }, { icon: "calendar", title: "Se premier", text: "Översikt över fakturor och inbetalningar." }] }] },
  pensionsportalen: { title: "Pensionsportalen", lead: "Översikt över alla tjänstepensionsavtal för arbetsgivare och förmedlare.", art: "chart", blocks: [{ type: "features", cols: 2, items: [{ icon: "chart", title: "Samlad bild", text: "Alla avtal och anställda på ett ställe." }, { icon: "shield", title: "Behörigheter", text: "Ge förmedlare eller ekonomiavdelningen åtkomst." }] }] },
  formedlare: {
    title: "Förmedlartjänst",
    lead: "För försäkringsförmedlare som vill erbjuda sina kunder pensionslösningar hos Spira.",
    art: "handshake",
    blocks: [
      { type: "features", title: "Vad erbjuder vi förmedlare?", cols: 3, items: [{ icon: "chart", title: "Brett utbud", text: "Fonder och försäkringslösningar för privat och företag." }, { icon: "shield", title: "Fullmaktshantering", text: "Digital hantering av kundfullmakter." }, { icon: "handshake", title: "Partnerskap", text: "Bli partner och få tillgång till verktyg och support." }] },
      { type: "text", title: "Fullmaktshantering", paragraphs: ["Kunden signerar fullmakten med BankID. Du får direkt tillgång till kundens pensionsöversikt."] },
      { type: "band", title: "Vill du ha hjälp?", text: "Kontakta vårt förmedlarteam.", cta: { label: "Kontakt", href: "/info/kundservice" } },
    ],
  },
  gruppforsakring: {
    title: "Gruppförsäkringar",
    lead: "Prisvärda försäkringar för dig och din familj, tecknade via arbetsgivare eller förening.",
    art: "umbrella",
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "shield", title: "Sjukvårdsförsäkring", text: "Snabb tillgång till specialistvård och behandling." }, { icon: "umbrella", title: "Olycksfallsförsäkring", text: "Ersättning vid olycka, dygnet runt." }, { icon: "pension", title: "Sjuk- och olycksfall", text: "Ekonomiskt skydd vid längre sjukdom." }, { icon: "handshake", title: "Livförsäkring", text: "Ett engångsbelopp till efterlevande." }, { icon: "kids", title: "Barnförsäkring", text: "Skydd för barn och unga vid sjukdom och olycka." }, { icon: "briefcase", title: "Via arbetsgivaren", text: "Försäkringar som ingår i din anställning." }] },
      { type: "band", title: "Har du frågor?", text: "Vi hjälper dig att hitta rätt skydd.", cta: { label: "Kontakta oss", href: "/info/kundservice" } },
    ],
  },
  "pension-hallbarhet": {
    title: "Hållbarhet i pensionen",
    lead: "Information om hur hållbarhet beaktas i pensionssparandet.",
    art: "leaf",
    risk: true,
    blocks: [
      RISK_TEXT,
      { type: "text", title: "Du bestämmer risken", paragraphs: ["Du väljer själv fonder och därmed risknivå. Det förvalda alternativet följer en åldersanpassad fördelning."] },
      { type: "features", title: "Hjälp att välja hållbart", cols: 3, items: [{ icon: "leaf", title: "Hållbarhetsfokus", text: "Fonder med uttalade hållbarhetsmål." }, { icon: "globe", title: "FN:s globala mål", text: "Fonder vars innehav bidrar till målen." }, { icon: "shield", title: "Miljömärkta fonder", text: "Fonder som uppfyller krav för miljömärkning." }] },
      { type: "features", title: "Analys av fondens innehav", cols: 2, items: [{ icon: "chart", title: "Hållbarhetsindikator", text: "Visar hur fondens innehav ligger till i hållbarhetsrisk." }, { icon: "percent", title: "Betyg i kategorin", text: "Jämför fonden med liknande fonder." }] },
    ],
  },
};
