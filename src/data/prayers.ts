export interface Prayer {
  id: string;
  name: string;
  arabic: string;
  time: string;
  rakahs: number;
  qasrRakahs: number;
}

export const prayers: Prayer[] = [
  { id: "fajr", name: "Fajr", arabic: "الفجر", time: "05:28", rakahs: 2, qasrRakahs: 2 },
  { id: "dhuhr", name: "Dhuhr", arabic: "الظهر", time: "12:45", rakahs: 4, qasrRakahs: 2 },
  { id: "asr", name: "Asr", arabic: "العصر", time: "15:52", rakahs: 4, qasrRakahs: 2 },
  { id: "maghrib", name: "Maghrib", arabic: "المغرب", time: "18:33", rakahs: 3, qasrRakahs: 3 },
  { id: "isha", name: "Isha", arabic: "العشاء", time: "20:05", rakahs: 4, qasrRakahs: 2 },
];

export const wisdomCards = [
  {
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    translation: "Indeed, prayer has been decreed upon the believers at specified times.",
    source: "Quran 4:103"
  },
  {
    arabic: "وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    translation: "And establish prayer. Indeed, prayer prohibits immorality and wrongdoing.",
    source: "Quran 29:45"
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    source: "Quran 94:6"
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "So remember Me; I will remember you.",
    source: "Quran 2:152"
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah — then He is sufficient for him.",
    source: "Quran 65:3"
  },
];

export interface LockedApp {
  id: string;
  name: string;
  icon: string;
  locked: boolean;
}

export const defaultLockedApps: LockedApp[] = [
  { id: "instagram", name: "Instagram", icon: "📷", locked: true },
  { id: "tiktok", name: "TikTok", icon: "🎵", locked: true },
  { id: "youtube", name: "YouTube", icon: "▶️", locked: true },
  { id: "twitter", name: "Twitter", icon: "🐦", locked: true },
  { id: "snapchat", name: "Snapchat", icon: "👻", locked: true },
  { id: "games", name: "Games", icon: "🎮", locked: true },
  { id: "facebook", name: "Facebook", icon: "📘", locked: true },
  { id: "reddit", name: "Reddit", icon: "🤖", locked: true },
  { id: "netflix", name: "Netflix", icon: "🎬", locked: true },
  { id: "discord", name: "Discord", icon: "💬", locked: true },
];

export const availableApps = [
  { id: "whatsapp", name: "WhatsApp", icon: "📱" },
  { id: "telegram", name: "Telegram", icon: "✈️" },
  { id: "twitch", name: "Twitch", icon: "🟣" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "spotify", name: "Spotify", icon: "🎧" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "tumblr", name: "Tumblr", icon: "📝" },
  { id: "wechat", name: "WeChat", icon: "💚" },
];
