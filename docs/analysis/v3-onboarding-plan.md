# Plan voor de eerste stappen in Active Animation

Datum: 21 oktober 2026. Status: geïmplementeerd en door de eigenaar aanvaard (D179) op `codex/guided-first-play` (D178 / V3-F021). Zie het [log Game design goal achieved](../../V3_DELIVERY.md#owner-assessment-log--v34-game-design-goal-achieved).

Dit plan behandelt [UT-001](../../USER_TESTING_FEEDBACK.md): de eerste ervaring bevat te veel informatie tegelijk. Het doel is dat een nieuwe bezoeker begrijpt hoe systemen inkomen opleveren, waarom onderhoud developers bezighoudt en hoe Recon capaciteit vrijmaakt. De begeleiding maakt deel uit van de echte spelronde en laat de animatie ook voor toeschouwers leesbaar blijven.

## Aanvulling: drie korte plaatsaanduidingen (D190–D192)

De eigenaar wees de banner en vierdelige tour uit D189 af: te veel knoppen, te traag en te veel uitleg. De vervanging toont alleen drie korte labels: “Your ecosystem”, “This is where your developers work.” en “These are your game controls.” D192 omkadert de volledige ecosystemzone bij de eerste stap en geeft die drie seconden; de andere twee stappen blijven twee seconden zichtbaar, naast het betrokken onderdeel, met duidelijke gouden accenten en een gedimde omgeving. De aankoopknoppen worden één keer samen benadrukt. D191 herstelt het welkomstvenster met één grote, opvallende knop Get your intro. Het venster wacht tot een bezoeker klikt; pas dan start de reeks. Geen navigatie, banner of uitleg over de spelmechaniek; de bestaande hints tijdens het spelen nemen dat over. Na de drie aanduidingen volgt automatisch de countdown; er is geen tweede Start-knop. Klok en economie blijven stil tot GO. Vernieuwen, Start fresh en Play again tonen opnieuw het welkomstvenster.

## Voorgestelde aanpak

Laat de speler één samenhangende handeling volgen: kopen, bouwen, installeren en inkomen zien. Introduceer daarna de volgende relevante keuze. Gebruik echte gebeurtenissen als aanleiding voor korte uitleg, met één duidelijke visuele focus. De voorgestelde volgorde is een voorkeursroute; andere aankopen blijven mogelijk.

De eerste uitvoering combineert begeleiding, een rustiger featurepalet en een uitgestelde introductie van featurewerk. De eigenaar koos tijdens de mondelinge review expliciet voor zowel zachter blauw als later beginnen met features. Prijzen, lonen, bouwtijden, storingen, reparaties en het doel van 1.200 credits volgen de huidige spelregels. De uitgestelde features veranderen de vroege inkomsten en taakverdeling; daarom hoort een nieuwe balanscontrole bij deze uitvoering.

Tijdens de review zijn de eenvoudige opening, volledige eerste bouwketen, hiring bij wachtend werk, eerste onderhoudsuitleg en nadruk op de eerste echte Recon-reparatie gekozen om te proberen. De spelronde blijft tijdens uitleg doorlopen. De eigenaar heeft de samenvatting goedgekeurd en gevraagd om een nieuwe branch en implementatie.

## De eerste spelronde

De voorbeeldteksten hieronder zijn Engels, zoals de huidige interface. Het zijn concrete tekstvoorstellen voor de eerste uitvoering.

### 1 Start met een eenvoudige opdracht

Behoud de titel en slogan. D191 vervangt **Start experience** door **Get your intro**, waarna plaatsaanduidingen en countdown automatisch volgen. Vervang de huidige uitleg over alle mechanismen door:

> Build systems to earn 1,200 credits. Discover what your team can do with Recon.

Verwijder de aansporing om dit zo snel mogelijk te doen uit de opening. De bestaande countdown, tijdmeting en eindtijd blijven werken. Uitleg lezen vóór Start kost geen speeltijd.

Na GO staan het geldbedrag, doel en netto-inkomen visueel voorop. Tijd, capaciteit, wachtrij en de uitsplitsing van inkomen en lonen blijven leesbaar, maar krijgen minder nadruk. Alle aankoopknoppen behouden hun naam, prijs, beschikbaarheid en relevante kosten. Dit vraagt geen extra uitklapmenu.

### 2 Koop en volg een systeem

Richt de eerste aanwijzing op **Build system**:

> Build a system. Your developer installs it, then it earns income.

Na een geslaagde aankoop volgt de begeleiding dat specifieke systeem. Bevestig de betaling en toon de actuele toestand: wachtend, in aanbouw of onderweg. Bij een wachtende opdracht luidt de boodschap bijvoorbeeld:

> System ordered. It will be built when a developer is available.

De aanwijzing verhuist met het werk van de aankoop naar de werkbank en vervolgens het systeem. De animatie blijft volledig zichtbaar. Tijdens deze eerste bouwketen krijgt de hiring-tip geen voorrang. De speler mag ondertussen wel inhuren of nog een systeem bestellen.

Bij installatie krijgt het nieuwe systeem kort nadruk, gevolgd door het inkomenscijfer:

> System installed. It earns 3 credits per second while working.

De bestaande muntanimatie ondersteunt dit gevolg. De tekst mag alleen een werkzaam systeem als verdienend beschrijven. Veranderingen in netto-inkomen blijven de werkelijke totale inkomsten en lonen volgen.

### 3 Introduceer extra capaciteit wanneer die nuttig wordt

Na de eerste installatie kan **Hire developer** aandacht krijgen als er bouwwerk wacht, de enige developer bezet is en inhuren betaalbaar is:

> Work is waiting. Another developer can take a separate job.

De aankoopkaart vermeldt de prijs en het doorlopende loon. Na aankoop bevestigen we de extra developer en wijzen we op diens echte opdracht. Developers versnellen elkaars bestaande bouwopdracht niet; ze kunnen afzonderlijke taken opnemen.

Als er niets wacht, verschijnt deze les nog niet. Wie al heeft ingehuurd krijgt geen overbodige opdracht om opnieuw iemand aan te nemen. Inhuren is geen voorwaarde om verder te kunnen.

### 4 Maak onderhoud begrijpelijk wanneer het gebeurt

Bij de eerste gewone storing krijgt het betrokken systeem nadruk:

> This system has stopped earning. A developer will repair it automatically.

De tekst volgt de echte situatie. Bij een wachtrij staat er dat de reparatie wacht; tijdens de reparatie dat een developer ermee bezig is. Toon de verbinding tussen het defecte systeem, het inkomstenverlies en de bezette developer. De speler hoeft nergens op te klikken om te repareren.

Wanneer deze storing optreedt tijdens de eerste bouwles, onderbreekt de onderhoudsuitleg die les. Na afloop keert de begeleiding terug naar de actuele bouwtoestand. Een inmiddels geïnstalleerd systeem wordt niet opnieuw als onderweg beschreven.

P1's blijven onmiddellijk zichtbaar en krijgen voorrang op gewone uitleg. Hun melding legt kort uit dat ander werk wordt onderbroken en later hervat. Een onderwijsstap stelt een echte storing nooit uit.

### 5 Laat de betekenis van Recon zien

Wanneer de speler onderhoud heeft kunnen zien en Recon betaalbaar is, krijgt **Buy Recon** nadruk:

> Let Recon handle repairs so developers can build.

Na aankoop richt de begeleiding zich op de eerste echte reparatie die Recon uitvoert. Benoem de overname en vervolgens wat de vrijgekomen developer daadwerkelijk doet. Zeg alleen dat iemand weer bouwt als dat ook gebeurt; anders past bijvoorbeeld “Your developer is available for other work.”

Koopt de speler Recon voordat er een storing is, bevestig dan dat Recon klaarstaat. Bewaar de uitleg over de overname tot er echt een reparatie is. De begeleiding verzint geen taak om het effect te demonstreren.

### 6 Geef ruimte aan zelfstandig spelen

Na de eerste bouwketen en onderhoudsuitleg blijven alleen relevante vervolghints over. Een run kan zonder hiring, Recon of Plus eindigen; geen enkele aankoop houdt de begeleiding of overwinning tegen.

Het backlog en automatisch featurewerk worden pas geïntroduceerd nadat het eerste door de speler gekochte systeem is geïnstalleerd en het inkomensmoment ruimte heeft gekregen. Tot dan blijven de backlogkolom, featurekaarten en featuretellers verborgen en starten developers geen featuretaken. Reserveer de ruimte van de kolom zodat de workshop niet verspringt bij de introductie.

Concrete kandidaat voor de vrijgave: vier actieve simulatieseconden na die eerste installatie. Deze regel staat los van het sluiten of verbergen van hints; de uitleg sluit aan op dezelfde gebeurtenis en spelvoortgang. Een onderbreking door een storing mag de uitleg uitstellen, maar verandert deze economische regel niet. Wie eerst inhuurt of Recon koopt, krijgt featurewerk na de eerste eigen systeeminstallatie. Wie uitsluitend spaart, kan de cashdoelstelling zonder featurevrijgave bereiken. Controleer die route expliciet op balans en begrijpelijkheid.

Gebruik bij introductie een gedempt blauwgrijs voor kaarten, randen en gedragen onderdelen. De bovenste kaart krijgt slechts lichte extra nadruk; tekst en symbolen blijven goed leesbaar. Een echte featurevoltooiing mag kort duidelijker oplichten. Bekijk het geheel naast de groene systemen om te controleren dat het backlog niet opnieuw de aandacht domineert. Exacte kleurtinten worden visueel beoordeeld tijdens uitvoering.

Na vrijgave kan een echte featurevoltooiing kort uitleggen dat een bestaand systeem meer inkomen oplevert. Dit mag vóór de aankoop van Recon gebeuren: features zijn geen exclusieve Recon-functie. Bestaande prioriteiten voor bouwen en repareren blijven gelden.

Plus krijgt uitleg als Recon geïnstalleerd is, reparaties zich opstapelen en de upgrade betaalbaar is. De boodschap verklaart de extra capaciteit van één naar drie gelijktijdige reparaties. Daarna kan de speler verder zonder vaste reeks lesstappen.

## Regels voor aandacht en voortgang

- Toon maximaal één onderwijsaanwijzing en één bijbehorend aandachtseffect tegelijk. Permanente labels voor echte toestanden, zoals een defect of een wachtrij, blijven zichtbaar.
- Plaats de korte tekst in de bestaande begeleidingszone en verbind die met één duidelijk aangeduid object. Gebruik geen overlay die de workshop bedekt en geen reeks vensters met een Next-knop.
- Houd een handelingsaanwijzing beschikbaar zolang zij relevant is. Vervang haar na de handeling, bij gewijzigde omstandigheden of wanneer de speler haar sluit. Een verstreken timer geldt niet als bewijs dat iets begrepen is.
- Geef een resultaatbevestiging als eerste voorstel vier zichtbare, actieve seconden. Een onderbreking door belangrijkere uitleg telt daar niet bij. Dit is een te testen leestijd, geen leermeting.
- Voorrang: urgente P1 of geldprobleem, eerste onderhoudservaring, lopende eerste bouwketen, passende vervolgles. Bevestig tussentijdse aankopen altijd zichtbaar bij de betreffende aankoopkaart zonder een tweede les te openen.
- Laat een betaalbare Recon- of Plus-knop tijdens een andere les zijn gewone beschikbaarheid tonen. Het opvallende koopeffect wacht tot die aankoop de actuele focus is. Buiten de begeleiding blijft de bestaande aankoopnadruk gelden.
- De bestaande sluitknop sluit alleen de huidige aanwijzing. Voeg in dezelfde begeleidingszone een bescheiden **Hide guidance** toe om alle lesaanwijzingen voor deze run te verbergen. Aankoopbevestigingen en noodzakelijke spelstatus blijven beschikbaar.
- Een nieuwe run biedt de begeleiding opnieuw aan, ook op hetzelfde eventtoestel. Bewaar geen blijvende instelling die de volgende bezoeker stilzwijgend overslaat.
- Hidden-tab hold, Restart-bevestiging en OS reduced motion blijven gerespecteerd. De uitleg pauzeert de simulatie niet. Zonder beweging moeten tekst, vorm en statische nadruk dezelfde betekenis overbrengen.

## Afwijkende speelroutes

| Situatie | Gewenst gedrag |
| --- | --- |
| De speler huurt eerst iemand in. | Bevestig de aankoop en het loon. Bied de eerste bouwles aan zodra bouwen betaalbaar is. |
| De speler spaart zonder iets te kopen. | Laat de eerste bouwsuggestie sluiten en geef onderhoudsuitleg wanneer die relevant wordt. Forceer geen aankoop. |
| De speler bestelt meerdere systemen snel na elkaar. | Bevestig elke aankoop; volg voor de bouwles het eerste gekochte systeem en leg een wachtrij eerlijk uit. |
| Hiring is nog niet betaalbaar. | Geef geen opdracht om te huren. Prijs en ontbrekend bedrag blijven zichtbaar. |
| De speler koopt Recon vroeg. | Bevestig gereedstaande capaciteit en wacht voor de demonstratie op een echte reparatie. |
| Een gebeurtenis vindt plaats terwijl een andere les zichtbaar is. | Onthoud de gebeurtenis en beoordeel bij hervatting de huidige toestand. Speel geen achterhaalde instructie af. |
| De speler wint zonder automatisering. | Toon de normale overwinning; er is geen onvoltooide tour die doorgaan verhindert. |
| De speler sluit begeleiding of herstart. | Sluiten verandert de spelregels niet. Herstart wist de voortgang van de begeleiding samen met de run. |

## Uitvoering in drie stappen

### Stap 1 Eerste bouwketen en rustige opening

Verkort de opening, pas de visuele hiërarchie aan en implementeer de begeleiding van aankoop tot installatie en inkomen. Neem de uitgestelde featurevrijgave en het zachtere blauwgrijs meteen mee. Laat de eigenaar die volledige keten bekijken voordat de vervolglessen worden toegevoegd. Controleer ook eerst inhuren en meerdere snelle bouwbestellingen.

### Stap 2 Onderhoud en vervolglessen

Voeg de gebeurtenisgestuurde lessen voor hiring, onderhoud, Recon, features en Plus toe. Werk onderbreken, hervatten, sluiten en herstarten uit. Controleer dat alle aandachtseffecten dezelfde prioriteit volgen.

### Stap 3 Technische controle en gebruikerstest

Controleer de onderstaande scenario's en de balans na de uitgestelde featurevrijgave. Laat nieuwe bezoekers de ervaring zonder coaching proberen en pas tekst of volgorde aan op basis van concrete misverstanden. Eventuele wijzigingen aan de eerste storing blijven een afzonderlijke vervolgbeslissing.

## Aansluiting op de implementatie en documentatie

De begeleidingslogica komt bij `src/v3Guidance.ts` en `src/V3Guidance.tsx`. Houd per run bij welke gebeurtenissen zijn opgetreden, welk gekocht systeem de bouwles volgt, welke aanwijzing actief is en wat is gesloten. Deze gegevens beschrijven getoonde begeleiding, niet bewezen begrip.

`src/V3Game.tsx` verzorgt de opening, statistieken, begeleidingszone en aankoopnadruk. `src/V3Board.tsx` en de presentatiecomponenten koppelen die nadruk aan de werkelijke developer, werkbank of het systeem. De simulatie in `src/v3Game.ts` levert de gebeurtenissen en bewaakt de uitgestelde featurevrijgave. Houd de vrijgave onafhankelijk van presentatietimers, gesloten hints en de zichtbaarheid van de begeleidingszone. De featurevormgeving zit ook in `src/V3Features.tsx` en `src/v3-game.css`.

Bij uitvoering hoort dit bij de huidige V3.4-feedback, met wijzigingen aan de bestaande V3.3-begeleiding. Maak geen nieuwe versie alleen voor deze tour. Leg de gekozen regels vóór implementatie vast in `V3_MODE.md` en `DECISIONS.md`, en volg de oplevering in `V3_DELIVERY.md` en `HANDOVER.md`.

De uitgestelde featurevrijgave wijzigt de vroege beschikbaarheid uit D162/D165; de bestaande featureprioriteiten blijven gelden. De voorgestelde volgorde wijzigt specifiek de vroege hiring-prioriteit uit D166, de onvoorwaardelijke aankoopnadruk uit D167 tijdens begeleiding en de omvang van de opening uit D164/D173. De extra optie om begeleiding te verbergen staat in de begeleidingszone; de toolbar uit D174 blijft bij Restart. Dit plan vervangt die bestaande afspraken pas wanneer de uitvoering ervan wordt gekozen.

## Acceptatie en validatie

Technische acceptatie vraagt dat:

- De eerste bouwbegeleiding pas naar de installatiebevestiging gaat wanneer het gevolgde systeem werkelijk geïnstalleerd is.
- Een hiring-tip die keten niet voortijdig vervangt, terwijl hiring zelf mogelijk blijft.
- Storingen en P1's correcte informatie geven en de onderbroken les naar de actuele toestand terugkeert.
- Recon-uitleg overeenkomt met werkelijk gereedstaande of actieve reparatiecapaciteit.
- Alle afwijkende routes hierboven werken zonder vastgelopen begeleiding of geblokkeerde overwinning.
- Er op de ondersteunde desktop- en laptopformaten één leesbare focus is, ook met toetsenbordbediening en reduced motion.
- Vóór featurevrijgave geen featuretaken of feature-inkomsten ontstaan en de backlogkolom en featuretellers verborgen blijven.
- De vrijgave na de eerste gekochte systeeminstallatie en de voorgestelde vier actieve seconden werkt, ook bij eerst inhuren, vroeg Recon kopen en verborgen begeleiding.
- Dezelfde seed en dezelfde aankopen op dezelfde simulatietijden met begeleiding aan of uit dezelfde economische uitkomst opleveren onder de nieuwe vrijgaveregel.
- Het zachtere featurepalet leesbaar blijft en de systemen en actuele begeleidingsfocus visueel voorrang krijgen.

Gebruik gerichte tests voor lesovergangen en onderbrekingen, de bestaande V3-enginechecks, de productiebuild en browsercontroles voor de opening, eerste aankoop, onderhoud, Recon en replay. Herhaal de economische benchmark vanwege de uitgestelde featurevrijgave. Vergelijk eindtijd, vroege inkomsten, eerste aankopen en developerbezetting met de vorige versie; neem directe bouw, eerst inhuren, uitgesteld bouwen, sparen zonder extra systemen en runs zonder Recon mee. Rapporteer verschillen vóór eventuele verdere tuning.

Laat vervolgens als kleine kwalitatieve proef drie tot vijf nieuwe spelers en minstens één toeschouwer meedoen. Gebruik bij voorkeur de vorige versie als vergelijking met andere nieuwe deelnemers, zodat herkenning de tweede poging niet kunstmatig makkelijker maakt. Dit aantal levert richtinggevende observaties, geen statistisch bewijs.

Geef alleen de opdracht om de ervaring te proberen. Noteer aarzeling, herhaalde klikken, gemiste aanwijzingen, hulpvragen en waar de aandacht naartoe gaat. Vraag achteraf:

1. Wat veranderde er door je eerste aankoop?
2. Wat gebeurt er met inkomen en developers wanneer een systeem stukgaat?
3. Wat neemt Recon over, en wat kunnen developers daardoor doen?

Vraag de derde vraag aan deelnemers die Recon hebben gebruikt of gezien; een bewuste run zonder Recon is geen mislukte test. De toeschouwer moet de zichtbare oorzaak en het gevolg eveneens kunnen beschrijven. Accepteer de begeleiding wanneer er in deze kleine proef geen terugkerend onopgelost misverstand over die kernrelaties is en deelnemers verder kunnen zonder mondelinge coaching. Snel finishen alleen voldoet niet.

## Nog te toetsen na de eerste uitvoering

Toets of de featureintroductie vier actieve seconden na de eerste eigen systeeminstallatie voldoende ruimte laat en of de kleuren rustig genoeg zijn. De eerste storing rond 22 seconden kan nog steeds samenvallen met de bouwles. Als dat verwarrend blijft, werk dan een aparte timingvariant uit. Leg daarbij expliciet vast wat verandert aan inkomsten, wachttijden en onderhoud; toets die variant opnieuw op balans en begrijpelijkheid.

Bronnen: [feedback en vergelijking](../../USER_TESTING_FEEDBACK.md), [huidige V3-specificatie](../../V3_MODE.md) en [Invisible Tutorials](https://www.aigamebuilders.com/blog/invisible-tutorials-game-design/). De blog inspireert de aanpak; de gebruikerstest moet aantonen of deze uitwerking bij Active Animation werkt.
