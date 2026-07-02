/* Route registry — GTFS-inspired, extended with fields the Kenyan network
   needs: fare RANGES with condition tags, headway instead of a timetable,
   variant notes, operator.

   ALL VALUES ARE INDICATIVE SAMPLE DATA pending field verification.
   Operators marked "to verify" are placeholders. */

export const DATA_VERSION = '2026-07-sample-1';

export interface FareBand {
  offPeak: [number, number]; // KES range
  peak: [number, number];    // KES range (morning + evening rush)
  rainMax: number;           // "up to" KES when it rains / late night
}

export interface MatatuRoute {
  id: string;
  number: string;
  nickname: string;
  corridor: string;
  sacco: string;
  vehicleClass: '14-seater' | '33-seater' | 'bus' | 'mixed';
  stages: string[]; // ordered stage ids, CBD terminus first
  fare: FareBand;
  headwayMin: [number, number]; // typical wait in minutes
  firstMat: string;
  lastMat: string;
  notes?: string;
}

export const ROUTES: MatatuRoute[] = [
  {
    id: '46',
    number: '46',
    nickname: 'Kawangware 46',
    corridor: 'Valley Rd / Argwings Kodhek',
    sacco: 'Operator to verify',
    vehicleClass: 'mixed',
    stages: ['kencom', 'gpo', 'hurlingham', 'yaya', 'valley-arcade', 'kawangware'],
    fare: { offPeak: [50, 80], peak: [80, 100], rainMax: 120 },
    headwayMin: [3, 10],
    firstMat: '5:00 AM',
    lastMat: '10:30 PM',
    notes: 'Some off-peak trips terminate early at Yaya — confirm with the conductor.',
  },
  {
    id: '111',
    number: '111',
    nickname: 'Ngong via Karen',
    corridor: 'Ngong Rd',
    sacco: 'Super Metro (to verify)',
    vehicleClass: '33-seater',
    stages: ['railways', 'community', 'adams', 'dago-corner', 'racecourse', 'karen', 'ngong-town'],
    fare: { offPeak: [80, 100], peak: [100, 150], rainMax: 200 },
    headwayMin: [5, 15],
    firstMat: '4:45 AM',
    lastMat: '11:00 PM',
  },
  {
    id: '125',
    number: '125',
    nickname: 'Rongai',
    corridor: "Lang'ata Rd / Magadi Rd",
    sacco: 'Super Metro / others (to verify)',
    vehicleClass: 'mixed',
    stages: ['railways', 'nyayo', 'madaraka', 'langata-otiende', 'bomas', 'mmu', 'rongai'],
    fare: { offPeak: [70, 100], peak: [100, 150], rainMax: 200 },
    headwayMin: [3, 10],
    firstMat: '4:30 AM',
    lastMat: '11:30 PM',
    notes: 'Route 126 variant continues past Rongai to Kiserian.',
  },
  {
    id: '237',
    number: '237',
    nickname: 'Thika Road',
    corridor: 'Thika Superhighway',
    sacco: 'Kenya Mpya / Super Metro (to verify)',
    vehicleClass: 'bus',
    stages: [
      'odeon', 'ngara', 'pangani', 'muthaiga', 'allsops', 'roysambu',
      'githurai', 'kahawa', 'ku', 'ruiru', 'juja', 'thika',
    ],
    fare: { offPeak: [80, 120], peak: [120, 200], rainMax: 250 },
    headwayMin: [5, 15],
    firstMat: '4:30 AM',
    lastMat: '12:00 AM',
    notes: 'Express trips skip intermediate stages when the superhighway is clear.',
  },
  {
    id: '45',
    number: '45',
    nickname: 'Githurai 45',
    corridor: 'Thika Superhighway',
    sacco: 'Operator to verify',
    vehicleClass: 'mixed',
    stages: ['odeon', 'ngara', 'pangani', 'muthaiga', 'allsops', 'roysambu', 'githurai'],
    fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 },
    headwayMin: [3, 8],
    firstMat: '4:30 AM',
    lastMat: '11:30 PM',
  },
  {
    id: '44',
    number: '44',
    nickname: 'Githurai 44',
    corridor: 'Thika Rd / Kamiti Rd',
    sacco: 'Operator to verify',
    vehicleClass: 'mixed',
    stages: ['odeon', 'ngara', 'pangani', 'muthaiga', 'allsops', 'zimmerman', 'githurai44'],
    fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 },
    headwayMin: [3, 10],
    firstMat: '4:45 AM',
    lastMat: '11:00 PM',
  },
  {
    id: '58',
    number: '58',
    nickname: 'Buruburu',
    corridor: 'Jogoo Rd',
    sacco: 'Citi Hoppa / KBS (to verify)',
    vehicleClass: 'bus',
    stages: ['bus-station', 'muthurwa', 'city-stadium', 'makadara', 'hamza', 'buruburu'],
    fare: { offPeak: [50, 70], peak: [70, 100], rainMax: 120 },
    headwayMin: [4, 12],
    firstMat: '5:00 AM',
    lastMat: '10:30 PM',
  },
  {
    id: '23',
    number: '23',
    nickname: 'Umoja / Innercore',
    corridor: 'Jogoo Rd / Outer Ring',
    sacco: 'Umoinner (to verify)',
    vehicleClass: 'mixed',
    stages: ['ambassadeur', 'muthurwa', 'city-stadium', 'makadara', 'outer-ring', 'umoja'],
    fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 },
    headwayMin: [3, 10],
    firstMat: '4:45 AM',
    lastMat: '11:00 PM',
  },
  {
    id: '105',
    number: '105',
    nickname: 'Kikuyu 105',
    corridor: 'Waiyaki Way',
    sacco: 'Super Metro / others (to verify)',
    vehicleClass: 'mixed',
    stages: ['odeon', 'westlands', 'kangemi', 'uthiru', 'kinoo', 'kikuyu'],
    fare: { offPeak: [60, 90], peak: [100, 150], rainMax: 180 },
    headwayMin: [4, 12],
    firstMat: '4:45 AM',
    lastMat: '11:00 PM',
  },
  {
    id: '33',
    number: '33',
    nickname: 'Embakasi / Pipeline',
    corridor: 'Mombasa Rd / Airport North Rd',
    sacco: 'Embassava (to verify)',
    vehicleClass: 'mixed',
    stages: ['bus-station', 'nyayo', 'bellevue', 'gm', 'pipeline', 'embakasi'],
    fare: { offPeak: [50, 80], peak: [80, 120], rainMax: 150 },
    headwayMin: [3, 10],
    firstMat: '4:30 AM',
    lastMat: '11:30 PM',
    notes: 'In heavy traffic some trips terminate early at Pipeline ("gari inaishia Pipeline").',
  },
];

export const routesById: Record<string, MatatuRoute> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r])
);
