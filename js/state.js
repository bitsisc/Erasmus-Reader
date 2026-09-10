
// js/state.js

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

const ttsLocales = {
    'el':'el-GR', 'en':'en-US', 'sl':'sl-SI', 'fr':'fr-FR', 'de':'de-DE',
    'es':'es-ES', 'it':'it-IT', 'pt':'pt-PT', 'nl':'nl-NL', 'pl':'pl-PL',
    'ro':'ro-RO', 'sv':'sv-SE', 'da':'da-DK', 'fi':'fi-FI', 'cs':'cs-CZ',
    'hu':'hu-HU', 'sk':'sk-SK', 'bg':'bg-BG', 'hr':'hr-HR', 'lt':'lt-LT',
    'lv':'lv-LV', 'et':'et-EE', 'mt':'mt-MT', 'ga':'ga-IE'
};

const euDisclaimers = {
    el: "Με τη χρηματοδότηση της Ευρωπαϊκής Ένωσης. Ωστόσο, οι απόψεις και οι γνώμες που διατυπώνονται εκφράζουν αποκλειστικά τις απόψεις των συντακτών και δεν αντιπροσωπεύουν κατ' ανάγκη τις απόψεις της Ευρωπαϊκής Ένωσης ή του Ευρωπαϊκού Εκτελεστικού Οργανισμού Εκπαίδευσης και Πολιτισμού (EACEA). Η Ευρωπαϊκή Ένωση και ο EACEA δεν μπορούν να θεωρηθούν υπεύθυνοι για τις εκφραζόμενες απόψεις. [Αριθμός Έργου: 2026-1-CY01-KA210-SCH-000460493]",
    en: "Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them. [Project Number: 2026-1-CY01-KA210-SCH-000460493]",
    bg: "Финансирано от Европейския съюз. Изразените възгледи и мнения обаче принадлежат изцяло на техния(ите) автор(и) и не отразяват непременно възгледите и мненията на Европейския съюз или на Европейската изпълнителна агенция за образование и култура (EACEA). За тях не носи отговорност нито Европейският съюз, нито EACEA. [Номер на проекта: 2026-1-CY01-KA210-SCH-000460493]",
    cs: "Financováno Evropskou unií. Názory vyjádřené jsou názory autora a neodráží nutně oficiální stanovisko Evropské unie či Evropské výkonné agentury pro vzdělávání a kulturu (EACEA). Evropská unie ani EACEA za vyjádřené názory nenese odpovědnost. [Číslo projektu: 2026-1-CY01-KA210-SCH-000460493]",
    da: "Finansieret af Den Europæiske Union. Synspunkter og holdninger, der udtrykkes, er dog udelukkende forfatterens/forfatternes egne og afspejler ikke nødvendigvis Den Europæiske Unions eller Den Europæiske Executive Agency for Uddannelse og Kulturs (EACEA) officielle holdning. Hverken Den Europæiske Union eller EACEA kan holdes ansvarlig herfor. [Projektnummer: 2026-1-CY01-KA210-SCH-000460493]",
    de: "Von der Europäischen Union finanziert. Die geäußerten Ansichten und Meinungen entsprechen jedoch ausschließlich denen des Autors oder der Autoren und spiegeln nicht zwingend die der Europäischen Union oder der Europäischen Exekutivagentur für Bildung und Kultur (EACEA) wider. Weder die Europäische Union noch die EACEA können dafür verantwortlich gemacht werden. [Projektnummer: 2026-1-CY01-KA210-SCH-000460493]",
    es: "Financiado por la Unión Europea. Las opiniones y puntos de vista expresados solo comprometen a su(s) autor(es) y no reflejan necesariamente los de la Unión Europea ni los de la Agencia Ejecutiva Europea de Educación y Cultura (EACEA). Ni la Unión Europea ni la EACEA pueden ser considerados responsables de ellos. [Número de proyecto: 2026-1-CY01-KA210-SCH-000460493]",
    et: "Rahastatud Euroopa Liidu poolt. Avaldatud seisukohad ja arvamused on ainult autori(te) omad ega pruugi kajastada Euroopa Liidu või Euroopa Hariduse ja Kultuuri Täitevasutuse (EACEA) seisukohti. Ei Euroopa Liitu ega EACEAd saa nende eest vastutavaks pidada. [Projekti number: 2026-1-CY01-KA210-SCH-000460493]",
    fi: "Euroopan unionin rahoittama. Esitetyt näkemykset ja mielipiteet ovat kuitenkin ainoastaan tekijän (tekijöiden) omia eivätkä välttämättä vastaa Euroopan unionin tai Euroopan koulutuksen ja kulttuurin toimeenpanoviraston (EACEA) näkemyksiä. Euroopan unioni tai EACEA ei ole vastuussa niistä. [Hankenumero: 2026-1-CY01-KA210-SCH-000460493]",
    fr: "Financé par l’Union européenne. Les points de vue et opinions exprimés n’engagent que leur(s) auteur(s) et ne reflètent pas nécessairement ceux de l’Union européenne ou de l’Agence exécutive européenne pour l’éducation et la culture (EACEA). Ni l’Union européenne ni l’EACEA ne peuvent en être tenues pour responsables. [Numéro de projet : 2026-1-CY01-KA210-SCH-000460493]",
    ga: "Arna mhaoiniú ag an Aontas Eorpach. Is leis an údar/leis na húdair amháin na tuairimí agus na barúlacha a léirítear agus ní gá go léiríonn siad tuairimí an Aontais Eorpaigh ná an Ghníomhaireacht Feidhmiúcháin Eorpach um Oideachas agus um Chultúr (EACEA). Ní féidir an tAontas Eorpach ná EACEA a chur faoi dhliteanas astu. [Uimhir an Tionscadail: 2026-1-CY01-KA210-SCH-000460493]",
    hr: "Financirano sredstvima Europske unije. Izneseni stavovi i mišljenja samo su stavovi i mišljenja autora i ne moraju se podudarati sa stavovima i mišljenjima Europske unije ili Europske izvršne agencije za obrazovanje i kulturu (EACEA). Ni Europska unija ni EACEA ne mogu se smatrati odgovornima za njih. [Broj projekta: 2026-1-CY01-KA210-SCH-000460493]",
    hu: "Az Európai Unió finanszírozásával. Az itt szereplő vélemények és állítások a szerző(k) álláspontját tükrözik, és nem feltétlenül egyeznek meg az Európai Unió vagy az Európai Oktatási és Kulturális Végrehajtó Ügynökség (EACEA) hivatalos álláspontjával. Sem az Európai Unió, sem az EACEA nem vonható felelősségre miattuk. [Projekt azonosító: 2026-1-CY01-KA210-SCH-000460493]",
    it: "Finanziato dall'Unione europea. Le opinioni e i punti di vista espressi sono tuttavia esclusivamente quelli dell'autore/degli autori e non riflettono necessariamente quelli dell'Unione europea o dell'Agenzia esecutiva europea per l'istruzione e la cultura (EACEA). Né l'Unione europea né l'EACEA possono essere ritenute responsabili. [Numero di progetto: 2026-1-CY01-KA210-SCH-000460493]",
    lt: "Finansuojama Europos Sąjungos lėšomis. Tačiau išreikštos mintys ir nuomonės yra tik autoriaus (-ių) ir nebūtinai atspindi Europos Sąjungos arba Europos švietimo ir kultūros vykdomosios agentūros (EACEA) nuomonę. Nei Europos Sąjunga, nei EACEA negali būti laikomos už jas atsakingomis. [Projekto numeris: 2026-1-CY01-KA210-SCH-000460493]",
    lv: "Eiropas Savienības finansēts. Paustie viedokļi un uzskati ir tikai autora(-u) viedoklis un neizsaka noteikti Eiropas Savienības vai Eiropas Izglītības un kultūras izpildaģentūras (EACEA) nostāju. Ne Eiropas Savienība, ne EACEA par tiem neatbild. [Projekta numurs: 2026-1-CY01-KA210-SCH-000460493]",
    mt: "Iffinanzjat mill-Unjoni Ewropea. Madankollu, il-fehmiet u l-opinjonijiet espressi huma biss dawk tal-awtur(i) u mhux neċessarjament jirriflettu dawk tal-Unjoni Ewropea jew tal-Aġenzija Eżekuttiva Ewropea għall-Edukazzjoni u l-Kultura (EACEA). Niżguraw li la l-Unjoni Ewropea u lanqas l-EACEA ma jistgħu jinżammu responsabbli għalihom. [Numru tal-Proġett: 2026-1-CY01-KA210-SCH-000460493]",
    nl: "Gefinancierd door de Europese Unie. De hier geuite meningen en standpunten zijn echter uitsluitend die van de auteur(s) en schetsen niet noodzakelijkerwijs de officiële standpunten van de Europese Unie of het Europees Uitvoerend Agentschap onderwijs en cultuur (EACEA). Noch de Europese Unie noch EACEA kan er aansprakelijk voor worden gesteld. [Projectnummer: 2026-1-CY01-KA210-SCH-000460493]",
    pl: "Sfinansowane ze środków UE. Wyrażone poglądy i opinie są jednak wyłącznie poglądami i opiniami autora (autorów) i niekoniecznie odzwierciedlają poglądy i opinie Unii Europejskiej lub Europejskiej Agencji Wykonawczej ds. Edukacji i Kultury (EACEA). Ani Unia Europejska, ani EACEA nie ponoszą za nie odpowiedzialności. [Numer projektu: 2026-1-CY01-KA210-SCH-000460493]",
    pt: "Financiado pela União Europeia. Os pontos de vista e as opiniões expressas são no entanto apenas do(s) autor(es) e não refletem necessariamente a posição da União Europeia ou da Agência Executiva Europeia da Educação e da Cultura (EACEA). Nem a União Europeia nem a EACEA podem ser responsabilizadas por elas. [Número de Projeto: 2026-1-CY01-KA210-SCH-000460493]",
    ro: "Finanțat de Uniunea Europeană. Punctele de vedere și opiniile exprimate aparțin însă exclusiv autorului (autorilor) și nu reflectă cu necesitate poziția Uniunii Europene sau a Agenției Executive Europene pentru Educație și Cultură (EACEA). Nici Uniunea Europeană și nici EACEA nu pot fi trase la răspundere pentru acestea. [Numărul proiectului: 2026-1-CY01-KA210-SCH-000460493]",
    sk: "Financované Európskou úniou. Vyjadrené názory a postoje sú však výlučne názormi a postojmi autora (autorov) a nemusia nevyhnutne odrážať názory a postoje Európskej únie alebo Európskej výkonnej agentúry pre vzdelávanie a kultúru (EACEA). Európska únia ani EACEA za ne nenesu zodpovednosť. [Číslo projektu: 2026-1-CY01-KA210-SCH-000460493]",
    sl: "Financirano s strani Evropske unije. Izražena stališča in mnenja so v celoti avtorjeva (avtorjeva) in ne odražajo nujno stališč Evropske unije ali Evropske izvajalske agencije za izobraževanje in kulturo (EACEA). Niti Evropska unija niti EACEA ne moreta odgovarjati zanje. [Številka projekta: 2026-1-CY01-KA210-SCH-000460493]",
    sv: "Finansieras av Europeiska unionen. De synpunkter och åsikter som uttrycks är endast upphovsmannens/upphovsmännens och tas inte med nödvändighet som uttryck för Europeiska unionens eller Europeiska genomförandeorganet för utbildning och kulturs (EACEA) officiella ståndpunkt. Varken Europeiska unionen eller EACEA kan hållas ansvariga för dem. [Projektnummer: 2026-1-CY01-KA210-SCH-000460493]"
};

const euFlagImgs = {
    bg: 'BG_Co-fundedbytheEU_RGB_POS.png',
    cs: 'CS_Co-fundedbytheEU_RGB_POS.png',
    da: 'DA_Co-fundedbytheEU_RGB_POS.png',
    de: 'DE_Co-fundedbytheEU_RGB_POS.png',
    el: 'EL_Co-fundedbytheEU_RGB_POS.png',
    en: 'EN_Co-fundedbytheEU_RGB_POS.png',
    es: 'ES_Co-fundedbytheEU_RGB_POS.png',
    et: 'ET_Co-fundedbytheEU_RGB_POS.png',
    fi: 'FI_Co-fundedbytheEU_RGB_POS.png',
    fr: 'FR_Co-fundedbytheEU_RGB_POS.png',
    ga: 'GA_Co-fundedbytheEU_RGB_POS.png',
    hr: 'HR_Co-fundedbytheEU_RGB_POS.png',
    hu: 'HU_Co-fundedbytheEU_RGB_POS.png',
    it: 'IT_Co-fundedbytheEU_RGB_POS.png',
    lt: 'LT_Co-fundedbytheEU_RGB_POS.png',
    lv: 'LV_Co-fundedbytheEU_RGB_POS.png',
    mt: 'MT_Co-fundedbytheEU_RGB_POS.png',
    nl: 'NL_Co-fundedbytheEU_RGB_POS.png',
    pl: 'PL_Co-fundedbytheEU_RGB_POS.png',
    pt: 'PT_Co-fundedbytheEU_RGB_POS.png',
    ro: 'RO_Co-fundedbytheEU_RGB_POS.png',
    sk: 'SK_Co-fundedbytheEU_RGB_POS.png',
    sl: 'SL_Co-fundedbytheEU_RGB_POS.png',
    sv: 'SV_Co-fundedbytheEU_RGB_POS.png'
};

const europeanLanguages = [
    { code: 'el', iso: 'gr', name: 'Ελληνικά' }, { code: 'en', iso: 'gb', name: 'English' },
    { code: 'sl', iso: 'si', name: 'Slovenščina' }, { code: 'fr', iso: 'fr', name: 'Français' },
    { code: 'de', iso: 'de', name: 'Deutsch' }, { code: 'es', iso: 'es', name: 'Español' },
    { code: 'it', iso: 'it', name: 'Italiano' }, { code: 'pt', iso: 'pt', name: 'Português' },
    { code: 'nl', iso: 'nl', name: 'Nederlands' }, { code: 'pl', iso: 'pl', name: 'Polski' },
    { code: 'ro', iso: 'ro', name: 'Română' }, { code: 'sv', iso: 'se', name: 'Svenska' },
    { code: 'da', iso: 'dk', name: 'Dansk' }, { code: 'fi', iso: 'fi', name: 'Suomi' },
    { code: 'cs', iso: 'cz', name: 'Čeština' }, { code: 'hu', iso: 'hu', name: 'Magyar' },
    { code: 'sk', iso: 'sk', name: 'Slovenčina' }, { code: 'bg', iso: 'bg', name: 'Български' },
    { code: 'hr', iso: 'hr', name: 'Hrvatski' }, { code: 'lt', iso: 'lt', name: 'Lietuvių' },
    { code: 'lv', iso: 'lv', name: 'Latviešu' }, { code: 'et', iso: 'ee', name: 'Eesti' },
    { code: 'mt', iso: 'mt', name: 'Malti' }, { code: 'ga', iso: 'ie', name: 'Gaeilge' }
];

let currentLang = getCookie('readingToolLang') || localStorage.getItem('readingToolLang') || 'el';
let isApiLocked = !!localStorage.getItem('readingToolPin');

const defaultSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVht86a5eqWo2ZUb3x9yJIL8-xwV6lN4SHitmy5f3N0MYWazd9q4eMKfcfE6gJXpOvMMvu1zevNAXf/pub?output=csv';
let currentSheetUrl = localStorage.getItem('customReadingSheet') || defaultSheetUrl;
let storyDatabase = {};
let storyWordsDatabase = {};
let maxStoryId = 0;
let wordToImageMap = {};
let imageToWordMap = {};
let customWordsSheetUrl = localStorage.getItem('customWordsSheet') || null;
let totalDetectedImages = 310;

const state = {
    rawText: "", parsedData: [], currentIndex: -1, mode: 'word', readFlow: 'step',
    veilActive: true, veilOpacity: 0.5, flatElements: [], 
    fontFamily: "'OpenDyslexic', 'OpenDyslexicRegular', 'Comic Sans MS', 'Verdana', sans-serif",
    fontSize: '3rem', fontWeight: 'normal', textColor: '#333333', textBgColor: '#FDF9E3', appBgColor: '#E8ECEF',
    veilColorRGB: '0, 0, 0', speechRate: 0.9,
    isAutoReading: false, autoReadTimeout: null,
    mathSyncInterval: null,
    scanOn: false, scanSpeed: 2.5,
    isStudentMode: false,
    imageMode: 0,
    imageSize: '50px',
    sheetUnknownWords: new Set(),
    failedCurrentTarget: false
};

const screens = {
    teacher: document.getElementById('screen-teacher'),
    student: document.getElementById('screen-student')
};
const inputs = {
    textarea: document.getElementById('input-text'),
    font: document.getElementById('set-font'),
    size: document.getElementById('set-size'),
    color: document.getElementById('set-color'),
    textBgColor: document.getElementById('set-text-bg-color'),
    appBgColor: document.getElementById('set-app-bg-color'),
    bold: document.getElementById('set-bold'),
    veilColor: document.getElementById('set-veil-color'),
    voice: document.getElementById('set-voice'),
    rate: document.getElementById('set-rate'),
    apiKey: document.getElementById('google-api-key'),
    premiumVoice: document.getElementById('set-premium-voice'),
    setVeilOpacity: document.getElementById('set-veil-opacity'),
    veilOpacitySlider: document.getElementById('veil-opacity-slider'),
    fileLoad: document.getElementById('file-load-input'),
    filename: document.getElementById('filename-input'),
    fontUploadBtn: document.getElementById('btn-upload-font'),
    fontUploadInput: document.getElementById('font-upload-input'),
    fontStatus: document.getElementById('font-file-status'),
    storyNumber: document.getElementById('story-number-input'),
    storyMaxInfo: document.getElementById('story-max-info'),
    pin: document.getElementById('pin-input'),
    scanOn: document.getElementById('set-scan'),
    scanSpeed: document.getElementById('set-scan-speed'),
    imageSize: document.getElementById('set-image-size'),
    shareUrlInput: document.getElementById('share-url-input'),
    customWordsUrlInput: document.getElementById('custom-words-url-input'),
    sttApiKey: document.getElementById('stt-api-key'),
    syncSttWithTtsKey: document.getElementById('sync-stt-with-tts-key')
};
const display = {
    area: document.getElementById('text-display'),
    root: document.documentElement
};
const modals = {
    filename: document.getElementById('filename-modal'),
    sheet: document.getElementById('sheet-link-modal'),
    lang: document.getElementById('lang-modal'),
    pin: document.getElementById('pin-modal'),
    share: document.getElementById('share-modal'),
    help: document.getElementById('help-modal'),
    imageDict: document.getElementById('image-dict-modal'),
    apiInfo: document.getElementById('api-info-modal'),
    stt: document.getElementById('stt-modal')
};
