export interface Dua {
  id: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
}

export const duaCategories = [
  "Morning", "Evening", "After Prayer", "Anxiety", "Forgiveness",
  "Hardship", "Sleep", "Travel", "Food", "Mosque"
] as const;

export const duas: Dua[] = [
  {
    id: "m1", category: "Morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
    transliteration: "Asbahna wa asbahal mulku lillahi wal hamdu lillah",
    translation: "We have reached the morning and at this very time the whole kingdom belongs to Allah. All praise is due to Allah.",
    source: "Sahih Muslim 2723"
  },
  {
    id: "m2", category: "Morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan nushur",
    translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.",
    source: "At-Tirmidhi 3391"
  },
  {
    id: "e1", category: "Evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsayna wa amsal mulku lillahi wal hamdu lillah",
    translation: "We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is due to Allah.",
    source: "Sahih Muslim 2723"
  },
  {
    id: "e2", category: "Evening",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    source: "Sahih Muslim 2708"
  },
  {
    id: "ap1", category: "After Prayer",
    arabic: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah",
    translation: "I seek the forgiveness of Allah (three times).",
    source: "Sahih Muslim 591"
  },
  {
    id: "ap2", category: "After Prayer",
    arabic: "اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ",
    transliteration: "Allahumma antas-salamu wa minkas-salamu tabarakta ya dhal-jalali wal-ikram",
    translation: "O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of Majesty and Honor.",
    source: "Sahih Muslim 592"
  },
  {
    id: "ax1", category: "Anxiety",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
    translation: "O Allah, I seek refuge in You from worry and grief.",
    source: "Sahih Bukhari 6369"
  },
  {
    id: "ax2", category: "Anxiety",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakil",
    translation: "Allah is sufficient for us and He is the best disposer of affairs.",
    source: "Quran 3:173"
  },
  {
    id: "f1", category: "Forgiveness",
    arabic: "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khasireen",
    translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    source: "Quran 7:23"
  },
  {
    id: "f2", category: "Forgiveness",
    arabic: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha alladhi la ilaha illa huwal hayyul qayyumu wa atubu ilayh",
    translation: "I seek forgiveness from Allah, there is no deity but He, the Living, the Self-Sustaining, and I repent to Him.",
    source: "Abu Dawud 1517"
  },
  {
    id: "h1", category: "Hardship",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    source: "Quran 21:87"
  },
  {
    id: "h2", category: "Hardship",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    transliteration: "Inna lillahi wa inna ilayhi raji'un",
    translation: "Indeed we belong to Allah, and indeed to Him we will return.",
    source: "Quran 2:156"
  },
  {
    id: "sl1", category: "Sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translation: "In Your name, O Allah, I die and I live.",
    source: "Sahih Bukhari 6324"
  },
  {
    id: "sl2", category: "Sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
    translation: "O Allah, protect me from Your punishment on the day You resurrect Your servants.",
    source: "Abu Dawud 5045"
  },
  {
    id: "tr1", category: "Travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin",
    translation: "Glory to Him who has subjected this to us, and we could never have it by our efforts.",
    source: "Quran 43:13"
  },
  {
    id: "fd1", category: "Food",
    arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    transliteration: "Bismillahi wa 'ala barakatillah",
    translation: "In the name of Allah and with the blessings of Allah.",
    source: "Abu Dawud 3767"
  },
  {
    id: "fd2", category: "Food",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    translation: "Praise be to Allah who fed us, gave us drink, and made us Muslims.",
    source: "Abu Dawud 3850"
  },
  {
    id: "ms1", category: "Mosque",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma iftah li abwaba rahmatik",
    translation: "O Allah, open for me the gates of Your mercy.",
    source: "Sahih Muslim 713"
  },
  {
    id: "ms2", category: "Mosque",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    translation: "O Allah, I ask You for Your bounty.",
    source: "Sahih Muslim 713"
  },
];
