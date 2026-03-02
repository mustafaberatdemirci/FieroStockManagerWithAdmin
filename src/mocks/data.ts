// ─── Mock Data ───────────────────────────────────────────────────────────────
// Activated via VITE_USE_MOCK=true in .env

// ─── IDs ─────────────────────────────────────────────────────────────────────
const ID = {
  admin: 'usr_admin_001',
  demo: 'usr_demo_002',
  ankara: 'usr_ank_003',
  saracoglu: 'usr_sar_004',
  hamamonu: 'usr_ham_005',
  demoStore: 'str_demo_001',
  ankStore: 'str_ank_002',
  sarStore: 'str_sar_003',
  hamStore: 'str_ham_004',
  catKahve: 'cat_kahve_01',
  catIcecek: 'cat_icecek_02',
  catSurup: 'cat_surup_03',
  catYiyecek: 'cat_yiyecek_04',
  catMalzeme: 'cat_malzeme_05',
  catAmbalaj: 'cat_ambalaj_06',
} as const;

// ─── Users ───────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  {
    id: ID.admin, username: 'admin', email: 'admin@fierocoffee.com', password: 'admin123',
    role: 'ADMIN' as const, isActive: true, lastLoginAt: '2026-03-01T10:00:00Z', store: null,
  },
  {
    id: ID.demo, username: 'demo', email: 'demo@fierocoffee.com', password: 'demo123',
    role: 'STORE' as const, isActive: true, lastLoginAt: '2026-03-02T08:00:00Z',
    store: { id: ID.demoStore, name: 'Demo Şube', code: 'DEMO001', address: 'Demo Mağaza Adresi', phone: '+90 (555) 123-4567' },
  },
  {
    id: ID.ankara, username: 'ankara_universitesi', email: 'ank.unv@fierocoffee.com', password: 'fiero01',
    role: 'STORE' as const, isActive: true, lastLoginAt: '2026-03-01T14:30:00Z',
    store: { id: ID.ankStore, name: 'Ankara Üniversitesi Şubesi', code: 'ANK001', address: 'Ankara Üniversitesi Kampüsü', phone: '+90 (312) 123-4567' },
  },
  {
    id: ID.saracoglu, username: 'saracoglu_sube', email: 'saracoglu@fierocoffee.com', password: 'fiero02',
    role: 'STORE' as const, isActive: true, lastLoginAt: '2026-02-28T09:00:00Z',
    store: { id: ID.sarStore, name: 'Saraçoğlu Şubesi', code: 'SAR001', address: 'Saraçoğlu Mahallesi', phone: '+90 (312) 987-6543' },
  },
  {
    id: ID.hamamonu, username: 'hamamonu_sube', email: 'hamamonu@fierocoffee.com', password: 'fiero03',
    role: 'STORE' as const, isActive: true, lastLoginAt: '2026-02-27T11:00:00Z',
    store: { id: ID.hamStore, name: 'Fiero Hamamönü Şube', code: 'HAM001', address: 'Hamamönü Caddesi No:12, Altındağ/Ankara', phone: '+90 (312) 456-7890' },
  },
];

// ─── Stores ──────────────────────────────────────────────────────────────────
export const MOCK_STORES = MOCK_USERS.filter(u => u.role === 'STORE').map(u => ({
  id: u.store!.id, name: u.store!.name, code: u.store!.code, address: u.store!.address, phone: u.store!.phone,
  isActive: u.isActive, balance: 15000, creditLimit: 5000,
  createdAt: '2025-08-16T12:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  user: { id: u.id, username: u.username, email: u.email, isActive: u.isActive, lastLoginAt: u.lastLoginAt },
  _count: { orders: Math.floor(Math.random() * 20) + 5 },
}));

// ─── Categories ──────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  { id: ID.catKahve, name: 'Kahve Çekirdeği', description: 'Çeşitli kahve çekirdekleri', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
  { id: ID.catIcecek, name: 'İçecekler', description: 'Soğuk ve sıcak içecekler', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
  { id: ID.catSurup, name: 'Şuruplar', description: 'Kahve şurupları ve tatlandırıcılar', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
  { id: ID.catYiyecek, name: 'Yiyecek', description: 'Atıştırmalık ve tatlılar', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
  { id: ID.catMalzeme, name: 'Malzemeler', description: 'Kahve ekipmanları ve malzemeleri', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
  { id: ID.catAmbalaj, name: 'Ambalaj', description: 'Ambalaj malzemeleri', isActive: true, createdAt: '2025-08-16T12:00:00Z', updatedAt: '2025-08-16T12:00:00Z' },
];

// ─── Products (User's exact product list) ────────────────────────────────────
// Category assignment based on product code prefix / content
function catFor(code: string, name: string): string {
  const n = name.toUpperCase();
  if (code.startsWith('MZ.KG.') || n.includes('BARDAK') || n.includes('PIPET') || n.includes('KAPAK') || n.includes('KESE') || n.includes('MENDIL') || n.includes('TABANI') || n.includes('BIBERON')) return ID.catAmbalaj;
  if (code.startsWith('MZ.CS.') || code.startsWith('MZ.TM.') || code.startsWith('MZ.PM.') || n.includes('ONLUGU') || n.includes('YAKA KARTI') || n.includes('PECETE') || n.includes('POMPA') || n.includes('KARISTIRICI') || n.includes('LACOS') || n.includes('SEKER')) return ID.catMalzeme;
  if (n.includes('SURUP') || n.includes('ŞURUP') || n.includes('SOS ') || n.includes('PURE ') || n.includes('SALTED CARAMEL') || n.includes('LIMONLU SURUP')) return ID.catSurup;
  if (code.startsWith('MZ.IC.') && (n.includes('KAHVE') || n.includes('TURK'))) return ID.catKahve;
  if (code.startsWith('MZ.IC.') || n.includes('SÜT') || n.includes('SUTAS') || n.includes('CAY') || n.includes('CHAI') || n.includes('MATCHA') || n.includes('SAHLEP') || n.includes('CIKOLATA 1 KG') || n.includes('CIKOLATA 1000') || n.includes('DAMLA') || n.includes('SODA') || n.includes('TEACO') || n.includes('PINAR') || n.includes('SHIROPPO') || n.includes('EARLY GREY')) return ID.catIcecek;
  if (code.startsWith('MZ.DN.') || n.includes('GURME')) return ID.catIcecek;
  if (code.startsWith('BG.IT.') || code.startsWith('MZ.YH.T.') || n.includes('KURABIYE') || n.includes('MUFFIN') || n.includes('BAGEL') || n.includes('PANINI') || n.includes('TOST') || n.includes('CAKE') || n.includes('PASTA') || n.includes('KEK') || n.includes('BOREK') || n.includes('SUTLAC') || n.includes('KAZANDIBI') || n.includes('PROFITEROL') || n.includes('MANOLYA') || n.includes('MOZAIK') || n.includes('ISIT YE') || n.includes('DUNI') || n.includes('KRUVASAN') || n.includes('FIESTA') || n.includes('CUP ') || n.includes('BOREGI') || n.includes('SU BOREGI')) return ID.catYiyecek;
  if (n.includes('FILTRE KAHVE') || n.includes('DIBEK') || n.includes('ESP ') || n.includes('CREMOSO')) return ID.catKahve;
  return ID.catMalzeme;
}

const _raw = [
  { code: 'MZ.CS.303', name: 'AHSAP KARISTIRICI (1PKT)', price: 74.60, vatRate: 0.2 },
  { code: 'MZ.KG.108', name: 'BARDAK TUTUCU (2000AD)', price: 2400.00, vatRate: 0.2 },
  { code: 'MZ.CS.70', name: 'BARISTA ONLUGU', price: 770.00, vatRate: 0.1 },
  { code: 'MZ.YH.216', name: 'FIERO SURUP NANE', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.YH.T.71', name: 'BD BAGEL LAS VEGAS UC PEYNIRLI (18AD)', price: 1043.30, vatRate: 0.01 },
  { code: 'MZ.YH.T.48', name: 'BD BUN MOZERELLA SAND 1 KL (24AD)', price: 1858.80, vatRate: 0.01 },
  { code: 'MZ.YH.T.72', name: 'BD CIKOLATALI MUFFIN (9AD)', price: 411.70, vatRate: 0.01 },
  { code: 'MZ.YH.T.77', name: 'BD CIKOLATALI FILE FINDIKLI ROLL KRUVASAN (16AD)', price: 1224.00, vatRate: 0.01 },
  { code: 'MZ.YH.T.52', name: 'BD GURME FIESTA 1 KL 10 AD.', price: 926.70, vatRate: 0.01 },
  { code: 'MZ.YH.T.61', name: 'BD MUFFİN KLASİK YABAN MERSİNLİ (9 AD)', price: 464.50, vatRate: 0.01 },
  { code: 'MZ.YH.T.51', name: 'BD PANINI HINDI FUME 1 KL (18AD)', price: 1339.50, vatRate: 0.01 },
  { code: 'MZ.YH.T.50', name: 'BD PANINI VEJETERYAN 1 KL (18AD)', price: 1030.60, vatRate: 0.01 },
  { code: 'MZ.YH.T.76', name: 'BD PARİS LYON DARK CHOCALATE MADALİN CAKE (12 AD)', price: 709.92, vatRate: 0.01 },
  { code: 'MZ.YH.T.70', name: 'BD POUND CAKE TIRAMISU(12AD)', price: 673.20, vatRate: 0.01 },
  { code: 'MZ.YH.T.59', name: 'BD TOST JUMBO SUCUKLU KASARLI (16AD)', price: 859.60, vatRate: 0.01 },
  { code: 'MZ.KG.194', name: 'BUBBLE PIPET AROLEZ (2500 ADET)', price: 1980.00, vatRate: 0.2 },
  { code: 'BG.IT.1.115', name: 'CIKOLATALI KURABIYE 125GR', price: 120.00, vatRate: 0.01 },
  { code: 'BG.IT.1.279', name: 'COREKOTLU KURABIYE PK 125G', price: 110.00, vatRate: 0.01 },
  { code: 'MZ.YH.108', name: 'CS TATKI DEVILS CAKE (10DLM)', price: 747.50, vatRate: 0.01 },
  { code: 'MZ.YH.120', name: 'CS TATKI FRENK UZUMLU PASTA (10DLM)', price: 747.50, vatRate: 0.01 },
  { code: 'MZ.YH.T.19', name: 'CS TATKI MOZAIK (10 DLM)', price: 747.50, vatRate: 0.01 },
  { code: 'MZ.YH.119', name: 'CS TATKI ORMAN MEY PASTA (10DLM)', price: 747.50, vatRate: 0.01 },
  { code: 'MZ.YH.135', name: 'CS TATKI SAN SEBASTIAN (10DLM)', price: 862.50, vatRate: 0.01 },
  { code: 'MZ.YH.153', name: 'CSM HAVUCLU DILIM KEK (1KUTU*16AD)', price: 1062.60, vatRate: 0.01 },
  { code: 'MZ.IC.16', name: 'DAMLA PET 500ML (1KOLI*24ADET)', price: 105.71, vatRate: 0.01 },
  { code: 'MZ.KG.155', name: 'DONDURMA KABI 200 CC (ZEYNEL BASKILI)(24PK*50AD)', price: 1067.00, vatRate: 0.2 },
  { code: 'MZ.IC.86', name: 'EARLY GREY DEM.POSET 250*3,2G', price: 379.80, vatRate: 0.01 },
  { code: 'BG.IT.1.313', name: 'FIERO CUP CIKOLATALI', price: 75.20, vatRate: 0.01 },
  { code: 'BG.IT.1.314', name: 'FIERO CUP FRAMBUAZLI', price: 75.20, vatRate: 0.01 },
  { code: 'BG.IT.1.315', name: 'FIERO CUP TOFFEE KARAMELLI', price: 75.20, vatRate: 0.01 },
  { code: 'MZ.IC.85', name: 'FIERO DEMLIK POSET CAY 6 KG.', price: 1449.00, vatRate: 0.01 },
  { code: 'MZ.IC.64', name: 'FIERO DIBEK KAHVESI 250 GR', price: 150.00, vatRate: 0.01 },
  { code: 'MZ.IC.60', name: 'FIERO ESP MILD CEK KAHVE 1000 GR (MAVİ) (1KOLI*10ADET)', price: 9823.55, vatRate: 0.01 },
  { code: 'MZ.IC.70', name: 'FIERO ESP MILD CEK KAHVE VERDI BLEND 1000 GR (KIRMIZI) (1KOLI*10ADET)', price: 8855.00, vatRate: 0.01 },
  { code: 'MZ.IC.72', name: 'FIERO FILTRE KAHVE 1000 GR (12AD)', price: 9170.40, vatRate: 0.01 },
  { code: 'MZ.YH.161', name: 'FIERO FILTRE KAHVE CREMOSO 250 GR', price: 134.60, vatRate: 0.01 },
  { code: 'MZ.DN.77', name: 'FIERO GURME CILEKLI 2,5 LT', price: 467.86, vatRate: 0.01 },
  { code: 'MZ.DN.71', name: 'FIERO GURME CIKOLATALI 5 LT', price: 1247.62, vatRate: 0.01 },
  { code: 'MZ.DN.72', name: 'FIERO GURME KARAMEL 2,5LT', price: 426.00, vatRate: 0.01 },
  { code: 'MZ.DN.70', name: 'FIERO GURME SADE 5LT', price: 1247.62, vatRate: 0.01 },
  { code: 'BG.IT.5.17', name: 'TATKI FIRIN SUTLAC COMLEK', price: 74.00, vatRate: 0.01 },
  { code: 'BG.IT.1.311', name: 'FIERO KARE TOST (AKDENIZ)', price: 51.20, vatRate: 0.01 },
  { code: 'BG.IT.1.316', name: 'FIERO KIYMALI SU BOREGI KG', price: 227.27, vatRate: 0.01 },
  { code: 'MZ.IC.96', name: 'FIERO MANGO PURE 1000 GR', price: 316.30, vatRate: 0.01 },
  { code: 'MZ.TM.48', name: 'FIERO 33*33 BASKILI PECETE (100AD*24)', price: 1029.60, vatRate: 0.2 },
  { code: 'MZ.KG.230', name: 'FIERO 12 OZ BASKILI PET BARDAK (50AD*20)', price: 3100.00, vatRate: 0.2 },
  { code: 'MZ.KG.231', name: 'FIERO 16 OZ BASKILI PET BARDAK (50 AD*20)', price: 2900.00, vatRate: 0.2 },
  { code: 'MZ.KG.170', name: 'FIERO KESE KAGIT(KUCUK)(20KG)', price: 120.20, vatRate: 0.2 },
  { code: 'MZ.KG.153', name: '8 OZ KARTON BARDAK (FIERO) (100AD*20PKT)', price: 6800.00, vatRate: 0.2 },
  { code: 'MZ.KG.199', name: '12 OZ BIBERON KPK ADET', price: 1.00, vatRate: 0.2 },
  { code: 'MZ.KG.198', name: '12 OZ DW FIERO BARDAK (100AD)', price: 430.00, vatRate: 0.2 },
  { code: 'SB.01.434', name: 'FIERO SICAK CIKOLATA 1000GR (6 ADET)', price: 1360.80, vatRate: 0.01 },
  { code: 'MZ.YH.207', name: 'FIERO SOS SIYAH CIKOLATA 2,5 KG (4 ADET)', price: 2714.00, vatRate: 0.01 },
  { code: 'MZ.YH.208', name: 'FIERO SOS BEYAZ CIKOLATA 2,5 KG (4 ADET)', price: 2714.00, vatRate: 0.01 },
  { code: 'MZ.YH.209', name: 'FIERO SOS KARAMEL 2,5 KG (4 ADET)', price: 2714.00, vatRate: 0.01 },
  { code: 'MZ.YH.174', name: 'FIERO SURUP KARAMEL', price: 563.50, vatRate: 0.01 },
  { code: 'MZ.YH.162', name: 'FIERO SURUP SIYAH CIKOLATA', price: 563.50, vatRate: 0.01 },
  { code: 'MZ.YH.163', name: 'FIERO SURUP BEYAZ CIKOLATA', price: 563.50, vatRate: 0.01 },
  { code: 'MZ.PM.05', name: 'FIERO STICK SEKER (1KOLI*3000 ADET)', price: 900.00, vatRate: 0.01 },
  { code: 'MZ.IC.83', name: 'FIERO SURUP COOL LIME', price: 310.20, vatRate: 0.01 },
  { code: 'MZ.YH.220', name: 'FİERO SURUP MANGO', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.YH.221', name: 'FİERO SURUP FINDIK', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.YH.222', name: 'FİERO SURUP YABAN MERSİNİ', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.YH.214', name: 'FİERO SURUP ÇİLEK', price: 258.80, vatRate: 0.01 },
  { code: 'SB.01.321', name: 'FIERO SURUP HIBISCUS', price: 225.00, vatRate: 0.01 },
  { code: 'MZ.IC.77', name: 'FIERO SURUP KURABIYE', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.YH.210', name: 'FIERO SURUP VANILYA', price: 258.80, vatRate: 0.01 },
  { code: 'MZ.IC.T.04', name: 'FIERO TOZ SAHLEP 1 KG', price: 293.90, vatRate: 0.01 },
  { code: 'MZ.IC.T03', name: 'FIERO TOZ SICAK CIKOLATA 1 KG', price: 251.20, vatRate: 0.01 },
  { code: 'MZ.IC.04', name: 'SODA MADEN SUYU (KOLİ*24)', price: 218.40, vatRate: 0.01 },
  { code: 'MZ.IC.05', name: 'FIERO TURK KAHVESI KG', price: 734.00, vatRate: 0.01 },
  { code: 'BG.IT.1.312', name: 'FIERO VEGAN MOZAIK PASTA 100 G (10 DILIM/KUTU) PORSİYON', price: 75.20, vatRate: 0.01 },
  { code: 'BG.IT.5.132', name: 'FIERO CILEKLI MANOLYA 180G', price: 75.20, vatRate: 0.01 },
  { code: 'BG.IT.5.133', name: 'FIERO PROFITEROL 180GR', price: 75.20, vatRate: 0.01 },
  { code: 'MZ.KG.227', name: 'FILTRE KAHVE KAGIDI (1000Lİ)', price: 1100.00, vatRate: 0.2 },
  { code: 'MZ.CS.60', name: 'GARSON ONLUGU YARIM KEMERLI FIERO', price: 825.00, vatRate: 0.1 },
  { code: 'MZ.KG.02', name: '8 OZ KAPAK 100AD*10PKT', price: 800.00, vatRate: 0.2 },
  { code: 'MZ.KG.04', name: 'INCE SIYAH PIPET 50 LI (50AD*100PKT)', price: 695.00, vatRate: 0.2 },
  { code: 'BG.IT.1.209', name: 'ISIT YE ACILI KULBASTI-PILAV (KOLİ 10LU)', price: 1850.00, vatRate: 0.01 },
  { code: 'BG.IT.1.210', name: 'ISIT YE BEGENDILI KULBASTI (KOLİ 10LU)', price: 1850.00, vatRate: 0.01 },
  { code: 'BG.IT.1.198', name: 'ISIT YE ET KOFTE PILAV (KOLİ 10LU)', price: 2243.00, vatRate: 0.01 },
  { code: 'BG.IT.1.200', name: 'ISIT YE KASARLI TAVUK KOFTE (KOLİ 10LU)', price: 1802.00, vatRate: 0.01 },
  { code: 'BG.IT.1.303', name: 'ISIT YE TERIYAKI SOSLU TAVUK BUT - PILAV (KOLİ 10LU)', price: 2013.00, vatRate: 0.01 },
  { code: 'BG.IT.1.208', name: 'ISIT YE TAVUK G.IZGARA-PILAV (KOLİ 10LU)', price: 1750.00, vatRate: 0.01 },
  { code: 'BG.IT.1.197', name: 'ISIT YE TAVUK COP SIS PILAV (KOLİ 10LU)', price: 1958.00, vatRate: 0.01 },
  { code: 'BG.IT.1.211', name: 'ISIT YE TAVUK SUYU CORBA (KOLİ 10LU)', price: 825.00, vatRate: 0.01 },
  { code: 'BG.IT.1.195', name: 'ISIT YE TAVUKLU PILAV (KOLİ 10LU)', price: 1208.00, vatRate: 0.01 },
  { code: 'BG.IT.1.310', name: 'ISIT YE VEGAN BARBUNYA KOFTE - BULGUR PILAV (KOLİ 10LU)', price: 1610.00, vatRate: 0.01 },
  { code: 'MZ.KG.96', name: 'KOLONYALI MENDIL (FIERO)(1750AD)', price: 875.00, vatRate: 0.2 },
  { code: 'MZ.CS.186', name: 'LACOS K.KOL ARMALI FIERO', price: 550.00, vatRate: 0.1 },
  { code: 'MZ.TM.25', name: 'ONLY PECETE 1*KOLI', price: 354.80, vatRate: 0.2 },
  { code: 'MZ.IC.75', name: 'ORSADRINKS SALTED CARAMEL-TUZLU KARAMEL SURUBU 750 ML', price: 586.50, vatRate: 0.01 },
  { code: 'MZ.IC.79', name: 'ORSADRINKS PURE AHUDUDU RASBERY 1 KG', price: 952.20, vatRate: 0.01 },
  { code: 'MZ.IC.78', name: 'ORSADRINKS PURE BOGURTLEN 1 KG', price: 952.20, vatRate: 0.01 },
  { code: 'MZ.IC.81', name: 'ORSADRINKS PURE KARPUZ 1KG', price: 952.20, vatRate: 0.01 },
  { code: 'MZ.IC.82', name: 'ORSADRINKS PURE SEFTALI 1KG', price: 952.20, vatRate: 0.01 },
  { code: 'MZ.IC.80', name: 'ORSADRINKS PURE YESIL ELMA 1KG', price: 638.30, vatRate: 0.01 },
  { code: 'MZ.IC.94', name: 'ORSADRINKS SURUP PINEAPPLES 750 ML', price: 495.70, vatRate: 0.01 },
  { code: 'MZ.YH.215', name: 'ORSADRINKS ŞURUP HAZELNUT - FINDIK ŞURUBU 750 ML', price: 495.70, vatRate: 0.01 },
  { code: 'MZ.IC.76', name: 'ORSADRINKS SURUP VANILLA 750 ML', price: 488.80, vatRate: 0.01 },
  { code: 'MZ.IC.110', name: 'PINAR BADEM SUTU (1KOLİ*12ADET)', price: 890.16, vatRate: 0.1 },
  { code: 'MZ.IC.112', name: 'SHIROPPO CIKOLATALI BISKUVI AROMALI SURUP', price: 190.16, vatRate: 0.1 },
  { code: 'MZ.IC.109', name: 'PINAR YULAF SUTU (1KOLİ*12ADET)', price: 890.16, vatRate: 0.1 },
  { code: 'MZ.IC.115', name: 'SHIROPPO TUZLU KARAMEL SOS (SALTED CARAMEL)', price: 555.50, vatRate: 0.01 },
  { code: 'MZ.IC.104', name: 'SHIROPPO AMARETTO SURUP 750 ML (1KOLI*6ADET)', price: 1143.58, vatRate: 0.01 },
  { code: 'MZ.IC.90', name: 'SHIROPPO BLUEBERRY COOL 750 ML', price: 238.20, vatRate: 0.01 },
  { code: 'MZ.IC.88', name: 'SHIROPPO CILEK SURUP 750 ML', price: 179.60, vatRate: 0.01 },
  { code: 'MZ.IC.102', name: 'SHIROPPO COOKIE SURUP 750 ML (1KOLI*6ADET)', price: 1143.58, vatRate: 0.01 },
  { code: 'MZ.IC.87', name: 'SHIROPPO FINDIK 750 ML', price: 179.60, vatRate: 0.01 },
  { code: 'MZ.IC.105', name: 'SHIROPPO PANNETONE UZUMLU MEYVELI KEK SURUP 750 ML', price: 190.60, vatRate: 0.01 },
  { code: 'MZ.IC.103', name: 'SHIROPPO PEAN BUTTER SURUP 750 ML', price: 190.60, vatRate: 0.01 },
  { code: 'MZ.IC.89', name: 'SHIROPPO BAL KABAKLI SPICE PUMPKIN 750 ML', price: 179.60, vatRate: 0.01 },
  { code: 'SB.01.326', name: 'SURUP AKTARIM POMPASI', price: 88.60, vatRate: 0.2 },
  { code: 'MZ.IC.12', name: 'SÜT 1/1 LT SUTAS', price: 43.85, vatRate: 0.01 },
  { code: 'MZ.IC.108', name: 'SUTAS LAKTOZSUZ 1LT SÜT ADET', price: 45.26, vatRate: 0.01 },
  { code: 'BG.IT.5.07', name: 'TATKI 200 GR KAZANDIBI', price: 65.40, vatRate: 0.01 },
  { code: 'BG.IT.3.23', name: 'TATKI CILEKLI MANOLYA DUNI', price: 65.40, vatRate: 0.01 },
  { code: 'BG.IT.5.40', name: 'TATKI 200 GR PROFITEROL', price: 65.40, vatRate: 0.01 },
  { code: 'BG.IT.5.48', name: 'TATKI 200 GR SUT PEMBE DUNI', price: 65.40, vatRate: 0.01 },
  { code: 'BG.IT.5.49', name: 'TATKI 240 GR FIRIN SUTLAC', price: 65.40, vatRate: 0.01 },
  { code: 'MZ.YH.T.40', name: 'TATKI LIMONLU SURUP 1 LT', price: 276.00, vatRate: 0.01 },
  { code: 'MZ.YH.T.43', name: 'TATKI LIMONLU SURUP 2 LT', price: 350.80, vatRate: 0.01 },
  { code: 'MZ.YH.T.47', name: 'BF KARISIK TOST KARE', price: 807.00, vatRate: 0.01 },
  { code: 'MZ.IC.122', name: 'TEACO DESTINYS CHAI (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.127', name: 'TEACO FRIENDS (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.129', name: 'TEACO JASMINE DIAMONDS (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.128', name: 'TEACO LA ISLA BONITA (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.124', name: 'TEACO LONG ISLAND (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.125', name: 'TEACO MY NAME IS LADY T (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.123', name: 'TEACO OOPS MANGO A GAIN (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.126', name: 'TEACO READ MY LIPS (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.131', name: 'FIERO CHAI LATTE TNK. 1 KG', price: 613.00, vatRate: 0.01 },
  { code: 'MZ.IC.130', name: 'TEACO THE ROOL BOSSI (2GR 100AD*1KL)', price: 1730.00, vatRate: 0.01 },
  { code: 'MZ.IC.133', name: 'MATCHA CAYI FOLYO 250GRKOLI(12ADT)', price: 1357.00, vatRate: 0.01 },
  { code: 'MZ.KG.142', name: '300 CC SEFFAF BARDAK POLIMAZ PET 12 OZ (100AD)', price: 130.00, vatRate: 0.2 },
  { code: 'MZ.KG.145', name: 'PASTA TABANI 11*11 (1PKT)*50 ADET', price: 90.00, vatRate: 0.2 },
  { code: 'MZ.YH.56', name: 'UN PATATESLI RULO BOREK100 GR (120)', price: 2412.00, vatRate: 0.01 },
  { code: 'MZ.YH.59', name: 'UN PEYNIRLI RULO BOREK100GR (120)', price: 2412.00, vatRate: 0.01 },
  { code: 'BG.IT.5.102', name: 'VAKUMLU 240 GR FIRIN SUTLAC', price: 54.00, vatRate: 0.01 },
  { code: 'MZ.CS.161', name: 'YAKA KARTI', price: 45.00, vatRate: 0.2 },
  { code: 'BG.IT.1.106', name: 'ZENCEFILLI KURABIYE PK.125G', price: 120.00, vatRate: 0.01 },
  { code: 'MZ.KG.232', name: '16 OZ SEFFAF DÜZ 95DK CLIPS KAPAK (50AD*20)', price: 880.00, vatRate: 0.2 },
  { code: 'MZ.KG.236', name: 'FIERO 12 OZ BORDO KPK 100 ADET', price: 110.00, vatRate: 0.2 },
  { code: 'MZ.KG.237', name: 'FIERO 8 OZ BORDO KPK 100 ADET', price: 90.00, vatRate: 0.2 },
  { code: 'MZ.KG.18', name: '95*300 BARDAK BOMBE DELIKLI KAPAK(50AD*20)', price: 660.00, vatRate: 0.2 },
  { code: 'SB.01.331', name: 'BAR SOS POMPA', price: 75.90, vatRate: 0.2 },
  { code: 'MZ.KG.219', name: 'KARTON CORBA KASESI ZEYNEL BASKILI ADET', price: 3.30, vatRate: 0.2 },
  { code: 'MZ.KG.218', name: 'PANDA DONDURMA KAŞIĞI (250 ADET * 1PKT)', price: 93.50, vatRate: 0.2 },
  { code: 'XX.XX.000', name: 'CHAI LATTE Teneke 1000G KOLİ (6 Adet)', price: 435.00, vatRate: 0.01 },
  { code: 'XX.XX.001', name: 'MATCHA ÇAYI Folyo 200g KOLİ (12 Adet)', price: 1180.00, vatRate: 0.01 },
];

let _pid = 1;
export const MOCK_PRODUCTS = _raw.map(p => {
  const cid = catFor(p.code, p.name);
  const cat = MOCK_CATEGORIES.find(c => c.id === cid)!;
  return {
    id: `prd_${String(_pid++).padStart(3, '0')}`,
    code: p.code,
    name: p.name,
    description: null as null,
    price: p.price,
    vatRate: p.vatRate,
    categoryId: cid,
    isActive: true,
    stockQuantity: Math.floor(Math.random() * 200) + 10,
    minOrderQuantity: 1,
    maxOrderQuantity: null as null,
    createdAt: '2025-08-16T12:00:00Z',
    updatedAt: '2025-08-16T12:00:00Z',
    category: { id: cat.id, name: cat.name, description: cat.description, isActive: cat.isActive },
    _count: { orderItems: 0 },
  };
});

// ─── Orders ──────────────────────────────────────────────────────────────────
const _p = (code: string) => MOCK_PRODUCTS.find(p => p.code === code)!;

export const MOCK_ORDERS = [
  {
    id: 'ord_001', orderNumber: 'ORD-A1B2C3', storeId: ID.demoStore,
    status: 'PENDING' as const, paymentMethod: 'BANK_TRANSFER' as const, paymentStatus: 'PENDING' as const,
    subtotal: 9823.55, vatAmount: 98.24, totalAmount: 9921.79, notes: 'Acil teslimat lütfen',
    createdAt: '2026-03-02T09:30:00Z', updatedAt: '2026-03-02T09:30:00Z',
    store: { id: ID.demoStore, name: 'Demo Şube', code: 'DEMO001', address: 'Demo Mağaza Adresi', phone: '+90 (555) 123-4567' },
    items: [
      { id: 'oi_001', productId: _p('MZ.IC.60').id, quantity: 1, unitPrice: 9823.55, vatRate: 0.01, lineTotal: 9921.79, product: { id: _p('MZ.IC.60').id, code: 'MZ.IC.60', name: _p('MZ.IC.60').name, description: null, category: { name: 'Kahve Çekirdeği' } } },
    ],
    payments: [],
  },
  {
    id: 'ord_002', orderNumber: 'ORD-D4E5F6', storeId: ID.ankStore,
    status: 'CONFIRMED' as const, paymentMethod: 'CURRENT_ACCOUNT' as const, paymentStatus: 'PAID' as const,
    subtotal: 517.60, vatAmount: 5.18, totalAmount: 522.78, notes: null,
    createdAt: '2026-03-01T14:20:00Z', updatedAt: '2026-03-01T15:00:00Z',
    store: { id: ID.ankStore, name: 'Ankara Üniversitesi Şubesi', code: 'ANK001', address: 'Ankara Üniversitesi Kampüsü', phone: '+90 (312) 123-4567' },
    items: [
      { id: 'oi_003', productId: _p('MZ.IC.77').id, quantity: 2, unitPrice: 258.80, vatRate: 0.01, lineTotal: 522.78, product: { id: _p('MZ.IC.77').id, code: 'MZ.IC.77', name: _p('MZ.IC.77').name, description: null, category: { name: 'Şuruplar' } } },
    ],
    payments: [
      { id: 'pay_001', orderId: 'ord_002', amount: 522.78, paymentMethod: 'CURRENT_ACCOUNT', paymentReference: null, status: 'PAID' as const, createdAt: '2026-03-01T15:00:00Z' },
    ],
  },
  {
    id: 'ord_003', orderNumber: 'ORD-G7H8I9', storeId: ID.demoStore,
    status: 'DELIVERED' as const, paymentMethod: 'BANK_TRANSFER' as const, paymentStatus: 'PAID' as const,
    subtotal: 240.00, vatAmount: 2.40, totalAmount: 242.40, notes: 'Test siparişi',
    createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
    store: { id: ID.demoStore, name: 'Demo Şube', code: 'DEMO001', address: 'Demo Mağaza Adresi', phone: '+90 (555) 123-4567' },
    items: [
      { id: 'oi_004', productId: _p('BG.IT.1.115').id, quantity: 2, unitPrice: 120.00, vatRate: 0.01, lineTotal: 242.40, product: { id: _p('BG.IT.1.115').id, code: 'BG.IT.1.115', name: _p('BG.IT.1.115').name, description: null, category: { name: 'Yiyecek' } } },
    ],
    payments: [
      { id: 'pay_002', orderId: 'ord_003', amount: 242.40, paymentMethod: 'BANK_TRANSFER', paymentReference: 'HVL-2026030100001', status: 'PAID' as const, createdAt: '2026-02-28T14:00:00Z' },
    ],
  },
  {
    id: 'ord_004', orderNumber: 'ORD-J1K2L3', storeId: ID.sarStore,
    status: 'SHIPPED' as const, paymentMethod: 'CURRENT_ACCOUNT' as const, paymentStatus: 'PAID' as const,
    subtotal: 860.00, vatAmount: 172.00, totalAmount: 1032.00, notes: null,
    createdAt: '2026-03-01T11:00:00Z', updatedAt: '2026-03-02T08:00:00Z',
    store: { id: ID.sarStore, name: 'Saraçoğlu Şubesi', code: 'SAR001', address: 'Saraçoğlu Mahallesi', phone: '+90 (312) 987-6543' },
    items: [
      { id: 'oi_005', productId: _p('MZ.KG.198').id, quantity: 2, unitPrice: 430.00, vatRate: 0.20, lineTotal: 1032.00, product: { id: _p('MZ.KG.198').id, code: 'MZ.KG.198', name: _p('MZ.KG.198').name, description: null, category: { name: 'Ambalaj' } } },
    ],
    payments: [
      { id: 'pay_003', orderId: 'ord_004', amount: 1032.00, paymentMethod: 'CURRENT_ACCOUNT', paymentReference: null, status: 'PAID' as const, createdAt: '2026-03-01T11:30:00Z' },
    ],
  },
];

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  orders: {
    total: MOCK_ORDERS.length, today: 1, week: 3, month: 4,
    byStatus: { pending: 1, confirmed: 1, shipped: 1, delivered: 1, cancelled: 0 },
  },
  revenue: {
    total: MOCK_ORDERS.reduce((s, o) => s + o.totalAmount, 0),
    month: MOCK_ORDERS.filter(o => o.createdAt >= '2026-03-01').reduce((s, o) => s + o.totalAmount, 0),
  },
  stores: {
    active: MOCK_STORES.length,
    topPerforming: MOCK_STORES.map(s => ({ id: s.id, name: s.name, code: s.code, ordersCount: s._count.orders, revenue: Math.round(Math.random() * 30000 + 5000) })),
  },
  products: { total: MOCK_PRODUCTS.length },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _oc = MOCK_ORDERS.length + 1;
export function generateMockOrderNumber(): string {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r = 'ORD-';
  for (let i = 0; i < 6; i++) r += c.charAt(Math.floor(Math.random() * c.length));
  return r;
}
export function getNextOrderId(): string {
  return `ord_${String(_oc++).padStart(3, '0')}`;
}
