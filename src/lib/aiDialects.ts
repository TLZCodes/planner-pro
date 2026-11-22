/**
 * AYXA Muse Pro — Multilingual & Multi-Dialect Text Preferences
 * Supports all Arabic dialects (Moroccan Darija, Saudi/Gulf, Egyptian, Levantine,
 * Emirati, Algerian/Tunisian, Iraqi, Standard Arabic) and international languages
 * (French, Spanish, German, Turkish, Italian, English) for text conversations.
 */

export interface AiDialectOption {
  id: string;
  flag: string;
  labelAr: string;
  labelEn: string;
  promptInstruction: string;
}

export const AI_DIALECT_OPTIONS: AiDialectOption[] = [
  {
    id: "auto",
    flag: "🌍",
    labelAr: "تلقائي ذكي (يكتب بنفس لغتكِ أو لهجتكِ)",
    labelEn: "Smart Auto-Detect (Matches your language/dialect)",
    promptInstruction:
      "Automatically detect the exact language OR Arabic dialect the user writes in (whether Standard Arabic, Moroccan Darija, Saudi/Gulf, Egyptian, Levantine, Algerian/Tunisian, Iraqi, French, Spanish, German, Turkish, Italian, or English) and reply fluently in that exact same language or dialect!",
  },
  {
    id: "ar-fusha",
    flag: "🕌",
    labelAr: "العربية الفصحى الراقية",
    labelEn: "Modern Standard Arabic (Fusha)",
    promptInstruction:
      "Reply in elegant, warm, modern Standard Arabic (العربية الفصحى الراقية) with sisterly feminine addressing.",
  },
  {
    id: "ar-MA",
    flag: "🇲🇦",
    labelAr: "الدارجة المغربية (Moroccan Darija)",
    labelEn: "Moroccan Darija (الدارجة المغربية)",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Moroccan Darija (الدارجة المغربية الأنثوية اللطيفة، مثل: الزين ديالي، حبيبتي، غادي نرتبو نهارك، بالصحة والراحة، بشوية عليك).",
  },
  {
    id: "ar-SA",
    flag: "🇸🇦",
    labelAr: "اللهجة السعودية والخليجية",
    labelEn: "Saudi & Khaleeji Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Saudi / Khaleeji feminine Arabic (اللهجة السعودية والخليجية اللطيفة، مثل: يا قلبي، أبشري، ولا يهمك، بنرتب يومك بكل هدوء).",
  },
  {
    id: "ar-EG",
    flag: "🇪🇬",
    labelAr: "اللهجة المصرية",
    labelEn: "Egyptian Arabic Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Egyptian feminine Arabic (اللهجة المصرية اللطيفة، مثل: يا قمر، حبيبتي، يلا نرتب يومك، خطوة بخطوة ومن غير أي ضغط).",
  },
  {
    id: "ar-LB",
    flag: "🇱🇧",
    labelAr: "اللهجة الشامية (لبنانية / سورية)",
    labelEn: "Levantine (Lebanese / Syrian)",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Levantine (Lebanese/Syrian) feminine Arabic (اللهجة الشامية اللطيفة، مثل: تكرم عينك يا حلوة، رح نرتب يومك برواق وهدوء).",
  },
  {
    id: "ar-AE",
    flag: "🇦🇪",
    labelAr: "اللهجة الإماراتية",
    labelEn: "Emirati Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Emirati feminine Arabic (اللهجة الإماراتية الراقية، مثل: فالج طيب يا الغلا، بنرتب جدولج بكل راحة).",
  },
  {
    id: "ar-DZ",
    flag: "🇩🇿",
    labelAr: "اللهجة الجزائرية والتونسية",
    labelEn: "Algerian & Tunisian Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Algerian/Tunisian feminine Arabic (اللهجة الجزائرية والتونسية اللطيفة، مثل: حنونة، يعيشك، راح نرتبو نهارك بالعقل وبكل راحة).",
  },
  {
    id: "ar-IQ",
    flag: "🇮🇶",
    labelAr: "اللهجة العراقية",
    labelEn: "Iraqi Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Iraqi feminine Arabic (اللهجة العراقية اللطيفة، مثل: عيوني، تدللين حبيبتي، راح نرتب يومج بهدوء).",
  },
  {
    id: "fr-FR",
    flag: "🇫🇷",
    labelAr: "الفرنسية (Français)",
    labelEn: "Français (French)",
    promptInstruction:
      "Reply fluently in chic, warm, sisterly French (Français).",
  },
  {
    id: "es-ES",
    flag: "🇪🇸",
    labelAr: "الإسبانية (Español)",
    labelEn: "Español (Spanish)",
    promptInstruction:
      "Reply fluently in warm, empowering, sisterly Spanish (Español).",
  },
  {
    id: "de-DE",
    flag: "🇩🇪",
    labelAr: "الألمانية (Deutsch)",
    labelEn: "Deutsch (German)",
    promptInstruction:
      "Reply fluently in warm, mindful, structured German (Deutsch).",
  },
  {
    id: "tr-TR",
    flag: "🇹🇷",
    labelAr: "التركية (Türkçe)",
    labelEn: "Türkçe (Turkish)",
    promptInstruction:
      "Reply fluently in warm, sisterly Turkish (Türkçe).",
  },
  {
    id: "it-IT",
    flag: "🇮🇹",
    labelAr: "الإيطالية (Italiano)",
    labelEn: "Italiano (Italian)",
    promptInstruction:
      "Reply fluently in warm, elegant Italian (Italiano).",
  },
  {
    id: "en-US",
    flag: "🇺🇸",
    labelAr: "الإنجليزية (English)",
    labelEn: "English",
    promptInstruction:
      "Reply fluently in warm, aesthetic, sisterly English.",
  },
];
