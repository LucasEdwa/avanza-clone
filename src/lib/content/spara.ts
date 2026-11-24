import type { PageDef } from "./types";

const join = "/logga-in?ny=1";

export const SPARA: Record<string, PageDef> = {
  aktier: {
    title: "Så handlar du aktier",
    lead: "Allt du behöver för att köpa din första aktie: konto, order, courtage och vad som händer efter affären.",
    art: "chart",
    cta: { label: "Till aktiescreenern", href: "/marknad/aktier/screener" },
    risk: true,
    blocks: [
      {
        type: "steps",
        title: "Din första aktieaffär i fyra steg",
        items: [
          { title: "Öppna ett konto", text: "Välj ISK för enkel skatt, eller AF om du vill kunna dra av förluster." },
          { title: "Sätt in pengar", text: "Direktinsättning från din bank syns på kontot inom några sekunder." },
          { title: "Hitta aktien", text: "Sök på namn eller filtrera fram bolag i aktiescreenern." },
          { title: "Lägg en order", text: "Ange antal och pris. Ordern ligger i orderboken tills någon vill sälja till ditt pris." },
        ],
      },
      {
        type: "features",
        title: "Bra att veta om ordrar",
        items: [
          { icon: "percent", title: "Limitpris", text: "Du bestämmer högsta pris vid köp och lägsta pris vid sälj. Du får aldrig sämre pris än ditt limitpris." },
          { icon: "shield", title: "Stop loss", text: "En säljorder som aktiveras först när kursen faller till en nivå du bestämt." },
          { icon: "calendar", title: "Giltighetstid", text: "En order kan ligga kvar i upp till 30 dagar om den inte går igenom direkt." },
        ],
      },
      { type: "table", title: "Vad kostar det?", head: ["Courtageklass", "Avgift", "Lägst"], rows: [["Start", "0 kr upp till 50 000 kr", "0 kr"], ["Mini", "0,25 %", "1 kr"], ["Small", "0,15 %", "39 kr"], ["Medium", "0,069 %", "69 kr"], ["Fast pris", "99 kr per affär", "–"]], note: "Valutaväxling för utländska aktier: 0,25 %." },
      {
        type: "faq",
        items: [
          { q: "När dras pengarna?", a: "Beloppet reserveras när du lägger ordern och dras på likviddagen, två bankdagar efter affären." },
          { q: "Kan jag handla när börsen är stängd?", a: "Du kan lägga ordrar dygnet runt. De kan bara utföras när börsen har öppet." },
          { q: "Vad händer med utdelningar?", a: "Utdelningen sätts in på kontot där du äger aktien, automatiskt på utbetalningsdagen." },
        ],
      },
    ],
  },

  aktielan: {
    title: "Aktielån – extra intäkt på dina aktier",
    lead: "Dina aktier kan lånas ut till professionella aktörer medan du äger dem. Ersättningen delas med dig, utan att du behöver göra något.",
    art: "coins",
    risk: true,
    blocks: [
      { type: "split", title: "Hur fungerar det?", text: "Institutionella placerare lånar aktier för att till exempel kunna leverera vid en försäljning. De betalar en avgift för lånet, och den största delen av avgiften går tillbaka till dig som äger aktierna.", art: "handshake", bullets: ["Du äger aktierna hela tiden", "Du kan sälja som vanligt när du vill", "Utlåningen säkras med kollateral"] },
      { type: "features", cols: 3, items: [{ icon: "rocket", title: "Helt automatiskt", text: "Ingen anmälan eller administration. Ersättningen bokas på kontot." }, { icon: "coins", title: "Största delen till dig", text: "Du får merparten av intäkten. Spira behåller en mindre del för administrationen." }, { icon: "shield", title: "Trygg säkerhet", text: "Låntagaren ställer säkerhet som överstiger värdet på de lånade aktierna." }] },
      { type: "text", title: "Vill du inte vara med?", paragraphs: ["Du kan när som helst välja bort aktielån under Profil. Det påverkar inte din handel eller dina innehav på något annat sätt."] },
      { type: "notice", text: "Topplistan över de aktier som gett högst ersättning publiceras kvartalsvis när programmet startar i Spira." },
      {
        type: "faq",
        items: [
          { q: "Vilka konton omfattas?", a: "Aktie- & fondkonto och kapitalförsäkring. ISK omfattas inte i dagsläget." },
          { q: "Vilka aktier lånas ut?", a: "Främst aktier med hög efterfrågan bland låntagare, ofta större bolag på Stockholmsbörsen och i USA." },
          { q: "Hur ser jag ersättningen?", a: "Den visas som en transaktion av typen Avgift/Ersättning på kontot, normalt en gång i månaden." },
          { q: "Påverkas min rösträtt?", a: "Under tiden aktien är utlånad följer rösträtten med lånet. Aktien kallas tillbaka inför bolagsstämmor vid behov." },
        ],
      },
    ],
  },

  "egna-fonder": {
    title: "Våra egna fonder",
    lead: "Breda indexfonder med låg avgift, aktiva temafonder och räntefonder för den försiktiga delen av sparandet.",
    art: "growth",
    risk: true,
    blocks: [
      { type: "features", title: "Indexfonder", lead: "Följer marknaden till lägsta möjliga kostnad.", cols: 2, items: [{ icon: "chart", title: "Svenska indexfonder", text: "Hela Stockholmsbörsen eller de största bolagen, med avgift från 0,10 %." }, { icon: "globe", title: "Globala och regionala indexfonder", text: "Världen, USA, Europa eller tillväxtmarknader i en enda fond." }] },
      { type: "split", title: "Aktivt förvaltade tema- och branschfonder", text: "Låt förvaltare välja bolag inom ett tema, till exempel teknik eller hållbar energi. Högre avgift än indexfonder, men möjlighet att slå marknaden.", art: "rocket", cta: { label: "Se fonder", href: "/marknad/fonder/lista?kategori=aktiv" } },
      { type: "features", title: "Räntefonder", cols: 2, items: [{ icon: "shield", title: "Kort räntefond", text: "Låg risk och hög tillgänglighet. Ett alternativ till sparkonto för pengar du kan behöva inom ett par år." }, { icon: "globe", title: "Global räntefond", text: "Obligationer från stater och företag i hela världen, valutasäkrade till kronor." }] },
      { type: "band", title: "Ännu enklare med Autopilot", text: "Välj risknivå så sköter vi fördelningen mellan aktie- och räntefonder åt dig.", cta: { label: "Läs om Autopilot", href: "/info/autopilot" } },
    ],
  },

  fonder: {
    title: "Spara i fonder",
    lead: "Fonder är det enklaste sättet att sprida riskerna. Köp från 100 kr, utan courtage.",
    art: "growth",
    cta: { label: "Hitta din fond", href: "/marknad/fonder" },
    risk: true,
    blocks: [
      { type: "features", title: "Tre sätt att komma igång", items: [{ icon: "calendar", title: "Månadsspara", text: "Ett fast belopp varje månad som investeras automatiskt.", href: "/info/manadsspara" }, { icon: "rocket", title: "Autopilot", text: "Vi väljer och ombalanserar fonderna utifrån din risknivå.", href: "/info/autopilot" }, { icon: "chart", title: "Välj själv", text: "Jämför avgift, risk och avkastning i fondlistan.", href: "/marknad/fonder/lista" }] },
      { type: "widget", title: "Räkna på ditt sparande", widget: "savings-calculator" },
      { type: "split", title: "Kom igång snabbt", text: "Är du osäker på vilka fonder du ska välja är Autopilot ett bra första steg. Du väljer bara hur mycket risk du vill ta.", art: "rocket", reverse: true, cta: { label: "Testa Autopilot", href: "/info/autopilot" } },
      { type: "features", title: "Mer om fonder", items: [{ icon: "growth", title: "Börja spara i fonder", text: "Grunderna för dig som är ny.", href: "/info/skolan" }, { icon: "book", title: "Fondskolan", text: "Avgifter, risknivåer och fondtyper förklarat.", href: "/info/skolan" }, { icon: "move", title: "Flytta hit dina fonder", text: "Samla allt sparande på ett ställe.", href: "/info/flytta-vardepapper" }] },
      { type: "faq", items: [{ q: "Hur mycket avgift är rimligt?", a: "En global indexfond kostar ofta 0,1–0,4 % per år. Aktivt förvaltade fonder ligger oftare runt 1–1,5 %." }, { q: "Vad betyder risknivå 1–7?", a: "Hur mycket fondens värde har svängt historiskt. 1 är lägst, 7 är högst." }, { q: "När köps fonden?", a: "Ordrar som läggs före 15:00 en bankdag handlas till den dagens kurs." }] },
    ],
  },

  "borshandlade-produkter": {
    title: "Börshandlade produkter",
    lead: "ETF:er, certifikat, warranter, optioner och obligationer handlas på börsen precis som aktier.",
    art: "chart",
    risk: true,
    blocks: [
      { type: "features", title: "Hitta din produkt", cols: 3, items: [{ icon: "chart", title: "ETF:er", text: "Börshandlade fonder med låg avgift.", href: "/marknad/borshandlade-fonder" }, { icon: "rocket", title: "Bull & Bear", text: "Daglig hävstång uppåt eller nedåt.", href: "/marknad/produkter/bull-bear" }, { icon: "coins", title: "Trackers", text: "Följ index och råvaror utan hävstång.", href: "/marknad/produkter/trackers" }, { icon: "percent", title: "Mini Futures & Turbos", text: "Hävstång med stop loss-nivå.", href: "/marknad/produkter/mini-futures" }, { icon: "calendar", title: "Optioner & terminer", text: "Derivat med lösenpris och slutdag.", href: "/marknad/produkter/optioner" }, { icon: "shield", title: "Obligationer", text: "Räntebärande värdepapper.", href: "/marknad/produkter/obligationer" }] },
      { type: "text", title: "Varför börshandlade produkter?", paragraphs: ["De ger möjlighet att investera i hela marknader, råvaror och valutor, eller att ta en tydlig position på kort sikt med hävstång.", "Hävstångsprodukter är komplexa och passar inte för långsiktigt sparande. Du kan förlora hela insatsen."] },
      { type: "faq", items: [{ q: "Vad kostar det?", a: "Du betalar courtage enligt din courtageklass. Vissa produkter har också en löpande förvaltningsavgift." }, { q: "Hur köper jag?", a: "Precis som en aktie: sök fram produkten och lägg en order med antal och pris." }, { q: "Vilka risker finns?", a: "Utöver marknadsrisken finns emittentrisk, alltså att utgivaren inte kan betala." }, { q: "Behöver jag göra ett kunskapstest?", a: "Ja, för hävstångsprodukter behöver vi säkerställa att du förstår hur de fungerar." }] },
    ],
  },

  "spira-markets": {
    title: "Spira Markets",
    lead: "Börshandlade produkter med Spira som utgivare: trackers och hävstångsprodukter med låg spread.",
    art: "rocket",
    risk: true,
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "percent", title: "Låg spread", text: "Tät prissättning under hela handelsdagen." }, { icon: "coins", title: "0 kr courtage", text: "På affärer över 1 000 kr i Spira Markets-produkter." }, { icon: "chart", title: "Brett utbud", text: "Index, råvaror och valutor, uppåt och nedåt." }] },
      { type: "notice", text: "Spira Markets är ännu inte lanserat i demotjänsten." },
    ],
  },

  trackers: { title: "Trackers", lead: "Följ ett index eller en råvara ett-till-ett, utan hävstång.", art: "coins", risk: true, blocks: [{ type: "text", title: "Så fungerar en tracker", paragraphs: ["Värdet följer den underliggande tillgången. Stiger guldet 5 % stiger en guldtracker ungefär 5 %, minus avgifter.", "En tracker är ett certifikat, vilket innebär emittentrisk: värdet beror även på att utgivaren kan betala."] }, { type: "band", title: "Se alla trackers", text: "Lista med underliggande tillgång, spread och omsättning.", cta: { label: "Till listan", href: "/marknad/produkter/trackers" } }] },
  "bull-bear": { title: "Bull & Bear", lead: "Certifikat med fast daglig hävstång. Bull när du tror på uppgång, Bear på nedgång.", art: "rocket", risk: true, blocks: [{ type: "text", title: "Daglig hävstång", paragraphs: ["Hävstången nollställs varje dag. Över flera dagar kan utvecklingen därför skilja sig mycket från underliggande tillgång gånger hävstången.", "I en marknad som rör sig upp och ner utan tydlig riktning tappar certifikatet värde över tid."] }, { type: "band", title: "Se alla Bull & Bear", text: "Filtrera på underliggande och hävstång.", cta: { label: "Till listan", href: "/marknad/produkter/bull-bear" } }] },
  "mini-futures": { title: "Mini Futures", lead: "Hävstång utan daglig ombalansering, med en stop loss-nivå som skyddar mot negativt värde.", art: "percent", risk: true, blocks: [{ type: "text", title: "Hur fungerar stop loss-nivån?", paragraphs: ["Om underliggande tillgång når stop loss-nivån förfaller produkten. Ett eventuellt restvärde betalas ut.", "Hävstången ökar ju närmare kursen ligger stop loss-nivån."] }, { type: "band", title: "Se alla Mini Futures", text: "Lista med hävstång, stop loss och finansieringsnivå.", cta: { label: "Till listan", href: "/marknad/produkter/mini-futures" } }] },
  turbos: { title: "Unlimited Turbos", lead: "Hävstångsprodukt utan löptid där knock out-nivån sammanfaller med finansieringsnivån.", art: "rocket", risk: true, blocks: [{ type: "text", title: "Högre hävstång, högre risk", paragraphs: ["Om knock out-nivån nås förfaller produkten utan restvärde.", "Passar den som följer marknaden nära och vill ha stor exponering med litet kapital."] }, { type: "band", title: "Se alla Turbos", text: "Lista med knock out-nivå och hävstång.", cta: { label: "Till listan", href: "/marknad/produkter/turbos" } }] },
  optioner: { title: "Optioner & terminer", lead: "Standardiserade derivat på aktier och index med lösenpris och slutdag.", art: "calendar", risk: true, blocks: [{ type: "features", cols: 2, items: [{ icon: "chart", title: "Köpoption", text: "Rätt att köpa till lösenpriset. Värdet stiger när aktien stiger." }, { icon: "shield", title: "Säljoption", text: "Rätt att sälja till lösenpriset. Fungerar som ett skydd vid nedgång." }] }, { type: "text", title: "Utfärda optioner", paragraphs: ["Den som säljer (utfärdar) en option får en premie men tar på sig en skyldighet. Förlusten kan bli större än premien och kräver säkerhet på kontot."] }, { type: "band", title: "Se optionslistan", text: "Köp- och säljoptioner per underliggande och slutdag.", cta: { label: "Till listan", href: "/marknad/produkter/optioner" } }] },
  obligationer: { title: "Obligationer", lead: "Lån till stater och företag som ger ränta och pengarna tillbaka på förfallodagen.", art: "shield", risk: true, blocks: [{ type: "features", cols: 3, items: [{ icon: "shield", title: "Statsobligationer", text: "Lägst risk. Avkastningen följer marknadsräntan." }, { icon: "building", title: "Företagsobligationer", text: "Högre ränta som ersättning för kreditrisken." }, { icon: "calendar", title: "Förfallodag", text: "Behåller du till förfall får du nominellt belopp tillbaka." }] }, { type: "band", title: "Se noterade obligationer", text: "Köp, sälj och senast betalt.", cta: { label: "Till listan", href: "/marknad/produkter/obligationer" } }] },
  "ratter-teckningsoptioner": {
    title: "Rätter, teckningsoptioner & BTA",
    lead: "Värdepapper som uppstår vid nyemissioner. Så fungerar de och vad du behöver göra.",
    art: "calendar",
    risk: true,
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "percent", title: "Teckningsrätter (TR)", text: "Ger rätt att teckna nya aktier, ofta till rabatt. Använd eller sälj dem före sista dag, annars förfaller de." }, { icon: "coins", title: "Betalda tecknade aktier (BTA)", text: "Det du får efter teckning. Omvandlas till vanliga aktier när emissionen registrerats." }, { icon: "calendar", title: "Teckningsoptioner (TO)", text: "Rätt att köpa aktier till ett bestämt pris under en period längre fram." }] },
      { type: "band", title: "Se rätter som handlas nu", text: "Lista med köp, sälj och senast betalt.", cta: { label: "Till listan", href: "/marknad/produkter/ratter" } },
    ],
  },

  autopilot: {
    title: "Spira Autopilot",
    lead: "Ett färdigt fondsparande som anpassas efter hur mycket risk du vill ta. Vi sköter fördelning och ombalansering.",
    art: "rocket",
    cta: { label: "Kom igång", href: join },
    risk: true,
    blocks: [
      { type: "split", title: "Vetenskapligt beprövad riskspridning", text: "Autopilot bygger på modern portföljteori: genom att blanda tillgångar som inte rör sig i takt kan du få samma förväntade avkastning med lägre risk.", art: "chart" },
      { type: "stats", title: "En låg avgift för allt", items: [{ value: "0,15 %", label: "årlig avgift, allt inräknat" }, { value: "0 kr", label: "courtage och insättningsavgift" }, { value: "100 kr", label: "lägsta månadsbelopp" }, { value: "4 ggr/år", label: "automatisk ombalansering" }] },
      { type: "widget", title: "Hitta rätt nivå för ditt sparande", widget: "autopilot-levels" },
      {
        type: "faq",
        items: [
          { q: "Vad är Autopilot för produkt?", a: "En fondportfölj som består av indexnära aktie- och räntefonder i en fast fördelning per risknivå." },
          { q: "Vad är modern portföljteori?", a: "En teori om hur man kombinerar tillgångar för att få bästa möjliga förväntade avkastning för en viss risk." },
          { q: "Kan jag köpa utan att månadsspara?", a: "Ja, du kan göra engångsinsättningar och komplettera med månadssparande när du vill." },
          { q: "Vilka konton kan jag spara på?", a: "ISK, kapitalförsäkring och pensionskonton." },
          { q: "Kan jag byta nivå?", a: "Ja, när som helst. Bytet sker utan kostnad nästa handelsdag." },
          { q: "Är detta en rekommendation?", a: "Nej, nivåerna är exempel. Välj nivå efter din egen tidshorisont och riskvilja." },
        ],
      },
    ],
  },

  vardepapperskredit: {
    title: "Få hävstång på ditt sparande",
    lead: "Med en värdepapperskredit kan du låna med dina aktier och fonder som säkerhet och investera mer.",
    art: "percent",
    risk: true,
    blocks: [
      { type: "features", cols: 4, items: [{ icon: "rocket", title: "Hävstång", text: "Större exponering mot marknaden med samma eget kapital." }, { icon: "calendar", title: "Flexibelt", text: "Låna och betala tillbaka när du vill, utan bindningstid." }, { icon: "chart", title: "Långsiktigt", text: "Fungerar bäst för långsiktigt sparande i breda innehav." }, { icon: "percent", title: "Räkneexempel", text: "Se nedan hur lån påverkar resultatet." }] },
      { type: "widget", title: "Räkneexempel", widget: "credit-calculator" },
      { type: "features", title: "Så kan du tänka kring risk", items: [{ icon: "chart", title: "Spara långsiktigt", text: "Kortsiktiga svängningar kan tvinga fram försäljning vid fel tillfälle." }, { icon: "globe", title: "Sprid riskerna", text: "Breda fonder har ofta högre belåningsvärde och lägre risk än enskilda aktier." }, { icon: "shield", title: "Låna lagom", text: "Använd en liten del av belåningsutrymmet så tål du nedgångar." }] },
      { type: "text", title: "Att låna kostar pengar", paragraphs: ["Räntan räknas dagligen på den del du lånar. Avkastningen behöver vara högre än räntan för att belåningen ska löna sig.", "Faller värdet på dina värdepapper under belåningsvärdet får du ett marginalkrav och behöver sätta in pengar eller sälja."] },
      { type: "steps", title: "Hur funkar det i praktiken?", items: [{ title: "Ansök", text: "Ansökan görs digitalt och signeras med BankID." }, { title: "Se ditt utrymme", text: "Köpkraften ökar med belåningsvärdet för dina innehav." }, { title: "Handla", text: "Köp som vanligt. Lånet uppstår automatiskt när saldot blir negativt." }] },
      {
        type: "faq",
        items: [
          { q: "Vad är belåningsvärde?", a: "Hur stor andel av ett värdepappers värde du kan låna. Stora bolag har högre belåningsvärde än små." },
          { q: "Vad är ett marginalkrav?", a: "När skulden blir större än belåningsvärdet måste du minska skulden inom kort tid." },
          { q: "Vilka konton kan belånas?", a: "Aktie- & fondkonto och kapitalförsäkring." },
          { q: "Hur får jag rabatt på räntan?", a: "Räntan sänks i nivåer ju mer kapital du har hos oss, se tabellen i räkneexemplet." },
        ],
      },
    ],
  },

  manadsspara: {
    title: "Börja månadsspara",
    lead: "Spara ett fast belopp varje månad, i fonder eller på sparkonto. Pengarna dras automatiskt via autogiro.",
    art: "calendar",
    cta: { label: "Starta månadssparande", href: "/min-ekonomi/manadsspara" },
    risk: true,
    blocks: [
      { type: "features", title: "Fonder eller sparkonto?", cols: 2, items: [{ icon: "growth", title: "Fonder – för 3 år eller längre", text: "Högre förväntad avkastning men värdet svänger. Passar långsiktiga mål som pension.", href: "/marknad/fonder" }, { icon: "shield", title: "Sparkonto – för 0–3 år", text: "Fast ränta utan svängningar. Passar buffert och kortsiktiga mål.", href: "/info/sparkonto" }] },
      { type: "widget", title: "Räkna på ditt sparande", widget: "savings-calculator" },
      { type: "split", title: "Kom igång snabbt med Autopilot", text: "Välj belopp och risknivå. Autopilot fördelar pengarna mellan aktie- och räntefonder åt dig.", art: "rocket", cta: { label: "Läs mer", href: "/info/autopilot" } },
      {
        type: "faq",
        items: [
          { q: "Hur mycket ska jag spara?", a: "En tumregel är 10 % av lönen efter skatt, men börja med ett belopp som känns bekvämt och öka med tiden." },
          { q: "Kan jag pausa?", a: "Ja, pausa, ändra eller avsluta under Min ekonomi när du vill." },
          { q: "När köps fonderna?", a: "Samma dag som pengarna kommit in, till fondens kurs den dagen." },
          { q: "Kostar det något?", a: "Nej, det finns inga avgifter för månadssparande. Fondernas egna avgifter tillkommer." },
          { q: "Vilken dag dras pengarna?", a: "Den dag du väljer mellan 1 och 28. Infaller den på en helg dras pengarna nästa bankdag." },
        ],
      },
    ],
  },

  sparkonto: {
    title: "Sparkonto med ränta från första kronan",
    lead: "Rörlig ränta som betalas ut varje månad, fria uttag och inga avgifter.",
    art: "coins",
    cta: { label: "Öppna sparkonto", href: "/min-ekonomi/oppna-konto" },
    blocks: [
      { type: "table", title: "Det här ingår", head: ["", "Spira Sparkonto"], rows: [["Ränta", "2,25 % rörlig (exempel)"], ["Bindningstid", "Ingen"], ["Räntebetalning", "Varje månad"], ["Överföring mellan egna konton", "Direkt, även kvällar och helger"], ["Insättningsgaranti", "Ja (i verkligheten)"], ["Månadsspara med autogiro", "Ja"], ["Uttag till annan bank", "1–2 bankdagar"]] },
      {
        type: "faq",
        items: [
          { q: "Har jag insättningsgaranti?", a: "Ett riktigt sparkonto hos en svensk bank omfattas av insättningsgarantin upp till 1 050 000 kr. Spira är en demo." },
          { q: "Kostar det något?", a: "Nej, det är gratis att öppna och ha sparkontot." },
          { q: "Kan jag månadsspara?", a: "Ja, via autogiro från ditt kopplade bankkonto." },
          { q: "Vem kan öppna ett sparkonto?", a: "Alla kunder som fyllt 18 år. För barn öppnar vårdnadshavaren kontot." },
          { q: "Hur lång tid tar ett uttag?", a: "Till dina andra konton hos oss sker det direkt, till annan bank tar det 1–2 bankdagar." },
          { q: "När betalas räntan ut?", a: "Räntan beräknas dagligen och betalas ut i början av varje månad." },
          { q: "Kan vi ha ett gemensamt konto?", a: "Inte i dagsläget. Varje konto har en ägare." },
          { q: "Vad händer om räntan ändras?", a: "Den nya räntan gäller från ändringsdagen. Vi meddelar i förväg." },
        ],
      },
      { type: "band", title: "Vill du ha högre avkastning?", text: "För pengar du inte behöver de närmaste åren kan fonder passa bättre.", cta: { label: "Spara i fonder", href: "/info/fonder" } },
    ],
  },

  "spara-till-barn": {
    title: "Spara till barnen",
    lead: "Ge dem en bra start i livet. Ett litet belopp varje månad växer till en stor summa på 18 år.",
    art: "kids",
    cta: { label: "Börja spara", href: join },
    risk: true,
    blocks: [
      { type: "features", cols: 3, items: [{ icon: "coins", title: "Inga kontoavgifter", text: "Det kostar ingenting att ha ett barnsparande hos oss." }, { icon: "calendar", title: "Spara valfritt belopp", text: "Från 100 kr i månaden, eller sätt in en slant när det passar." }, { icon: "shield", title: "Ingen inlåsning", text: "Sparar du i eget namn kan du ta ut pengarna när du vill." }] },
      { type: "widget", title: "Så mycket kan det bli", lead: "Barnbidraget i en global indexfond i 18 år kan bli en ordentlig startpott.", widget: "savings-calculator" },
      { type: "features", title: "Välj rätt konto", cols: 2, items: [{ icon: "pension", title: "Spara i eget namn", text: "Du äger pengarna och bestämmer när de ska ges till barnet. Enklast att komma igång." }, { icon: "kids", title: "Spara i barnets namn", text: "Pengarna tillhör barnet och förvaltas av vårdnadshavarna fram till 18 år. Båda vårdnadshavare behöver godkänna." }] },
      {
        type: "faq",
        items: [
          { q: "Hur mycket ska man spara?", a: "Många sparar hela eller delar av barnbidraget. Viktigast är att börja tidigt." },
          { q: "Hur tar jag ut pengar från barnets konto?", a: "Uttag från barnets konto kräver att pengarna används till barnets bästa och godkänns av båda vårdnadshavarna." },
          { q: "Kan mor- och farföräldrar spara?", a: "Ja, de kan sätta in pengar på barnets konto eller ge värdepapper i gåva." },
          { q: "Vilket konto är bäst?", a: "ISK är vanligast eftersom skatten är låg och inget behöver deklareras." },
        ],
      },
      { type: "band", title: "Ge värdepapper i present", text: "Ge bort aktier eller fonder till barn och barnbarn.", cta: { label: "Så gör du", href: "/info/gava" } },
    ],
  },

  "flytta-vardepapper": {
    title: "Flytta aktier och fonder till oss",
    lead: "Samla allt sparande på ett ställe. Vi hämtar dina värdepapper från din nuvarande bank utan att något säljs, och du behåller ditt anskaffningsvärde.",
    art: "move",
    cta: { label: "Starta flytt", href: join },
    blocks: [
      { type: "steps", title: "Så går en flytt till", items: [{ title: "Fyll i flytten", text: "Ange bank och vilka innehav som ska flyttas." }, { title: "Signera med BankID", text: "Fullmakten skickas digitalt till din nuvarande bank." }, { title: "Vänta 1–3 veckor", text: "Innehaven dyker upp på ditt konto när flytten är klar." }] },
      {
        type: "faq",
        title: "Bra att veta när du flyttar",
        items: [
          { q: "Kostar det något?", a: "Vi tar inte betalt. Vissa banker tar ut en avgift för att flytta ut värdepapper." },
          { q: "Kan jag flytta mellan olika kontotyper?", a: "Mellan likadana kontotyper går det bra. Från AF till ISK räknas som försäljning och insättning." },
          { q: "Flyttas GAV?", a: "Ja, vi registrerar anskaffningsvärdet så att skatteberäkningen blir rätt." },
          { q: "Kan jag handla under flytten?", a: "Innehav som är under flytt kan inte säljas förrän de syns på ditt konto hos oss." },
          { q: "Kan fonder flyttas?", a: "De flesta fonder går att flytta. Fonder som inte finns hos oss säljs och pengarna flyttas." },
          { q: "Flyttar ni ISK?", a: "Ja, hela kontot kan flyttas utan att det räknas som uttag." },
          { q: "Hur flyttar jag pension?", a: "Pensionsflytt görs separat.", },
        ],
      },
    ],
  },

  gava: {
    title: "Ge en present som kan växa",
    lead: "Ge bort aktier eller fonder till någon du tycker om, till exempel barn eller barnbarn.",
    art: "gift",
    blocks: [
      { type: "steps", title: "Så här gör du", items: [{ title: "Välj värdepapper", text: "Välj innehav och antal du vill ge bort." }, { title: "Ange mottagare", text: "Mottagaren behöver vara kund. Ange personnummer och konto." }, { title: "Signera", text: "Skriv under gåvobrevet med BankID." }] },
      {
        type: "faq",
        items: [
          { q: "Hur lång tid tar överföringen?", a: "Normalt några bankdagar." },
          { q: "Kostar det något?", a: "Nej, överföringar mellan kunder är kostnadsfria." },
          { q: "Vilket värde gäller?", a: "Värdet vid överföringstillfället. Mottagaren tar över ditt anskaffningsvärde." },
          { q: "Påverkas mottagarens schablonskatt?", a: "Ja, på ISK räknas gåvan som en insättning hos mottagaren." },
          { q: "Mellan vilka konton kan jag ge?", a: "ISK till ISK, AF till AF och KF till KF. Andra kombinationer kan kräva försäljning." },
        ],
      },
    ],
  },

  emissioner: {
    title: "Börsintroduktioner och emissioner",
    lead: "Teckna aktier när bolag noteras eller tar in nytt kapital, direkt i Spira.",
    art: "rocket",
    risk: true,
    blocks: [
      { type: "notice", text: "Just nu finns det inga aktuella erbjudanden. Nya erbjudanden visas här och i notiser." },
      { type: "split", title: "Vill ditt bolag ta in kapital?", text: "Vi hjälper bolag med börsnoteringar och emissioner riktade till privatpersoner.", art: "building", cta: { label: "Corporate Finance", href: "/info/corporate-finance" } },
      {
        type: "faq",
        items: [
          { q: "Hur ser jag om jag svarat på ett erbjudande?", a: "Under Min ekonomi → Ordrar visas dina anmälningar." },
          { q: "Om jag köper teckningsrätter, behöver jag göra något mer?", a: "Ja, rätterna måste användas för att teckna aktier före teckningsperiodens slut." },
          { q: "Vad är en teckningsoption?", a: "En rätt att köpa nya aktier till ett bestämt pris under en period längre fram." },
          { q: "Vad är TR och BTA?", a: "TR = teckningsrätt, BTA = betald tecknad aktie. BTA blir vanliga aktier när emissionen registrerats." },
          { q: "När får jag besked om tilldelning?", a: "Oftast samma dag som första handelsdag. Du får en notis." },
          { q: "Kan jag teckna på ISK?", a: "Ja, de flesta erbjudanden kan tecknas på ISK, AF och KF." },
          { q: "Vad är en spridningsemission?", a: "En emission där bolaget vill få många nya aktieägare inför en notering." },
          { q: "Vad händer om jag inte gör något?", a: "Teckningsrätter förfaller utan värde efter sista handelsdag om du varken säljer eller tecknar." },
        ],
      },
    ],
  },

  hallbart: {
    title: "Spara hållbart",
    lead: "Välj fonder och bolag som tar hänsyn till miljö, människor och god bolagsstyrning.",
    art: "leaf",
    risk: true,
    blocks: [
      { type: "features", title: "Hitta hållbara fonder", cols: 4, items: [{ icon: "leaf", title: "Miljö och hållbarhet", text: "Fonder med tydligt hållbarhetsfokus.", href: "/marknad/fonder/lista?kategori=hallbar" }, { icon: "globe", title: "Hållbara globalfonder", text: "Bred spridning med hållbarhetsurval.", href: "/marknad/fonder/lista?kategori=global" }, { icon: "chart", title: "Hållbara indexfonder", text: "Låg avgift med uteslutningar.", href: "/marknad/fonder/lista?kategori=index" }, { icon: "growth", title: "Bäst utveckling", text: "Hållbara fonder sorterade på avkastning.", href: "/marknad/fonder/lista?kategori=hallbar&sort=-y3" }] },
      { type: "text", title: "Hjälp att välja", paragraphs: ["Titta på fondens hållbarhetsinformation enligt EU:s regler (artikel 8 eller 9), vilka branscher den väljer bort och hur den påverkar bolagen den äger.", "Hållbarhetsbetyg från externa analyshus finns inte i demotjänsten."] },
    ],
  },

  "private-banking": { title: "Private Banking", lead: "För dig med minst 5 miljoner kronor i kapital: personlig kontakt, lägre avgifter och fler möjligheter.", art: "briefcase", blocks: [{ type: "features", cols: 3, items: [{ icon: "handshake", title: "Personlig kontakt", text: "En egen kontaktperson för frågor om ditt sparande." }, { icon: "percent", title: "Lägre courtage", text: "Courtage från 0,025 % och ränterabatt på bolån." }, { icon: "chart", title: "Förvaltning", text: "Möjlighet till diskretionär förvaltning av hela eller delar av portföljen." }] }, { type: "band", title: "Portföljförvaltning", text: "Låt oss sköta förvaltningen utifrån dina mål.", cta: { label: "Läs mer", href: "/info/portfoljforvaltning" } }] },
  pro: { title: "Pro", lead: "För dig som handlar ofta och vill ha snabba verktyg och låga kostnader.", art: "rocket", blocks: [{ type: "features", cols: 3, items: [{ icon: "chart", title: "Avancerade grafer", text: "Tekniska indikatorer och ritverktyg." }, { icon: "rocket", title: "Snabb orderläggning", text: "Ordrar med ett klick och tangentbordsgenvägar." }, { icon: "percent", title: "Volymrabatt", text: "Lägre courtage ju mer du handlar." }] }] },
  portfoljforvaltning: {
    title: "Portföljförvaltning",
    lead: "Du sätter målet, vi sköter förvaltningen. Smart data och tydliga avgifter.",
    art: "briefcase",
    risk: true,
    blocks: [
      { type: "split", title: "Hjälp även för företag", text: "Portföljförvaltningen finns för både privatpersoner och företag som vill placera överskottslikviditet.", art: "building" },
      { type: "widget", title: "Välj inriktning och se avgiften", widget: "portfolio-fee" },
      { type: "features", title: "Varför välja portföljförvaltning?", cols: 3, items: [{ icon: "chart", title: "Datadriven", text: "Fördelningen justeras löpande utifrån marknadsdata och riskmodeller." }, { icon: "shield", title: "Transparent", text: "Du ser alla innehav och transaktioner löpande." }, { icon: "percent", title: "Låg avgift", text: "En fast årlig avgift som täcker allt." }] },
      { type: "faq", items: [{ q: "Hur mycket behöver jag?", a: "Lägsta belopp är 1 miljon kronor." }, { q: "Kan jag byta inriktning?", a: "Ja, du kan byta mellan Mix och Stabil när du vill." }, { q: "Vilka konton kan jag använda?", a: "Kapitalförsäkring, ISK och företagskonton." }, { q: "Hur rapporteras resultatet?", a: "Du får en kvartalsrapport och kan följa utvecklingen dagligen." }] },
    ],
  },
  valutakonto: {
    title: "Valutakonto på kapitalförsäkring",
    lead: "Ha amerikanska dollar och euro direkt på kontot och slipp växla vid varje affär.",
    art: "globe",
    blocks: [
      {
        type: "faq",
        title: "Vanliga frågor om valutaväxling",
        items: [
          { q: "Vilka valutor kan jag ha?", a: "USD, EUR, NOK och DKK." },
          { q: "Manuell eller automatisk växling?", a: "Vid automatisk växling sker växlingen vid varje affär. Manuellt väljer du själv när du växlar." },
          { q: "Vad kostar det att växla?", a: "0,25 % av beloppet, samma som vid automatisk växling." },
          { q: "Kan jag växla mellan två utländska valutor?", a: "Ja, till exempel från USD till EUR." },
          { q: "Kan jag köpa utländska aktier utan att växla?", a: "Ja, om du har tillräckligt i rätt valuta används den först." },
          { q: "Får jag utdelningar i valuta?", a: "Ja, utdelningar betalas ut i aktiens valuta till valutakontot." },
        ],
      },
    ],
  },

  foretagstjanster: {
    title: "Företagstjänster",
    lead: "Allt ditt företag behöver för att placera, ta in kapital och sköta pensioner.",
    art: "building",
    blocks: [
      {
        type: "features",
        cols: 3,
        items: [
          { icon: "briefcase", title: "Portföljförvaltning", text: "Låt oss förvalta företagets överskott.", href: "/info/portfoljforvaltning" },
          { icon: "building", title: "Vilande bolag", text: "Placera kapitalet i ett bolag utan verksamhet.", href: "/info/vilande-bolag" },
          { icon: "umbrella", title: "Gruppförsäkringar", text: "Försäkringar för anställda.", href: "/info/gruppforsakring" },
          { icon: "pension", title: "Tjänstepension", text: "Pensionslösningar för anställda och ägare.", href: "/info/tjanstepension-foretag" },
          { icon: "coins", title: "Företagskonton", text: "Kapitalförsäkring, AF och sparkonto för företag.", href: "/info/foretagskonto" },
          { icon: "handshake", title: "Corporate Finance", text: "Kapitalanskaffning och rådgivning.", href: "/info/corporate-finance" },
          { icon: "calendar", title: "Emissionsinstitut", text: "Vi hanterar teckning och tilldelning.", href: "/info/emissionsinstitut" },
          { icon: "briefcase", title: "Administrera pension", text: "Företagswebben för arbetsgivare.", href: "/info/foretagswebben" },
          { icon: "growth", title: "Enskild firma", text: "Spara privat med kopplat företagsflöde." },
        ],
      },
    ],
  },
  foretagskonto: {
    title: "Företagskonton",
    lead: "Låt företagets överskott arbeta. Välj kontotyp efter hur du vill beskattas.",
    art: "building",
    risk: true,
    blocks: [
      { type: "text", title: "Spara företagets överskott", paragraphs: ["Pengar som ligger still på ett företagskonto i banken växer inte. Genom att placera dem kan bolaget få avkastning samtidigt som pengarna finns tillgängliga."] },
      { type: "table", title: "Jämför företagskonton", head: ["", "Kapitalförsäkring", "Aktie- & fondkonto", "Sparkonto"], rows: [["Beskattning", "Avkastningsskatt (schablon)", "Bolagsskatt på vinst", "Bolagsskatt på ränta"], ["Bokföring", "Enkel, ett värde per år", "Varje affär bokförs", "Enkel"], ["Passar för", "Långsiktigt sparande", "Aktiv handel", "Likviditetsreserv"], ["Ränta / avkastning", "Marknadens", "Marknadens", "1,55 % (exempel)"]] },
      { type: "features", title: "Pension för ditt företag", cols: 2, items: [{ icon: "pension", title: "Tjänstepension", text: "Avdragsgill pensionsavsättning för anställda och ägare.", href: "/info/tjanstepension-foretag" }, { icon: "briefcase", title: "Direktpension", text: "Pensionslöfte som tryggas genom en kapitalförsäkring i bolaget." }] },
      { type: "faq", items: [{ q: "Vad behöver mitt företag för att börja?", a: "Registreringsbevis, uppgifter om verklig huvudman och firmatecknares BankID." }, { q: "Kan enskild firma öppna konto?", a: "Enskild firma sparar privat i ägarens namn." }, { q: "Vem kan signera?", a: "Firmatecknare enligt registreringsbeviset." }, { q: "Kostar det något?", a: "Inga kontoavgifter, courtage enligt prislistan." }] },
    ],
  },
  "corporate-finance": {
    title: "Corporate Finance",
    lead: "Rådgivning till bolag som vill ta in kapital, notera sig eller genomföra förvärv.",
    art: "handshake",
    blocks: [
      { type: "features", title: "Allt på ett ställe", cols: 3, items: [{ icon: "building", title: "En samlad partner", text: "Från förberedelse till notering och efterhandel." }, { icon: "globe", title: "Stor räckvidd", text: "Nå tusentals privatinvesterare direkt i plattformen." }, { icon: "handshake", title: "Personlig kontakt", text: "Samma team genom hela processen." }] },
      { type: "features", title: "Våra tjänster", cols: 2, items: [{ icon: "coins", title: "Kapitalanskaffning (ECM)", text: "Nyemissioner, börsnoteringar och placeringar." }, { icon: "handshake", title: "Förvärv och fusioner (M&A)", text: "Rådgivning vid köp och försäljning av bolag." }, { icon: "percent", title: "Skuldfinansiering (DCM)", text: "Obligationslån och andra skuldinstrument." }, { icon: "briefcase", title: "Övrig rådgivning", text: "Värderingar, fairness opinions och strategiska analyser." }] },
      { type: "band", title: "Kontakta oss", text: "Berätta om ditt bolag så hör vi av oss.", cta: { label: "Kontakt", href: "/info/kundservice" } },
    ],
  },
  emissionsinstitut: {
    title: "Emissionsinstitut",
    lead: "Vi hanterar de praktiska delarna av din emission: teckning, tilldelning, betalning och registrering.",
    art: "calendar",
    blocks: [
      { type: "features", title: "Tjänster vi erbjuder", cols: 3, items: [{ icon: "shield", title: "Euroclearanslutning", text: "Anslut bolagets aktier till det svenska avstämningssystemet." }, { icon: "coins", title: "Företrädesemission", text: "Emission där befintliga ägare får teckna först." }, { icon: "handshake", title: "Företagsförvärv", text: "Hantering av likvid och aktier vid uppköp." }, { icon: "move", title: "Inlösenprogram", text: "Utbetalning till aktieägare via inlösen." }, { icon: "rocket", title: "Spridningsemission", text: "Inför notering för att få fler ägare." }, { icon: "briefcase", title: "Riktad emission", text: "Emission till utvalda investerare." }] },
      { type: "text", title: "Oberoende och erfaret", paragraphs: ["Vi arbetar oberoende av rådgivare och kan därför samarbeta med alla aktörer i en transaktion.", "Lång erfarenhet och en stor kundbas gör att erbjudanden når ut brett."] },
      { type: "band", title: "Kontakta oss", text: "Vi återkommer med en offert.", cta: { label: "Kontakt", href: "/info/kundservice" } },
    ],
  },
  "vilande-bolag": {
    title: "Smart förvaltning för vilande bolag",
    lead: "Har bolaget ingen verksamhet just nu? Låt kapitalet arbeta till låg kostnad i stället för att ligga på ett bankkonto.",
    art: "building",
    risk: true,
    blocks: [
      { type: "steps", title: "Så fungerar det", items: [{ title: "Sätt bolaget som vilande", text: "Bolaget bedriver ingen aktiv verksamhet men finns kvar." }, { title: "Kostnadsfri skatterådgivning", text: "Vi går igenom vilken kontotyp som passar." }, { title: "Öppna konto", text: "Kapitalförsäkring eller aktie- & fondkonto." }, { title: "Välj placering", text: "Portföljförvaltning, fonder eller sparkonto." }] },
      { type: "faq", items: [{ q: "Finns det fler fördelar?", a: "Kapitalet växer medan du bestämmer framtiden för bolaget." }, { q: "Gäller andra skatteregler?", a: "Bolaget beskattas som vanligt. Kapitalförsäkring förenklar bokföringen." }, { q: "Vilken kontotyp passar?", a: "Kapitalförsäkring är vanligast för vilande bolag." }, { q: "Vilka placeringar finns?", a: "Portföljförvaltning, fonder, räntefonder eller sparkonto." }, { q: "Finns det avgifter?", a: "Inga kontoavgifter. Fondavgifter eller förvaltningsavgift tillkommer." }] },
    ],
  },

  konton: {
    title: "Konton",
    lead: "Vilket konto passar dig? Skillnaden handlar om skatt, deklaration och förmånstagare.",
    art: "shield",
    cta: { label: "Öppna konto", href: join },
    blocks: [
      { type: "widget", widget: "accounts" },
      { type: "features", cols: 4, items: [{ icon: "growth", title: "Investeringssparkonto", text: "Schablonskatt, inga deklarationer av affärer.", href: "/info/isk" }, { icon: "umbrella", title: "Kapitalförsäkring", text: "Förmånstagare och avkastningsskatt.", href: "/info/kf" }, { icon: "chart", title: "Aktie- & fondkonto", text: "Vinstskatt och avdrag för förluster.", href: "/info/af" }, { icon: "coins", title: "Sparkonto", text: "Ränta varje månad.", href: "/info/sparkonto" }] },
    ],
  },
  prislista: {
    title: "Prislista",
    lead: "Inga fasta avgifter. Du betalar bara när du handlar aktier och ETF:er.",
    art: "percent",
    blocks: [{ type: "widget", widget: "pricelist" }, { type: "faq", items: [{ q: "Hur väljer jag courtageklass?", a: "Mini passar affärer upp till ca 15 600 kr, Small 15 600–46 000 kr, Medium 46 000–143 500 kr och Fast pris större affärer." }, { q: "Kostar fonder något?", a: "Fonder köps utan courtage. Fondbolagets förvaltningsavgift ingår i fondens kurs." }] }],
  },
  oppettider: {
    title: "Öppettider & handelskalender",
    lead: "När har börserna öppet, och vilka dagar avviker?",
    art: "calendar",
    blocks: [{ type: "widget", title: "Börsens öppettider", widget: "trading-calendar" }],
  },
};
