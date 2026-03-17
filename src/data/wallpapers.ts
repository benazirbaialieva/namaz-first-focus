export interface Wallpaper {
  id: string;
  name: string;
  type: "image" | "gradient";
  image?: string;
  gradient?: string;
  pro: boolean;
}

export interface WallpaperCategory {
  id: string;
  label: string;
  icon: string;
  wallpapers: Wallpaper[];
}

export const wallpaperCategories: WallpaperCategory[] = [
  {
    id: "plain",
    label: "Plain Colors",
    icon: "🎨",
    wallpapers: [
      { id: "deep-green", name: "Forest", type: "gradient", gradient: "linear-gradient(135deg, #0C2116, #163B2C)", pro: false },
      { id: "navy", name: "Navy", type: "gradient", gradient: "linear-gradient(135deg, #0A1628, #162D50)", pro: false },
      { id: "charcoal", name: "Charcoal", type: "gradient", gradient: "linear-gradient(135deg, #1A1A2E, #16213E)", pro: true },
      { id: "midnight", name: "Midnight", type: "gradient", gradient: "linear-gradient(135deg, #0F0C29, #302B63)", pro: true },
      { id: "obsidian", name: "Obsidian", type: "gradient", gradient: "linear-gradient(135deg, #0D0D0D, #1A1A1A)", pro: true },
      { id: "warm-sand", name: "Sand", type: "gradient", gradient: "linear-gradient(135deg, #2C1810, #3D2B1F)", pro: true },
      { id: "deep-plum", name: "Plum", type: "gradient", gradient: "linear-gradient(135deg, #1A0A2E, #2D1B4E)", pro: true },
      { id: "ocean", name: "Ocean", type: "gradient", gradient: "linear-gradient(135deg, #0A192F, #0D3B66)", pro: true },
    ],
  },
  {
    id: "masjid",
    label: "Masjid",
    icon: "🕌",
    wallpapers: [
      { id: "mosque-night", name: "Night Mosque", type: "image", image: "/wallpapers/mosque-night.jpg", pro: false },
      { id: "blue-mosque", name: "Blue Mosque", type: "image", image: "/wallpapers/blue-mosque.jpg", pro: false },
      { id: "medina", name: "Medina", type: "image", image: "/wallpapers/medina.jpg", pro: true },
      { id: "masjid-dawn", name: "Dawn", type: "image", image: "/wallpapers/mosque-dawn.jpg", pro: true },
      { id: "masjid-golden", name: "Golden Hour", type: "image", image: "/wallpapers/mosque-golden.jpg", pro: true },
      { id: "hassan-mosque", name: "Hassan II", type: "image", image: "/wallpapers/hassan-mosque.jpg", pro: true },
      { id: "cordoba", name: "Córdoba", type: "image", image: "/wallpapers/cordoba.jpg", pro: true },
      { id: "lake-mosque", name: "Lake Mosque", type: "image", image: "/wallpapers/lake-mosque.jpg", pro: true },
      { id: "sunset-mosque", name: "Sunset", type: "image", image: "/wallpapers/sunset-mosque.jpg", pro: true },
      { id: "djenne", name: "Djenné", type: "image", image: "/wallpapers/djenne.jpg", pro: true },
      { id: "desert-fort", name: "Desert Fort", type: "image", image: "/wallpapers/desert-fort.jpg", pro: true },
    ],
  },
  {
    id: "kaaba",
    label: "Kaaba",
    icon: "🕋",
    wallpapers: [
      { id: "kaaba", name: "Kaaba", type: "image", image: "/wallpapers/kaaba.jpg", pro: false },
      { id: "kaaba-aerial", name: "Aerial", type: "image", image: "/wallpapers/kaaba-aerial.jpg", pro: false },
      { id: "kaaba-night", name: "Night", type: "gradient", gradient: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #c9a84c 100%)", pro: true },
      { id: "kaaba-marble", name: "Marble", type: "gradient", gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%)", pro: true },
      { id: "kaaba-gold", name: "Gold", type: "gradient", gradient: "linear-gradient(135deg, #1a0f00 0%, #3d2b1f 50%, #d4a849 100%)", pro: true },
    ],
  },
  {
    id: "night",
    label: "Night & Moon",
    icon: "🌙",
    wallpapers: [
      { id: "crescent", name: "Crescent", type: "image", image: "/wallpapers/crescent.jpg", pro: false },
      { id: "moonlit", name: "Moonlit", type: "image", image: "/wallpapers/moonlit.jpg", pro: false },
      { id: "aurora", name: "Aurora", type: "image", image: "/wallpapers/aurora.jpg", pro: true },
      { id: "desert-night", name: "Desert Night", type: "image", image: "/wallpapers/desert-night.jpg", pro: true },
      { id: "starry-night", name: "Starry", type: "gradient", gradient: "linear-gradient(180deg, #020111 0%, #0a0d2c 40%, #191970 100%)", pro: true },
      { id: "twilight", name: "Twilight", type: "gradient", gradient: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #544a7d 100%)", pro: true },
    ],
  },
  {
    id: "minimalist",
    label: "Minimalist",
    icon: "✦",
    wallpapers: [
      { id: "soft-black", name: "Soft Black", type: "gradient", gradient: "linear-gradient(180deg, #111111, #1a1a1a)", pro: false },
      { id: "muted-teal", name: "Muted Teal", type: "gradient", gradient: "linear-gradient(180deg, #0a1a1a, #0f2b2b)", pro: false },
      { id: "slate", name: "Slate", type: "gradient", gradient: "linear-gradient(180deg, #1e293b, #334155)", pro: true },
      { id: "ash", name: "Ash", type: "gradient", gradient: "linear-gradient(180deg, #1c1c1c, #2a2a2a)", pro: true },
      { id: "ink", name: "Ink", type: "gradient", gradient: "linear-gradient(180deg, #0d1117, #161b22)", pro: true },
      { id: "stone", name: "Stone", type: "gradient", gradient: "linear-gradient(180deg, #1a1a18, #2d2d28)", pro: true },
    ],
  },
  {
    id: "aesthetic",
    label: "Aesthetic",
    icon: "🌸",
    wallpapers: [
      { id: "geometric", name: "Geometric", type: "image", image: "/wallpapers/geometric.jpg", pro: false },
      { id: "quran", name: "Quran", type: "image", image: "/wallpapers/quran.jpg", pro: false },
      { id: "emerald-glow", name: "Emerald", type: "image", image: "/wallpapers/emerald.jpg", pro: true },
      { id: "rose-gold", name: "Rose Gold", type: "image", image: "/wallpapers/rose-gold.jpg", pro: true },
      { id: "sapphire", name: "Sapphire", type: "gradient", gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a2d5a 50%, #4a7bd4 100%)", pro: true },
      { id: "amber", name: "Amber", type: "gradient", gradient: "linear-gradient(135deg, #1a0f00 0%, #3d2b1f 50%, #d49a4a 100%)", pro: true },
      { id: "jade", name: "Jade", type: "gradient", gradient: "linear-gradient(135deg, #0a1a0f 0%, #1a3d28 50%, #4ad49a 100%)", pro: true },
    ],
  },
];

export const allWallpapers = wallpaperCategories.flatMap(c => c.wallpapers);

export const appIcons = [
  { id: "carpet", name: "Carpet", emoji: "🕌" },
  { id: "moon", name: "Moon", emoji: "🌙" },
  { id: "kaaba", name: "Kaaba", emoji: "🕋" },
  { id: "star", name: "Star", emoji: "⭐" },
  { id: "lamp", name: "Lamp", emoji: "🪔" },
  { id: "book", name: "Quran", emoji: "📖" },
  { id: "beads", name: "Beads", emoji: "📿" },
];
