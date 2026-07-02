/* Stage registry — colloquial names first, aliases for search.
   Coordinates are APPROXIMATE sample data pending field verification.
   `cbd` marks stages within a short walk of each other in the CBD,
   which the trip planner uses for walk-transfers. */

export interface Stage {
  id: string;
  name: string;
  aliases?: string[];
  lat: number;
  lng: number;
  cbd?: boolean;
}

export const STAGES: Stage[] = [
  // ── CBD ──────────────────────────────────────────────────────────────
  { id: 'kencom', name: 'Kencom', aliases: ['Kencom House', 'City Hall Way'], lat: -1.2849, lng: 36.825, cbd: true },
  { id: 'gpo', name: 'GPO', aliases: ['Kenyatta Avenue', 'Posta'], lat: -1.2864, lng: 36.8172, cbd: true },
  { id: 'odeon', name: 'Odeon', aliases: ['Odeon Cinema', 'Tom Mboya Street'], lat: -1.2826, lng: 36.8237, cbd: true },
  { id: 'railways', name: 'Railways', aliases: ['Railways Terminus', 'Haile Selassie'], lat: -1.2907, lng: 36.8285, cbd: true },
  { id: 'bus-station', name: 'Bus Station', aliases: ['Machakos Bus Stage'], lat: -1.2896, lng: 36.831, cbd: true },
  { id: 'ambassadeur', name: 'Ambassadeur', aliases: ['Ambassador', 'Hilton'], lat: -1.2866, lng: 36.8268, cbd: true },
  { id: 'muthurwa', name: 'Muthurwa', aliases: ['Muthurwa Market'], lat: -1.2886, lng: 36.8347, cbd: true },

  // ── Ngong Rd / Kawangware corridor ──────────────────────────────────
  { id: 'community', name: 'Community', aliases: ['Upper Hill', 'Bunyala Rd'], lat: -1.2958, lng: 36.8118 },
  { id: 'hurlingham', name: 'Hurlingham', lat: -1.2937, lng: 36.7994 },
  { id: 'yaya', name: 'Yaya Centre', aliases: ['Yaya'], lat: -1.2927, lng: 36.7893 },
  { id: 'valley-arcade', name: 'Valley Arcade', lat: -1.287, lng: 36.7725 },
  { id: 'kawangware', name: 'Kawangware', aliases: ['Kawangware 46', 'Congo'], lat: -1.2839, lng: 36.7442 },
  { id: 'adams', name: 'Adams Arcade', aliases: ['Adams'], lat: -1.3004, lng: 36.7778 },
  { id: 'dago-corner', name: 'Dagoretti Corner', aliases: ['Dago'], lat: -1.2996, lng: 36.7508 },
  { id: 'racecourse', name: 'Ngong Racecourse', aliases: ['Racecourse'], lat: -1.3067, lng: 36.7365 },
  { id: 'karen', name: 'Karen', aliases: ['Karen Shopping Centre'], lat: -1.3193, lng: 36.708 },
  { id: 'ngong-town', name: 'Ngong Town', aliases: ['Ngong'], lat: -1.3606, lng: 36.655 },

  // ── Lang'ata Rd / Rongai corridor ────────────────────────────────────
  { id: 'nyayo', name: 'Nyayo Stadium', aliases: ['Nyayo'], lat: -1.3041, lng: 36.8265 },
  { id: 'madaraka', name: 'Madaraka / T-Mall', aliases: ['T-Mall', 'Madaraka'], lat: -1.3095, lng: 36.814 },
  { id: 'langata-otiende', name: "Lang'ata (Otiende)", aliases: ['Otiende', 'Langata'], lat: -1.3305, lng: 36.7665 },
  { id: 'bomas', name: 'Bomas / Galleria', aliases: ['Bomas of Kenya', 'Galleria'], lat: -1.339, lng: 36.73 },
  { id: 'mmu', name: 'Multimedia University', aliases: ['MMU'], lat: -1.3796, lng: 36.7448 },
  { id: 'rongai', name: 'Rongai', aliases: ['Ongata Rongai'], lat: -1.3963, lng: 36.7446 },

  // ── Thika Rd corridor ────────────────────────────────────────────────
  { id: 'ngara', name: 'Ngara', lat: -1.2745, lng: 36.8225 },
  { id: 'pangani', name: 'Pangani', lat: -1.2679, lng: 36.8354 },
  { id: 'muthaiga', name: 'Muthaiga', aliases: ['Muthaiga Interchange'], lat: -1.258, lng: 36.85 },
  { id: 'allsops', name: 'Allsops', aliases: ['Allsopps'], lat: -1.245, lng: 36.8666 },
  { id: 'roysambu', name: 'Roysambu', lat: -1.217, lng: 36.888 },
  { id: 'githurai', name: 'Githurai 45', aliases: ['Githurai'], lat: -1.2036, lng: 36.9093 },
  { id: 'kahawa', name: 'Kahawa Sukari', aliases: ['Kahawa'], lat: -1.193, lng: 36.923 },
  { id: 'ku', name: 'Kenyatta University', aliases: ['KU'], lat: -1.18, lng: 36.936 },
  { id: 'ruiru', name: 'Ruiru', lat: -1.1466, lng: 36.9605 },
  { id: 'juja', name: 'Juja', lat: -1.1018, lng: 37.0144 },
  { id: 'thika', name: 'Thika', aliases: ['Thika Town'], lat: -1.0333, lng: 37.0693 },
  { id: 'zimmerman', name: 'Zimmerman', aliases: ['Zimma'], lat: -1.212, lng: 36.883 },
  { id: 'githurai44', name: 'Githurai 44', aliases: ['Kamiti Road'], lat: -1.199, lng: 36.901 },

  // ── Jogoo Rd / Eastlands corridor ────────────────────────────────────
  { id: 'city-stadium', name: 'City Stadium', lat: -1.2913, lng: 36.8419 },
  { id: 'makadara', name: 'Makadara', lat: -1.29, lng: 36.86 },
  { id: 'hamza', name: 'Hamza', lat: -1.293, lng: 36.863 },
  { id: 'buruburu', name: 'Buruburu', aliases: ['Buru'], lat: -1.2846, lng: 36.8788 },
  { id: 'outer-ring', name: 'Outer Ring (Jogoo Rd)', aliases: ['Outering'], lat: -1.2825, lng: 36.8855 },
  { id: 'umoja', name: 'Umoja', aliases: ['Umoja Market', 'Innercore'], lat: -1.2799, lng: 36.8945 },

  // ── Waiyaki Way corridor ─────────────────────────────────────────────
  { id: 'westlands', name: 'Westlands', aliases: ['Westi'], lat: -1.2648, lng: 36.806 },
  { id: 'kangemi', name: 'Kangemi', lat: -1.2691, lng: 36.7462 },
  { id: 'uthiru', name: 'Uthiru', lat: -1.2669, lng: 36.7134 },
  { id: 'kinoo', name: 'Kinoo', lat: -1.2531, lng: 36.6935 },
  { id: 'kikuyu', name: 'Kikuyu', aliases: ['Kikuyu Town'], lat: -1.2466, lng: 36.6626 },

  // ── Mombasa Rd / Embakasi corridor ───────────────────────────────────
  { id: 'bellevue', name: 'Bellevue', lat: -1.315, lng: 36.839 },
  { id: 'gm', name: 'General Motors', aliases: ['GM'], lat: -1.3286, lng: 36.8664 },
  { id: 'pipeline', name: 'Pipeline', lat: -1.319, lng: 36.894 },
  { id: 'embakasi', name: 'Embakasi', aliases: ['Embakasi Village'], lat: -1.324, lng: 36.901 },
];

export const stagesById: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
);
