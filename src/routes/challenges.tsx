import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PillTag } from "@/components/kit";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { 
  Flame, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  Dumbbell, 
  Brain, 
  BookOpen, 
  Droplet, 
  Camera, 
  Award, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Star, 
  Target, 
  HeartHandshake, 
  TrendingUp, 
  Lock,
  RotateCcw,
  Check,
  X,
  Play,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle
} from "lucide-react";

export const Route = createFileRoute("/challenges")({
  component: ChallengesRoute,
});

interface StepGuide {
  stepNum: number;
  icon: string;
  timeAr: string;
  timeEn: string;
  titleAr: string;
  titleEn: string;
  actionAr: string;
  actionEn: string;
  tipAr: string;
  tipEn: string;
}

interface ChallengeProgram {
  id: string;
  titleAr: string;
  titleEn: string;
  durationDays: number;
  difficultyAr: string;
  difficultyEn: string;
  color: string;
  gradient: string;
  badgeIcon: string;
  category: "fitness" | "mindset" | "hard" | "mastery" | "spiritual";
  descriptionAr: string;
  descriptionEn: string;
  skills: { nameAr: string; nameEn: string; xpGain: number; icon: string }[];
  dailyTasks: { id: string; textAr: string; textEn: string; icon: string; category: string }[];
  stepByStepGuide: StepGuide[];
}

const PRESET_CHALLENGES: ChallengeProgram[] = [
  {
    id: "spark-7",
    titleAr: "تحدي الانطلاقة السريعة ⚡ 7 أيام",
    titleEn: "7-Day Spark Sprint ⚡",
    durationDays: 7,
    difficultyAr: "مبتدئ • تحفيزي",
    difficultyEn: "Starter • Reset",
    color: "amber",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    badgeIcon: "⚡",
    category: "mindset",
    descriptionAr: "تنظيف الدوبامين، تنظيم النوم، والتركيز على إنجاز الأهداف الأساسية لإنعاش حياتك.",
    descriptionEn: "Dopamine detox, sleep alignment & sharp daily focus to reboot your life momentum.",
    skills: [
      { nameAr: "الانضباط الذاتي", nameEn: "Self Discipline", xpGain: 150, icon: "🧠" },
      { nameAr: "النوم والنشاط", nameEn: "Sleep Hygiene", xpGain: 100, icon: "🌙" }
    ],
    dailyTasks: [
      { id: "s1", textAr: "الاستيقاظ قبل 7:00 صباحاً بدون تأجيل", textEn: "Wake up before 7:00 AM without snooze", icon: "⏰", category: "mind" },
      { id: "s2", textAr: "شرب 1 ليتر ماء عند الاستيقاظ", textEn: "Drink 1 Liter of water upon waking", icon: "💧", category: "health" },
      { id: "s3", textAr: "قراءة 10 صفحات من كتاب مفيد", textEn: "Read 10 pages of a self-growth book", icon: "📖", category: "growth" },
      { id: "s4", textAr: "صيام الدوبامين: لا شبكات تواصل أول ساعتين", textEn: "Dopamine Detox: No social media first 2 hrs", icon: "📵", category: "focus" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "🌅",
        timeAr: "6:30 صباحاً",
        timeEn: "6:30 AM",
        titleAr: "الاستيقاظ الفوري والإنعاش",
        titleEn: "Immediate Wake-Up & Hydration",
        actionAr: "قم فوراً عند رنين المنبه بدون زر التأجيل. اشرب 1 ليتر ماء دافئ لإنعاش جسمك.",
        actionEn: "Get out of bed on first alarm without snooze. Drink 1L warm water to kickstart metabolism.",
        tipAr: "ضع الهاتف بعيداً عن السرير بـ 3 أمتار.",
        tipEn: "Keep your phone 3 meters away from your bed."
      },
      {
        stepNum: 2,
        icon: "📵",
        timeAr: "7:00 - 9:00 صباحاً",
        timeEn: "7:00 - 9:00 AM",
        titleAr: "صيام الدوبامين والاسترخاء",
        titleEn: "Dopamine Fasting & Relax",
        actionAr: "امتنع تماماً عن تفحص الإشعارات، مواقع التواصل، أو الأخبار خلال أول ساعتين من يومك.",
        actionEn: "Zero social media, news, or notifications for the first 2 hours of your day.",
        tipAr: "استبدل الشاشة بالتمارين الخفيفة والتنفس العميق.",
        tipEn: "Replace screen time with light stretching & deep breathing."
      },
      {
        stepNum: 3,
        icon: "📖",
        timeAr: "9:00 صباحاً",
        timeEn: "9:00 AM",
        titleAr: "تغذية العقل بالقراءة",
        titleEn: "Brain Fuel Reading",
        actionAr: "اقرأ 10 صفحات كاملة من كتاب في تطوير الذات، الإدارة، أو الفكر وركّز في المعاني.",
        actionEn: "Read 10 full pages of an educational/self-growth book attentively.",
        tipAr: "استخدم قلماً لتظليل الفوائد والسطور الملهِمة.",
        tipEn: "Use a highlighter to capture key insights."
      },
      {
        stepNum: 4,
        icon: "🎯",
        timeAr: "10:00 - 12:00 ظهراً",
        timeEn: "10:00 AM - 12:00 PM",
        titleAr: "إنجاز الهدف الأهم يومياً",
        titleEn: "Execute #1 Core Task",
        actionAr: "ركّز على إنجاز أصعب وأهم مهمة في يومك قبل أي شيء آخر بدون أي تشتيت.",
        actionEn: "Focus 100% on executing your single most important task before anything else.",
        tipAr: "فعل وضع الطيران على هاتفك أثناء جلسة العمل.",
        tipEn: "Turn on Airplane Mode during your deep work session."
      },
      {
        stepNum: 5,
        icon: "🌙",
        timeAr: "10:00 مساءً",
        timeEn: "10:00 PM",
        titleAr: "إغلاق الشاشات والاسترخاء",
        titleEn: "Screen Shutdown & Recovery",
        actionAr: "أغلق الشاشات قبل النوم بساعة. دوّن 3 أشياء إيجابية حدثت اليوم ونَم 8 ساعات.",
        actionEn: "Turn off screens 1 hr before sleep. Journal 3 wins of today and aim for 8 hours sleep.",
        tipAr: "اجعل الغرفة مظلمة وباردة لنوم عميق.",
        tipEn: "Keep the bedroom dark and cool for deep recovery."
      }
    ]
  },
  {
    id: "reset-30",
    titleAr: "تحدي إعادة ضبط الحياة 🚀 30 يوماً",
    titleEn: "30-Day Life Reset Challenge 🚀",
    durationDays: 30,
    difficultyAr: "متوسط • تغيير شامل",
    difficultyEn: "Intermediate • Habit Shift",
    color: "emerald",
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    badgeIcon: "🚀",
    category: "mastery",
    descriptionAr: "بناء العادات المستدامة: الرياضة، القراءة، العمل العميق، والتغذية الصحية لمدة شهر كامل.",
    descriptionEn: "Build sustainable life-changing habits: Workout, reading, deep work & clean nutrition for 30 days.",
    skills: [
      { nameAr: "اللياقة البدنية", nameEn: "Physical Fitness", xpGain: 400, icon: "🏃" },
      { nameAr: "العمل العميق", nameEn: "Deep Focus", xpGain: 500, icon: "🎯" },
      { nameAr: "التوازن النفسي", nameEn: "Mental Balance", xpGain: 300, icon: "🧘" }
    ],
    dailyTasks: [
      { id: "r1", textAr: "تمارين رياضية لمدة 45 دقيقة يومياً", textEn: "45-min daily workout or cardio", icon: "🏋️", category: "fitness" },
      { id: "r2", textAr: "شرب 3 ليتر ماء طوال اليوم", textEn: "Drink 3 Liters of water daily", icon: "💧", category: "health" },
      { id: "r3", textAr: "ساعتان من العمل التركيزي بدون تشتت", textEn: "2 hours uninterrupted deep work", icon: "🎯", category: "focus" },
      { id: "r4", textAr: "قراءة 15 صفحة كتاب وتدوين الفوائد", textEn: "Read 15 pages & write key takeaways", icon: "📚", category: "growth" },
      { id: "r5", textAr: "النوم 7-8 ساعات بانتظام", textEn: "Get 7-8 hours of quality sleep", icon: "😴", category: "health" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "⏰",
        timeAr: "6:00 صباحاً",
        timeEn: "6:00 AM",
        titleAr: "الاستيقاظ المبكر والترطيب",
        titleEn: "Early Rising & Hydration",
        actionAr: "استيقظ 6:00 صباحاً. اشرب 1 ليتر ماء فوراً وقم بتمارين الإطالة لمدة 10 دقائق.",
        actionEn: "Rise at 6:00 AM. Drink 1L water immediately and do 10 minutes of light stretching.",
        tipAr: "جهز ملابس الرياضة بجانب السرير من الليل.",
        tipEn: "Prepare your workout clothes beside your bed at night."
      },
      {
        stepNum: 2,
        icon: "🏋️",
        timeAr: "7:00 - 7:45 صباحاً",
        timeEn: "7:00 - 7:45 AM",
        titleAr: "التمرين الرياضي 45 دقيقة",
        titleEn: "45-Min Physical Workout",
        actionAr: "مارس الرياضة (جري، حديد، كارديو، أو مشي سريع) لرفع معدل النبض وحرق الدهون.",
        actionEn: "Complete a 45-minute workout session (running, strength, cardio, or power walk).",
        tipAr: "حافظ على تتبع نبضات القلب والجهد.",
        tipEn: "Track your heart rate and effort levels."
      },
      {
        stepNum: 3,
        icon: "🎯",
        timeAr: "9:30 - 11:30 صباحاً",
        timeEn: "9:30 - 11:30 AM",
        titleAr: "كتلة العمل العميق (ساعتان)",
        titleEn: "2-Hour Deep Work Block",
        actionAr: "اعمل لمدة ساعتين متواصلتين في بيئة هادئة وبدون هاتف على أهم مشاريعك.",
        actionEn: "Execute 2 uninterrupted hours of deep, high-value work on your core project.",
        tipAr: "استخدم تقنية البومودورو 50 دقيقة عمل + 10 دقائق راحة.",
        tipEn: "Use Pomodoro: 50 mins work + 10 mins break."
      },
      {
        stepNum: 4,
        icon: "📚",
        timeAr: "4:00 مساءً",
        timeEn: "4:00 PM",
        titleAr: "قراءة 15 صفحة وتدوين الأفكار",
        titleEn: "Read 15 Pages & Note Ideas",
        actionAr: "اقرأ 15 صفحة من كتاب في تخصصك واكتب ملخصاً سريعا من 3 أفكار في دفترك.",
        actionEn: "Read 15 pages of non-fiction & write a 3-bullet summary in your journal.",
        tipAr: "التدوين يضاعف نسبة تثبيت المعلومة 300%.",
        tipEn: "Journaling increases knowledge retention by 300%."
      },
      {
        stepNum: 5,
        icon: "🥗",
        timeAr: "طوال اليوم",
        timeEn: "All Day Long",
        titleAr: "التغذية الصحية وشرب 3L ماء",
        titleEn: "Clean Diet & 3L Water Target",
        actionAr: "تناول وجبات صحية كاملة البروتين والترطيب بـ 3 ليتر ماء موزعة طوال اليوم.",
        actionEn: "Eat nutrient-dense clean meals with adequate protein. Reach 3 Liters total water.",
        tipAr: "احمل قارورة ماء مدرّجة سعة 1 ليتر معك دائماً.",
        tipEn: "Carry a 1-Liter marked water bottle with you."
      }
    ]
  },
  {
    id: "hard-75",
    titleAr: "تحدي الـ 75 يوماً الشاق 🔥 75 HARD",
    titleEn: "75 HARD Protocol 🔥",
    durationDays: 75,
    difficultyAr: "خارق • صلابة ذهنية وبدنية",
    difficultyEn: "Extreme • Mental Toughness",
    color: "rose",
    gradient: "from-rose-600 via-red-600 to-orange-600",
    badgeIcon: "🔥",
    category: "hard",
    descriptionAr: "البروتوكول الأكثر قوة لتطوير الصلابة الذهنية: تمرينان يومياً، 4 ليتر ماء، قراءة، وبدون وجبات غش!",
    descriptionEn: "The ultimate mental toughness program: 2 workouts/day, 4L water, reading, strict diet, 0 cheat meals!",
    skills: [
      { nameAr: "الصلابة الذهنية", nameEn: "Mental Toughness", xpGain: 1500, icon: "🛡️" },
      { nameAr: "القوة البدنية", nameEn: "Physical Mastery", xpGain: 1200, icon: "💪" },
      { nameAr: "التزام لا يلين", nameEn: "Unshakable Will", xpGain: 1000, icon: "🔥" }
    ],
    dailyTasks: [
      { id: "h1", textAr: "تمرينان مدتهما 45 دقيقة (أحدهما خارجي)", textEn: "Two 45-min workouts (one outdoors)", icon: "🏃‍♂️", category: "fitness" },
      { id: "h2", textAr: "شرب جالون كامل ماء (3.8 ليتر)", textEn: "Drink 1 Gallon (3.8L) of water", icon: "🥛", category: "health" },
      { id: "h3", textAr: "اتباع نظام غذائي صارم بدون وجبات غش", textEn: "Follow strict clean diet (0 cheat meals)", icon: "🥗", category: "diet" },
      { id: "h4", textAr: "قراءة 10 صفحات كتاب تطوير ذات/عمل", textEn: "Read 10 pages non-fiction book", icon: "📖", category: "growth" },
      { id: "h5", textAr: "تقاط صورة يومية لمتابعة التطور البدني", textEn: "Take daily progress selfie photo", icon: "📸", category: "tracker" },
      { id: "h6", textAr: "امتناع تام عن الكحول والمشروبات السكرية", textEn: "Zero alcohol & zero sugary drinks", icon: "🚫", category: "diet" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "🥛",
        timeAr: "عند الاستيقاظ",
        timeEn: "Upon Waking Up",
        titleAr: "بدء تحدي الجالون والدايت الصارم",
        titleEn: "Start Gallon Water & Strict Diet",
        actionAr: "ابدأ بشرب الماء لتقسيم الـ 3.8 ليتر طوال اليوم. التزم بنظام غذائي محدد دون أي وجبة غش.",
        actionEn: "Begin water tracking to hit 3.8L (1 Gallon). Stick 100% to clean diet with zero cheat meals.",
        tipAr: "أي وجبة غش تعني إعادة التحدي من اليوم الأول!",
        tipEn: "Any cheat meal means restarting back to Day 1!"
      },
      {
        stepNum: 2,
        icon: "🏃‍♂️",
        timeAr: "التمرين الأول (45 دقيقة)",
        timeEn: "Workout 1 (45 Minutes)",
        titleAr: "تمرين القوة أو الكارديو الداخلي/الخارجي",
        titleEn: "Indoor/Outdoor Workout Session",
        actionAr: "أكمل 45 دقيقة كاملة من التمارين البدنية الشديدة (حديد، كارديو، سباحة).",
        actionEn: "Complete a full 45-minute intense workout (weight training, cardio, or HIIT).",
        tipAr: "تأكد من فصل التمرينين بـ 3 ساعات على الأقل.",
        tipEn: "Ensure at least 3 hours separation between workouts."
      },
      {
        stepNum: 3,
        icon: "🌳",
        timeAr: "التمرين الثاني (45 دقيقة خارجي)",
        timeEn: "Workout 2 (45 Mins - Outdoors)",
        titleAr: "التمرين الخارجي في الهواء الطلق",
        titleEn: "Outdoor Weather Workout",
        actionAr: "تمرين 45 دقيقة إجباري في الهواء الطلق مهما كانت الأحوال الجوية (مشي، جري، دراجة).",
        actionEn: "Mandatory 45-min outdoor workout regardless of weather conditions (walk, run, bike).",
        tipAr: "المشي الخارجي تحت المطر أو الحر يبني الصلابة النفسية.",
        tipEn: "Outdoor workouts build supreme mental resilience."
      },
      {
        stepNum: 4,
        icon: "📖",
        timeAr: "منتصف اليوم",
        timeEn: "Mid-Day",
        titleAr: "قراءة 10 صفحات كتب علمية/تطوير",
        titleEn: "10 Pages Educational Reading",
        actionAr: "اقرأ 10 صفحات من كتاب غير خيالي في مجال تطوير الذات، الإدارة، أو التخصص.",
        actionEn: "Read 10 pages of a non-fiction book focusing on skill, business or self-growth.",
        tipAr: "الكتب الصوتيّة والروايات الخياليّة لا تحتسب في هذا التحدي.",
        tipEn: "Audiobooks & fiction novels do not count for this rule."
      },
      {
        stepNum: 5,
        icon: "📸",
        timeAr: "مساءً",
        timeEn: "Evening",
        titleAr: "التقاط الصورة اليومية للتقدم",
        titleEn: "Take Daily Progress Selfie",
        actionAr: "التقط صورة لجسدك يومياً لتوثيق التغيير البدني المذهل على مدار الـ 75 يوماً.",
        actionEn: "Take a daily progress selfie to visually document your body transformation over 75 days.",
        tipAr: "احتفظ بالصور في ألبوم خاص لمشاهدة التحول الإبيك.",
        tipEn: "Keep photos in a private folder to witness your transformation."
      }
    ]
  },
  {
    id: "mastery-90",
    titleAr: "تحدي التحول الشامل 👑 90 يوماً",
    titleEn: "90-Day Mastermind Transformation 👑",
    durationDays: 90,
    difficultyAr: "أسطوري • إتقان المهارات والمال",
    difficultyEn: "Master • Skill & Financial Overhaul",
    color: "purple",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    badgeIcon: "👑",
    category: "mastery",
    descriptionAr: "خطة الـ 90 يوماً لبناء مشروعك، إتقان مهارة عالية القيمة، تنظيم الماليّات، والوصول لأعلى مستوى.",
    descriptionEn: "Master a high-value skill, build your project, double your savings & scale your life over 90 days.",
    skills: [
      { nameAr: "إتقان المهارات", nameEn: "Skill Mastery", xpGain: 2000, icon: "🎓" },
      { nameAr: "الاستقلال المالي", nameEn: "Financial Power", xpGain: 1500, icon: "💰" },
      { nameAr: "الإنتاجية القصوى", nameEn: "Ultra Productivity", xpGain: 1800, icon: "⚡" }
    ],
    dailyTasks: [
      { id: "m1", textAr: "3 ساعات عمل على المهارة/المشروع الخاص", textEn: "3 hours building high-value skill/project", icon: "💻", category: "work" },
      { id: "m2", textAr: "مراجعة وتسجيل جميع المصاريف اليومية", textEn: "Log every expense & protect budget", icon: "📊", category: "finance" },
      { id: "m3", textAr: "ممارسة الرياضة وقوة التحمل 60 دقيقة", textEn: "60-min intense endurance exercise", icon: "🚴", category: "fitness" },
      { id: "m4", textAr: "تعلم مفهوم جديد في مجال تخصصك يومياً", textEn: "Learn 1 key concept in your field daily", icon: "💡", category: "learning" },
      { id: "m5", textAr: "كتابة يوميات وتأمل المساء لمدة 10 دقائق", textEn: "10-min evening journaling & review", icon: "🖋️", category: "mind" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "💻",
        timeAr: "8:00 - 11:00 صباحاً",
        timeEn: "8:00 - 11:00 AM",
        titleAr: "جلسة المهارة عالية القيمة (3 ساعات)",
        titleEn: "3-Hour High-Value Skill Mastery",
        actionAr: "خصص 3 ساعات يومية لتعلم أو بناء مهارة مدرة للدخل (برمجة، تصميم، تسويق، إدارة أعمال).",
        actionEn: "Dedicate 3 daily hours learning or building a high-value monetization skill (coding, design, sales).",
        tipAr: "هذه الـ 3 ساعات هي استثمارك المستقبلي الأهم.",
        tipEn: "This 3-hour block is your core vehicle for wealth & freedom."
      },
      {
        stepNum: 2,
        icon: "📊",
        timeAr: "2:00 مساءً",
        timeEn: "2:00 PM",
        titleAr: "التدقيق المالي والتحكم بالميزانية",
        titleEn: "Financial Audit & Budget Control",
        actionAr: "سجل كل سنت تصرفه اليوم. احمِ مدخراتك والتزم بقاعدة الادخار والاستثمار 30%.",
        actionEn: "Log every single dollar spent today. Protect your budget and enforce a 30% savings rule.",
        tipAr: "راجع مصروفاتك في قسم المالية في التطبيق.",
        tipEn: "Track all expenses in the Finance tab."
      },
      {
        stepNum: 3,
        icon: "🚴",
        timeAr: "6:00 - 7:00 مساءً",
        timeEn: "6:00 - 7:00 PM",
        titleAr: "تمارين التحمل والياقة (60 دقيقة)",
        titleEn: "60-Min Endurance Workout",
        actionAr: "أكمل 60 دقيقة من تمارين قوة التحمل لزيادة طاقتك وصحة قلبك وعقلك.",
        actionEn: "Complete 60 minutes of intense physical endurance training to boost stamina & stamina.",
        tipAr: "الرياضة تزيد من تدفق الدم للعدسات العصبية للدماغ.",
        tipEn: "Exercise triples oxygen flow to cognitive brain centers."
      },
      {
        stepNum: 4,
        icon: "💡",
        timeAr: "9:00 مساءً",
        timeEn: "9:00 PM",
        titleAr: "تعلم مفهوم جديد وتطبيقه",
        titleEn: "Master 1 New Concept Daily",
        actionAr: "ادرس مفهومًا جديدًا واحداً في مجال عملك وطبقه فوراً في مشروعك.",
        actionEn: "Study 1 new strategic concept in your field and immediately test it in your project.",
        tipAr: "التعلم اليومي المالي التراكمي يخلق فارقاً ضخماً خلال 90 يوماً.",
        tipEn: "Daily compound learning yields exponential growth in 90 days."
      }
    ]
  },
  {
    id: "spiritual-30",
    titleAr: "تحدي الارتقاء الإيماني 🌙 30 يوماً",
    titleEn: "30-Day Spiritual Elevation 🌙",
    durationDays: 30,
    difficultyAr: "روحاني • سكينة وبركة",
    difficultyEn: "Spiritual • Soul & Barakah",
    color: "amber",
    gradient: "from-emerald-700 via-teal-800 to-amber-600",
    badgeIcon: "🌙",
    category: "spiritual",
    descriptionAr: "برنامج العبادة والسكينة: الفجر في المسجد، قيام الليل، أذكار اليوم، الورد اليومي، والصدقة.",
    descriptionEn: "Complete spiritual elevation: Fajr in mosque, Tahajjud, daily Athkar, Quran khatmah & Sadaqah.",
    skills: [
      { nameAr: "الصلابة الإيمانية", nameEn: "Spiritual Strength", xpGain: 800, icon: "🤲" },
      { nameAr: "البركة والسكينة", nameEn: "Inner Peace", xpGain: 700, icon: "🕊️" }
    ],
    dailyTasks: [
      { id: "sp1", textAr: "أداء صلاة الفجر في وقتها مع الجماعة", textEn: "Pray Fajr on time with congregation", icon: "🕌", category: "worship" },
      { id: "sp2", textAr: "قراءة حِزب من القرآن الكريم يومياً", textEn: "Read daily portion (Hizb) of Quran", icon: "📖", category: "worship" },
      { id: "sp3", textAr: "المحافظة على أذكار الصباح والمساء", textEn: "Recite Morning & Evening Athkar", icon: "🤲", category: "worship" },
      { id: "sp4", textAr: "تقديم صدقة يومية ولو بمبلغ بسيط/ابتسامة", textEn: "Give daily Sadaqah or act of kindness", icon: "💰", category: "deeds" },
      { id: "sp5", textAr: "صلاة ركعتين قيام الليل قبل الفجر", textEn: "Pray 2 Rakat of Tahajjud before dawn", icon: "🌌", category: "worship" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "🌌",
        timeAr: "قبل الفجر بـ 30 دقيقة",
        timeEn: "30 Mins Before Fajr",
        titleAr: "صلاة قيام الليل والاستغفار",
        titleEn: "Tahajjud Night Prayer & Istighfar",
        actionAr: "قم في السحر وصَلِّ ركعتين خاشعتين واستغفر الله والدعاء في جوف الليل الآخر.",
        actionEn: "Wake up before dawn, pray 2 peaceful Rakat of Tahajjud, make sincere Duaa & Istighfar.",
        tipAr: "الدعاء في هذا الوقت لا يُرد بإذن الله.",
        tipEn: "Duaa during the last third of the night is answered."
      },
      {
        stepNum: 2,
        icon: "🕌",
        timeAr: "أذان الفجر",
        timeEn: "Fajr Call to Prayer",
        titleAr: "صلاة الفجر في وقتها بالجماعة",
        titleEn: "Fajr Prayer On Time in Mosque",
        actionAr: "توضأ واخرج لصلاة الفجر في المسجد مع الجماعة لنيل نور وسكينة يومك.",
        actionEn: "Perform Wudu and pray Fajr on time with congregation in the mosque for daily light & barakah.",
        tipAr: "من صلى الفجر في جماعة فهو في ذمة الله.",
        tipEn: "Whoever prays Fajr in congregation is under Divine protection."
      },
      {
        stepNum: 3,
        icon: "📖",
        timeAr: "بعد الفجر / صباحاً",
        timeEn: "Post-Fajr Morning",
        titleAr: "الورد اليومي وقراءة حِزب قرآن",
        titleEn: "Daily Quran Portion & Athkar",
        actionAr: "اقرأ حِزباً كاملاً من القرآن الكريم مع أذكار الصباح في جلسة تدبّر خاشعة.",
        actionEn: "Read 1 full portion (Hizb) of the Holy Quran with Morning Athkar in quiet reflection.",
        tipAr: "استخدم قسم الورد الإسلامي في التطبيق.",
        tipEn: "Use the Islamic Hub tab to log your reading."
      },
      {
        stepNum: 4,
        icon: "💰",
        timeAr: "منتصف اليوم",
        timeEn: "Mid-Day",
        titleAr: "الصدقة اليومية وفعل الخيرات",
        titleEn: "Daily Sadaqah & Kindness",
        actionAr: "تصدق يومياً ولو بمبلغ بسيط أو إطعام محتاج أو إغاثة مكروب لنيل البركة.",
        actionEn: "Give daily charity or perform a spontaneous act of kindness and smile.",
        tipAr: "الصدقة تطفئ الخطيئة وتجلب الرزق.",
        tipEn: "Sadaqah extinguishes hardship and brings sustenance."
      }
    ]
  },
  {
    id: "glowup-21",
    titleAr: "تحدي التألق والعناية الذاتية 🌸 21 يوماً",
    titleEn: "21-Day Glow Up & Self-Love 🌸",
    durationDays: 21,
    difficultyAr: "جمالي • عادات أنثوية وصحة",
    difficultyEn: "Aesthetic • Glow & Self-Love",
    color: "pink",
    gradient: "from-pink-500 via-rose-400 to-fuchsia-500",
    badgeIcon: "🌸",
    category: "mindset",
    descriptionAr: "روتين العناية بالبشرة، شرب الماء، البيلاتس، التوكيدات الإيجابية، والتغذية النظيفة لإشراقة استثنائية.",
    descriptionEn: "Complete feminine glow up: Radiant skincare, hydration, pilates, gratitude, clean eating & restorative sleep.",
    skills: [
      { nameAr: "العناية والإشراقة", nameEn: "Glow & Skincare", xpGain: 600, icon: "✨" },
      { nameAr: "حب الذات والسلام", nameEn: "Inner Radiance", xpGain: 500, icon: "💖" },
      { nameAr: "اللياقة والرقة", nameEn: "Pilates Energy", xpGain: 400, icon: "🧘‍♀️" }
    ],
    dailyTasks: [
      { id: "g1", textAr: "روتين العناية الصباحي بالبشرة وواقي الشمس 🧴", textEn: "Morning skincare + SPF protection 🧴", icon: "🧴", category: "beauty" },
      { id: "g2", textAr: "شرب 2.5 ليتر ماء مع شرائح الليمون والنعناع 🍋", textEn: "Drink 2.5L infused water (lemon/mint) 🍋", icon: "💧", category: "health" },
      { id: "g3", textAr: "تمرين بيلاتس أو مشي خفيف 25 دقيقة 🧘‍♀️", textEn: "25-min pilates flow or gentle walk 🧘‍♀️", icon: "🧘‍♀️", category: "fitness" },
      { id: "g4", textAr: "كتابة 3 توكيدات إيجابية والامتنان في الجورنال ✍️", textEn: "Journal 3 affirmations & gratitude wins ✍️", icon: "✍️", category: "mind" },
      { id: "g5", textAr: "روتين النوم المريح بدون شاشات مع شاي البابونج 🍵", textEn: "No screens 1hr before bed + chamomile tea 🍵", icon: "🌙", category: "beauty" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "✨",
        timeAr: "الصباح الباكر",
        timeEn: "Early Morning",
        titleAr: "طقوس الجمال الصباحي والترطيب",
        titleEn: "Morning Glow Ritual & SPF",
        actionAr: "اغسلي وجهكِ بلطف، طبقي السيروم ومرطب البشرة وواقي الشمس، واشربي كوب ماء كبير مع الليمون.",
        actionEn: "Cleanse gently, apply hydrating serums, moisturizer & SPF. Drink a large glass of warm lemon water.",
        tipAr: "واقي الشمس هو السر الأول للحفاظ على شباب ونضارة البشرة.",
        tipEn: "Daily SPF is the ultimate secret for eternal skin radiance."
      },
      {
        stepNum: 2,
        icon: "🧘‍♀️",
        timeAr: "10:00 صباحاً",
        timeEn: "10:00 AM",
        titleAr: "جلسة البيلاتس وتحسين القوام",
        titleEn: "Pilates Flow & Posture Alignment",
        actionAr: "مارسي 25 دقيقة من تمارين البيلاتس أو الإطالة لتحسين استقامة الظهر وشد القوام ورفع الطاقة.",
        actionEn: "Flow through a 25-minute pilates session to strengthen your core, lengthen posture & elevate mood.",
        tipAr: "ركزي على التنفس العميق أثناء كل حركة.",
        tipEn: "Breathe deeply through your ribcage on every movement."
      },
      {
        stepNum: 3,
        icon: "🥗",
        timeAr: "الغداء ومساءً",
        timeEn: "Lunch & Afternoon",
        titleAr: "التغذية النظيفة ومشروب التخلص من السموم",
        titleEn: "Clean Glow Nutrition & Hydration",
        actionAr: "تناولي وجبة غنية بمضادات الأكسدة (توت، خضار ورقية، أفوكادو) وامتنعي عن السكريات المصنعة.",
        actionEn: "Fuel your body with antioxidant-rich whole foods, leafy greens & avoid processed sugars.",
        tipAr: "بشرتكِ مرآة لصحة أمعائكِ.",
        tipEn: "Your skin reflects your gut health and clean hydration."
      },
      {
        stepNum: 4,
        icon: "🌸",
        timeAr: "قبل النوم",
        timeEn: "Before Bed",
        titleAr: "روتين الاسترخاء وجمال الليل",
        titleEn: "Night Lavender Ritual & Beauty Sleep",
        actionAr: "اشربي شاي البابونج، ادهني يديكِ بالمرطب، اكتبي في مفكرتكِ ونامي في أجواء هادئة معطرة باللافندر.",
        actionEn: "Sip herbal tea, apply nighttime lip & hand balm, journal your thoughts & sleep 8 hours in calm darkness.",
        tipAr: "النوم قبل 11:30 ليلاً يضاعف هرمون تجدد خلايا البشرة.",
        tipEn: "Sleeping before 11:30 PM maximizes cellular skin regeneration."
      }
    ]
  },
  {
    id: "soft-75",
    titleAr: "تحدي الـ 75 يوماً المتوازن 🎀 75 SOFT",
    titleEn: "75 SOFT Protocol 🎀",
    durationDays: 75,
    difficultyAr: "متوسط • أسلوب حياة صحي ومستدام",
    difficultyEn: "Sustainable • Balanced Lifestyle",
    color: "violet",
    gradient: "from-purple-500 via-pink-500 to-rose-400",
    badgeIcon: "🎀",
    category: "fitness",
    descriptionAr: "النسخة الناعمة والمستدامة لبناء عادات تدوم: تمرين يومي، 3L ماء، قراءة، أكل صحي مع مرونة ذكية.",
    descriptionEn: "The gentle, sustainable protocol: 45-min daily movement, 3L water, 10 pages reading & flexible mindful eating.",
    skills: [
      { nameAr: "العادات المستدامة", nameEn: "Sustainable Habits", xpGain: 1000, icon: "🎀" },
      { nameAr: "اللياقة المتوازنة", nameEn: "Mindful Fitness", xpGain: 900, icon: "🏃‍♀️" }
    ],
    dailyTasks: [
      { id: "sf1", textAr: "تمرين يومي 45 دقيقة (يوم واحد راحة نشطة/مشي)", textEn: "45-min workout (1 active recovery walk/week)", icon: "👟", category: "fitness" },
      { id: "sf2", textAr: "شرب 3 ليتر ماء يومياً", textEn: "Drink 3 Liters of water daily", icon: "💧", category: "health" },
      { id: "sf3", textAr: "أكل صحي متوازن بنسبة 80/20", textEn: "Eat 80/20 balanced whole foods", icon: "🥑", category: "diet" },
      { id: "sf4", textAr: "قراءة 10 صفحات من كتاب ملهم يومياً", textEn: "Read 10 pages of an inspiring book", icon: "📖", category: "growth" },
      { id: "sf5", textAr: "جلسة تمدد وتنفس واسترخاء 10 دقائق", textEn: "10-min mindful stretch & breathing", icon: "🧘‍♀️", category: "mind" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "💧",
        timeAr: "طوال اليوم",
        timeEn: "All Day",
        titleAr: "الترطيب والوصول لـ 3 ليتر ماء",
        titleEn: "Hydration Target 3 Liters",
        actionAr: "قسمي شرب الماء على مدار اليوم بوعي وهدوء للوصول لـ 3 ليتر.",
        actionEn: "Pace your hydration throughout the day to hit your 3-Liter goal with ease.",
        tipAr: "استخدمي قارورة وردية أنيقة لتحفيزكِ.",
        tipEn: "Use an aesthetic cute bottle to make hydration fun."
      },
      {
        stepNum: 2,
        icon: "👟",
        timeAr: "وقتكِ المفضل",
        timeEn: "Your Best Time",
        titleAr: "رياضة ونشاط 45 دقيقة",
        titleEn: "45 Minutes Sport You Love",
        actionAr: "اختاري الرياضة التي تحبينها: بيلاتس، مشي خارجي، رقص، سباحة، أو تدريب أثقال خفيف.",
        actionEn: "Sport and move your body with joy: Pilates, power walking, swimming, dancing or sculpting.",
        tipAr: "الاستمرارية أهم من الشدة المفرطة.",
        tipEn: "Consistency beats intensity every single time."
      }
    ]
  },
  {
    id: "study-mastery-30",
    titleAr: "تحدي التفوق الدراسي والمهني 🎓 30 يوماً",
    titleEn: "30-Day Study & Career Mastery 🎓",
    durationDays: 30,
    difficultyAr: "متقدم • تركيز عالي ونتائج مذهلة",
    difficultyEn: "Focused • Academic & Career Excellence",
    color: "blue",
    gradient: "from-blue-600 via-indigo-600 to-sky-500",
    badgeIcon: "🎓",
    category: "mastery",
    descriptionAr: "نظام التركيز العميق (Deep Work)، تلخيص المحاضرات، حل الاختبارات، والتغلب على تشتت الهواتف.",
    descriptionEn: "Master top academic & career performance: 2h deep focus study, active recall, flashcards & zero distraction.",
    skills: [
      { nameAr: "التركيز والذاكرة", nameEn: "Deep Concentration", xpGain: 750, icon: "🧠" },
      { nameAr: "إدارة الوقت", nameEn: "Time Mastery", xpGain: 650, icon: "⏱️" }
    ],
    dailyTasks: [
      { id: "st1", textAr: "ساعتان من المذاكرة المركزة بنظام البومودورو ⏱️", textEn: "2 hours deep focus study with Pomodoro ⏱️", icon: "⏱️", category: "study" },
      { id: "st2", textAr: "مراجعة البطاقات التعليمية والاسترجاع النشط 📑", textEn: "Active recall & flashcard revision 📑", icon: "📑", category: "study" },
      { id: "st3", textAr: "إغلاق الهاتف تماماً أثناء جلسات المذاكرة 📵", textEn: "Phone on silent in another room during study 📵", icon: "📵", category: "focus" },
      { id: "st4", textAr: "ترتيب المكتب وتجهيز خطة الغد قبل النوم 🗂️", textEn: "Clean study desk & plan tomorrow's topics 🗂️", icon: "🗂️", category: "planning" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "⏱️",
        timeAr: "صباحاً أو مساءً",
        timeEn: "Study Time",
        titleAr: "كتل التركيز 50/10",
        titleEn: "50/10 Pomodoro Focus",
        actionAr: "ادرسي لمدة 50 دقيقة تركيز كامل ثم 10 دقائق راحة بعيداً عن الشاشات.",
        actionEn: "Study for 50 minutes with zero distractions, followed by a 10-minute screen-free break.",
        tipAr: "اشربي شاي أخضر لزيادة هرمون التركيز.",
        tipEn: "Green tea with L-theanine boosts focus and alpha brainwaves."
      }
    ]
  },
  {
    id: "nospend-30",
    titleAr: "تحدي التوفير والتحكم بالمال 💰 30 يوماً",
    titleEn: "30-Day No-Spend & Wealth Reset 💰",
    durationDays: 30,
    difficultyAr: "عملي • توفير واستقرار مالي",
    difficultyEn: "Practical • Financial Control",
    color: "emerald",
    gradient: "from-emerald-500 via-teal-600 to-green-600",
    badgeIcon: "💰",
    category: "mastery",
    descriptionAr: "إيقاف المشتريات العاطفية، طبخ الوجبات بالمنزل، وتوفير مبلغ محدد يومياً لبناء صندوق الحرية المالية.",
    descriptionEn: "Stop impulsive shopping, cook meals at home, track every dollar and build your savings cushion.",
    skills: [
      { nameAr: "الذكاء المالي", nameEn: "Financial Wisdom", xpGain: 600, icon: "💡" },
      { nameAr: "الادخار والتحكم", nameEn: "Smart Budgeting", xpGain: 550, icon: "💳" }
    ],
    dailyTasks: [
      { id: "ns1", textAr: "الامتناع عن أي شراء غير ضروري اليوم 🚫", textEn: "Zero unnecessary impulse spending 🚫", icon: "🚫", category: "finance" },
      { id: "ns2", textAr: "تحضير القهوة والوجبات في المنزل ☕", textEn: "Make coffee & food at home ☕", icon: "☕", category: "food" },
      { id: "ns3", textAr: "تسجيل كل مبلغ تم صرفه في قسم المالية 📝", textEn: "Log all daily transactions in Finance tab 📝", icon: "📝", category: "finance" },
      { id: "ns4", textAr: "وضع مبلغ في صندوق التوفير الذاتي 🏦", textEn: "Put savings in your piggy bank/savings account 🏦", icon: "🏦", category: "savings" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "💳",
        timeAr: "طوال اليوم",
        timeEn: "All Day",
        titleAr: "قاعدة الـ 48 ساعة قبل الشراء",
        titleEn: "The 48-Hour Purchase Rule",
        actionAr: "إذا أعجبكِ أي منتج غير ضروري، انتطري 48 ساعة قبل اتخاذ قرار الشراء.",
        actionEn: "If tempted by any non-essential item, wait 48 hours before deciding.",
        tipAr: "90% من رغبات الشراء المفاجئة تختفي بعد يومين!",
        tipEn: "90% of impulse buying desires fade away within 2 days!"
      }
    ]
  },
  {
    id: "digital-detox-14",
    titleAr: "تحدي صيام الشاشات والراحة الذهنية 🌿 14 يوماً",
    titleEn: "14-Day Digital Detox & Peace 🌿",
    durationDays: 14,
    difficultyAr: "نفسي • تصفية الذهن وعلاج الإدمان",
    difficultyEn: "Mindful • Dopamine & Screen Reset",
    color: "teal",
    gradient: "from-teal-500 via-cyan-600 to-emerald-600",
    badgeIcon: "🌿",
    category: "mindset",
    descriptionAr: "تقليل وقت الشاشات لأقل من ساعتين يومياً، المشي في الطبيعة، وتفريغ الذهن من الضغوط الرقمية.",
    descriptionEn: "Limit screen time under 2 hours, enjoy nature walks, pen-and-paper journaling & rediscover inner calm.",
    skills: [
      { nameAr: "راحة البال والصفاء", nameEn: "Mindful Serenity", xpGain: 500, icon: "🕊️" },
      { nameAr: "التحرر الرقمي", nameEn: "Digital Freedom", xpGain: 600, icon: "📵" }
    ],
    dailyTasks: [
      { id: "dd1", textAr: "وقت الشاشة الإجمالي أقل من ساعتين 📵", textEn: "Total screen time under 2 hours 📵", icon: "📵", category: "digital" },
      { id: "dd2", textAr: "ممنوع لمس الهاتف أول 60 دقيقة بعد الاستيقاظ 🌅", textEn: "No phone first 60 mins upon waking 🌅", icon: "🌅", category: "mind" },
      { id: "dd3", textAr: "مشي 30 دقيقة في الهواء الطلق بدون سماعات 🌳", textEn: "30-min outdoor walk without earbuds 🌳", icon: "🌳", category: "nature" },
      { id: "dd4", textAr: "كتابة الأفكار واليوميات بقلم وورقة 📝", textEn: "Write thoughts on paper with real pen 📝", icon: "📝", category: "journal" }
    ],
    stepByStepGuide: [
      {
        stepNum: 1,
        icon: "📵",
        timeAr: "الصباح والمساء",
        timeEn: "Morning & Night",
        titleAr: "ساعة الصمت الرقمي",
        titleEn: "Digital Silence Hour",
        actionAr: "اتركي هاتفكِ في غرفة أخرى أول ساعة من الصباح وآخر ساعة قبل النوم.",
        actionEn: "Leave your phone in another room during your first & last hour of the day.",
        tipAr: "ستشعرين بهدوء ذهني لم تعهديه من قبل.",
        tipEn: "Your anxiety will drop by more than 50% within 3 days."
      }
    ]
  }
];

function ChallengesRoute() {
  const navigate = useNavigate();
  const { lang, toggle: toggleLang } = useLang();
  const isAr = lang === "ar";

  const [activeChallengeId, setActiveChallengeId] = useState<string>(() => {
    if (typeof window === "undefined") return "reset-30";
    try {
      const saved = localStorage.getItem("pro_active_challenge_id");
      return saved || "reset-30";
    } catch {
      return "reset-30";
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pro_active_challenge_id", activeChallengeId);
    }
  }, [activeChallengeId]);

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    if (typeof window === "undefined") return [1, 2, 3, 4, 5];
    try {
      const saved = localStorage.getItem("pro_challenge_completed_days");
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
    } catch {
      return [1, 2, 3, 4, 5];
    }
  });

  const [todayTasksDone, setTodayTasksDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("pro_challenge_today_tasks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [selectedProgramView, setSelectedProgramView] = useState<ChallengeProgram | null>(null);

  useEffect(() => {
    if (selectedProgramView) {
      (window as any).__onBackOverlayDismiss = () => {
        setSelectedProgramView(null);
        return true;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }
    return () => {
      (window as any).__onBackOverlayDismiss = null;
    };
  }, [selectedProgramView]);

  const activeProgram = PRESET_CHALLENGES.find(c => c.id === activeChallengeId) || PRESET_CHALLENGES[1];

  const totalCompletedDaysCount = completedDays.length;
  const currentStreak = completedDays.length;
  const userXP = completedDays.length * 75 + Object.keys(todayTasksDone).length * 15;
  const userLevel = Math.floor(userXP / 200) + 1;
  const xpInCurrentLevel = userXP % 200;
  const xpToNextLevel = 200;

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pro_challenge_completed_days", JSON.stringify(completedDays));
    }
  }, [completedDays]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pro_challenge_today_tasks", JSON.stringify(todayTasksDone));
    }
  }, [todayTasksDone]);

  const toggleTask = (taskId: string) => {
    setTodayTasksDone(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleDayCompletion = (dayNum: number) => {
    setCompletedDays(prev => {
      if (prev.includes(dayNum)) return prev.filter(d => d !== dayNum);
      return [...prev, dayNum].sort((a, b) => a - b);
    });
  };

  const startChallengeProtocol = (program: ChallengeProgram) => {
    setActiveChallengeId(program.id);
  };

  const activeDayNumber = Math.min(completedDays.length + 1, activeProgram.durationDays);
  const completionPercentage = Math.min(100, Math.round((completedDays.length / activeProgram.durationDays) * 100));

  const handleGoBack = () => {
    const historyIdx = typeof window !== "undefined" ? (window.history.state?.idx ?? -1) : -1;
    if (historyIdx > 0) window.history.back();
    else navigate({ to: "/" });
  };

  useEffect(() => {
    if (selectedProgramView) {
      (window as any).__onBackOverlayDismiss = () => {
        setSelectedProgramView(null);
        return true;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProgramView) {
        setSelectedProgramView(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      (window as any).__onBackOverlayDismiss = null;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProgramView]);

  const categories = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "mindset", labelAr: "تطوير الذات 🧠", labelEn: "Mindset" },
    { id: "fitness", labelAr: "اللياقة والنشاط 🏃", labelEn: "Fitness" },
    { id: "mastery", labelAr: "الدراسة والمال 🎓", labelEn: "Mastery" },
  ];

  const filteredChallenges = activeCategoryFilter === "all"
    ? PRESET_CHALLENGES
    : PRESET_CHALLENGES.filter(c => c.category === activeCategoryFilter);

  const isProgramActive = selectedProgramView ? selectedProgramView.id === activeChallengeId : false;
  const programCompletion = isProgramActive ? completionPercentage : 0;
  const programCompletedDays = isProgramActive ? completedDays : [];

  return (
    <MobileShell>
      {selectedProgramView ? (
        <Screen className="bg-canvas text-ink font-sans pb-28 min-h-screen">
          <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border/80 px-4 py-3.5 flex items-center justify-between text-ink shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-back-close="true"
                aria-label="Back"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProgramView(null);
                }}
                className="cursor-pointer pointer-events-auto touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-muted active:scale-90 transition-all border border-border text-ink shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
              <div>
                <h1 className="font-display text-[19px] font-bold text-ink leading-tight">
                  {isAr ? selectedProgramView.titleAr : selectedProgramView.titleEn}
                </h1>
                <span className="text-[11px] font-bold text-hotpink">
                  {selectedProgramView.durationDays} {isAr ? "يوم" : "Days"} • {isAr ? selectedProgramView.difficultyAr : selectedProgramView.difficultyEn}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleLang} className="cursor-pointer text-[11px] font-extrabold px-3 py-1 rounded-full bg-surface border border-border text-ink hover:bg-muted">
                {isAr ? "EN" : "عربي"}
              </button>
              {isProgramActive && <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white">✓ Active</span>}
            </div>
          </header>

          <div className="relative overflow-hidden grad-theme text-white p-6 shadow-rose-md">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-amber-300/20 blur-2xl" />
            <div className="relative z-10 text-center space-y-3.5 pt-1">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md text-4xl shadow-lg border border-white/40">
                {selectedProgramView.badgeIcon}
              </div>
              <div>
                <h2 className="font-display text-[26px] font-bold text-white leading-tight">{isAr ? selectedProgramView.titleAr : selectedProgramView.titleEn}</h2>
                <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                  <span className="rounded-full bg-white/20 text-white text-[11.5px] font-extrabold px-3 py-1 border border-white/30 backdrop-blur-xs">{isAr ? selectedProgramView.difficultyAr : selectedProgramView.difficultyEn}</span>
                  <span className="rounded-full bg-amber-300 text-slate-900 text-[11.5px] font-black px-3 py-1 shadow-sm">+{selectedProgramView.durationDays * 75} XP 🏆</span>
                </div>
              </div>
              <p className="text-[13.5px] text-white/90 leading-relaxed max-w-md mx-auto font-medium">{isAr ? selectedProgramView.descriptionAr : selectedProgramView.descriptionEn}</p>
              <div className="pt-2">
                {!isProgramActive ? (
                  <button type="button" onClick={() => startChallengeProtocol(selectedProgramView)} className="w-full py-4 px-6 rounded-2xl bg-white text-hotpink font-black text-[15px] shadow-xl hover:bg-white/95 active:scale-98 transition-all flex items-center justify-center gap-2">
                    <Play className="h-5 w-5 fill-hotpink text-hotpink" />
                    <span>{isAr ? "🚀 تفعيل وبدء هذا التحدي الآن" : "🚀 Activate & Start This Challenge"}</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-white/20 border border-white/40 p-3.5 flex items-center justify-between text-white backdrop-blur-md">
                    <div className="flex items-center gap-2 text-[13.5px] font-extrabold"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><span>{isAr ? "هذا هو التحدي النشط" : "Currently Active"}</span></div>
                    <span className="text-[14px] font-black text-amber-200">{programCompletion}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-6 max-w-2xl mx-auto">
            <section className="rounded-3xl bg-card border border-border/80 p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hotpink/10 text-hotpink font-black"><Clock className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-[16.5px] font-bold text-ink">{isAr ? "الجدول والخطوات اليومية" : "Daily Execution Plan"}</h3>
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                {selectedProgramView.stepByStepGuide.map((step) => (
                  <div key={step.stepNum} className="rounded-2xl bg-surface border border-border/70 p-4 space-y-2 hover:border-hotpink/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl grad-theme text-white font-bold text-[12px]">#{step.stepNum}</span>
                        <div className="flex items-center gap-1.5"><span className="text-xl">{step.icon}</span><h4 className="font-bold text-[14.5px] text-ink">{isAr ? step.titleAr : step.titleEn}</h4></div>
                      </div>
                      <span className="text-[11px] font-bold text-ink-light bg-card px-2.5 py-0.5 rounded-full border border-border">{isAr ? step.timeAr : step.timeEn}</span>
                    </div>
                    <p className="text-[13px] text-ink/80 leading-relaxed font-medium pl-2">{isAr ? step.actionAr : step.actionEn}</p>
                    <div className="flex items-start gap-1.5 rounded-xl bg-card p-2.5 text-[11.5px] text-ink-light border border-border/60">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <span>{isAr ? step.tipAr : step.tipEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-card border border-border/80 p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-black"><ShieldCheck className="h-5 w-5" /></div>
                  <h3 className="text-[16.5px] font-bold text-ink">{isAr ? "قائمة المهام اليومية" : "Daily Tasks"}</h3>
                </div>
              </div>
              <div className="space-y-2.5 pt-1">
                {selectedProgramView.dailyTasks.map((task) => {
                  const isDone = !!todayTasksDone[task.id];
                  return (
                    <div key={task.id} onClick={() => toggleTask(task.id)} className={cn("cursor-pointer flex items-center justify-between rounded-2xl p-4 transition-all border shadow-xs", isDone ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400" : "bg-surface border-border")}>
                      <div className="flex items-center gap-3"><span className="text-xl">{task.icon}</span><span className={cn("text-[14px] font-bold", isDone && "line-through text-emerald-700")}>{isAr ? task.textAr : task.textEn}</span></div>
                      <div className={cn("flex h-7 w-7 rounded-full border-2", isDone ? "grad-theme border-transparent" : "border-border bg-card")}></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </Screen>
      ) : (
        <Screen className="bg-canvas text-ink font-sans pb-28">
        <header className="relative overflow-hidden grad-theme text-white shadow-rose-md">
          <div className="relative z-10 px-5 pt-7 pb-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                aria-label="Back"
                onClick={(e) => {
                  if (typeof window !== "undefined" && (window.history.state?.__TSR_index ?? 0) > 0) {
                    e.preventDefault();
                    window.history.back();
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white cursor-pointer active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
              </Link>
              <button onClick={toggleLang} className="text-[12px] font-extrabold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">{isAr ? "🌐 English" : "🌐 العربية"}</button>
            </div>
            <div className="mt-4 text-center"><span className="font-display text-[32px] text-white block leading-tight">{isAr ? "تحديات تطوير الذات والتحول" : "Life-Changing Challenge Studio"}</span></div>
          </div>
        </header>

        <main className="px-4 pt-5 space-y-6">
          {/* CATEGORY FILTER PILLS */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={cn(
                  "cursor-pointer px-4 py-2 rounded-2xl text-[12.5px] font-bold border shrink-0 transition-all",
                  activeCategoryFilter === cat.id
                    ? "grad-theme text-white border-transparent shadow-rose-sm scale-105"
                    : "bg-card text-ink hover:bg-surface border-border/80"
                )}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>

          {/* SECTION 1: PROGRAM SELECTOR CARDS */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-ink flex items-center gap-2">
                <Target className="h-5 w-5 text-hotpink" />
                {isAr ? "تحديات تطوير الذات والتحول" : "Life-Changing Protocols"}
              </h2>
              <span className="text-[11.5px] font-bold text-ink-light">
                {filteredChallenges.length} {isAr ? "تحديات" : "Programs"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredChallenges.map((program) => {
                const isActive = program.id === activeChallengeId;
                return (
                  <div
                    key={program.id}
                    data-testid={"challenge-card-" + program.id}
                    onClick={() => setSelectedProgramView(program)}
                    className={cn(
                      "group cursor-pointer relative overflow-hidden rounded-3xl p-5 transition-all duration-300 border shadow-card active:scale-[0.98]",
                      isActive
                        ? "bg-card border-hotpink/80 ring-2 ring-hotpink/30 shadow-rose-md"
                        : "bg-card border-border/70 hover:border-hotpink/50 shadow-sm"
                    )}
                  >
                    {/* Top Row: Badge & Days */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{program.badgeIcon}</span>
                        <div>
                          <h3 className="font-bold text-[16px] text-ink group-hover:text-hotpink transition-colors">
                            {isAr ? program.titleAr : program.titleEn}
                          </h3>
                          <span className="text-[11px] font-bold block mt-0.5 text-ink-light">
                            {isAr ? program.difficultyAr : program.difficultyEn}
                          </span>
                        </div>
                      </div>

                      <div className={cn(
                        "rounded-full text-[11.5px] font-extrabold px-3 py-1 border shrink-0",
                        isActive ? "grad-theme text-white border-transparent shadow-xs" : "bg-surface text-ink-light border-border"
                      )}>
                        {program.durationDays} {isAr ? "يوم" : "Days"}
                      </div>
                    </div>

                    <p className="mt-3 text-[12.5px] line-clamp-2 leading-relaxed text-ink-light font-medium">
                      {isAr ? program.descriptionAr : program.descriptionEn}
                    </p>

                    {/* Skill Tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {program.skills.map((sk, idx) => (
                        <span 
                          key={idx}
                          className="text-[10.5px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border bg-surface text-ink border-border"
                        >
                          <span>{sk.icon}</span>
                          <span>{isAr ? sk.nameAr : sk.nameEn}</span>
                          <span className="text-hotpink font-extrabold">+{sk.xpGain}XP</span>
                        </span>
                      ))}
                    </div>

                    {/* Action Button Bar */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[12px] font-bold">
                      <span className={isActive ? "text-hotpink font-extrabold" : "text-ink-light group-hover:text-ink font-bold"}>
                        {isActive ? (isAr ? "✓ التحدي المفعّل (انقر لعرض الخطة الكاملة)" : "✓ Active Protocol (Tap for Full Plan)") : (isAr ? "عرض الخطة والبروتوكول الكامل ➔" : "View Full Protocol & Steps ➔")}
                      </span>
                      <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", isActive ? "text-hotpink" : "text-ink-light")} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: ACTIVE PROGRAM TRACKER & DAILY PROTOCOL */}
          <section className="rounded-3xl bg-card p-5 text-ink shadow-card border border-border/80">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-hotpink">
                  {isAr ? "البروتوكول المفعّل حالياً" : "Currently Active Protocol"}
                </span>
                <h2 className="text-[20px] font-bold text-ink flex items-center gap-2 mt-0.5">
                  <span>{activeProgram.badgeIcon}</span>
                  <span>{isAr ? activeProgram.titleAr : activeProgram.titleEn}</span>
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[22px] font-black text-hotpink">
                  {completionPercentage}%
                </span>
                <span className="block text-[10px] text-ink-light font-bold uppercase">
                  {isAr ? "نسبة الإنجاز" : "Completed"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] font-bold text-ink-light mb-1.5">
                <span>{isAr ? `اليوم ${activeDayNumber} من ${activeProgram.durationDays}` : `Day ${activeDayNumber} of ${activeProgram.durationDays}`}</span>
                <span>{completedDays.length} / {activeProgram.durationDays} {isAr ? "يوم مكتمل" : "Days Done"}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-surface overflow-hidden border border-border p-0.5">
                <div 
                  className="h-full rounded-full grad-theme transition-all duration-700 shadow-sm"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* TODAY'S ACTIONABLE PROTOCOL CHECKLIST */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15.5px] font-bold text-ink flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-hotpink" />
                  {isAr ? "مهام اليوم والخطوات المطلوبة" : "Today's Action Protocol"}
                </h3>
                <span className="text-[11px] font-bold text-hotpink bg-hotpink/10 px-2.5 py-0.5 rounded-full border border-hotpink/20">
                  +{activeProgram.dailyTasks.length * 15} XP
                </span>
              </div>

              <div className="space-y-2.5">
                {activeProgram.dailyTasks.map((task) => {
                  const isDone = !!todayTasksDone[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "cursor-pointer flex items-center justify-between rounded-2xl p-3.5 transition-all duration-200 border active:scale-[0.99]",
                        isDone 
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-100 shadow-xs"
                          : "bg-surface border-border text-ink hover:border-hotpink/40"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-lg transition-transform",
                          isDone ? "scale-110" : ""
                        )}>
                          {task.icon}
                        </div>
                        <span className={cn("text-[13.5px] font-bold leading-snug", isDone && "line-through text-emerald-700 dark:text-emerald-300/80")}>
                          {isAr ? task.textAr : task.textEn}
                        </span>
                      </div>

                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isDone 
                          ? "grad-theme border-transparent text-white shadow-xs" 
                          : "border-border text-transparent bg-card"
                      )}>
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK DAY COMPLETE ACTION BUTTON */}
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => toggleDayCompletion(activeDayNumber)}
                className={cn(
                  "cursor-pointer flex-1 py-3.5 px-4 rounded-2xl font-extrabold text-[14.5px] transition-all duration-300 shadow-rose-sm flex items-center justify-center gap-2 active:scale-95 border",
                  completedDays.includes(activeDayNumber)
                    ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                    : "grad-theme text-white border-transparent hover:brightness-110"
                )}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>
                  {completedDays.includes(activeDayNumber)
                    ? (isAr ? `✓ تم توثيق اليوم ${activeDayNumber}` : `✓ Day ${activeDayNumber} Logged!`)
                    : (isAr ? `إكمال اليوم ${activeDayNumber} (+75 XP)` : `Complete Day ${activeDayNumber} (+75 XP)`)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramView(activeProgram)}
                className="cursor-pointer py-3.5 px-4 rounded-2xl font-bold text-[13.5px] bg-surface hover:bg-muted text-ink border border-border transition-all flex items-center gap-1.5"
              >
                <span>{isAr ? "عرض الخطة الكاملة" : "Full Protocol"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* SECTION 3: VISUAL DAY PROGRESS HEATMAP (1 TO 75/90 DAYS) */}
          <section className="rounded-3xl bg-card border border-border/80 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15.5px] font-bold text-ink flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-hotpink" />
                  {isAr ? "خارطة طريق الأيام والمواظبة" : "Visual Days Progress Roadmap"}
                </h3>
                <p className="text-[11.5px] text-ink-light mt-0.5 font-medium">
                  {isAr ? "انقر على أي يوم لتوثيق الإنجاز أو تعديله" : "Click any day node to log or update progress"}
                </p>
              </div>

              <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-hotpink/10 text-hotpink border border-hotpink/20">
                {activeProgram.durationDays} {isAr ? "يوم" : "Days Total"}
              </span>
            </div>

            {/* GRID OF DAY NODES */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 mt-3">
              {Array.from({ length: activeProgram.durationDays }, (_, i) => i + 1).map((dayNum) => {
                const isCompleted = completedDays.includes(dayNum);
                const isCurrent = dayNum === activeDayNumber;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => toggleDayCompletion(dayNum)}
                    className={cn(
                      "cursor-pointer flex flex-col items-center justify-center h-10 w-full rounded-2xl text-[11px] font-extrabold transition-all duration-200 border relative active:scale-90",
                      isCompleted
                        ? "grad-theme text-white border-transparent shadow-xs"
                        : isCurrent
                        ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 animate-pulse font-black"
                        : "bg-surface text-ink-light border-border hover:border-hotpink/40"
                    )}
                  >
                    <span>{dayNum}</span>
                    {isCompleted && (
                      <span className="text-[9px] leading-none mt-0.5">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: SKILL MASTERY & LIFE SKILLS PROGRESSION */}
          <section className="rounded-3xl bg-card border border-border/80 p-5 shadow-card space-y-3">
            <h3 className="text-[15.5px] font-bold text-ink flex items-center gap-2">
              <Brain className="h-5 w-5 text-hotpink" />
              {isAr ? "شجرة المهارات والتحول الشخصي" : "Life Skill Progression & Mastery"}
            </h3>

            <div className="space-y-3 pt-1">
              {[
                { nameAr: "الصلابة الذهنية والانضباط", nameEn: "Mental Toughness & Discipline", val: 84, icon: "🧠", color: "grad-theme" },
                { nameAr: "القوة البدنية والحيوية", nameEn: "Physical Fitness & Energy", val: 76, icon: "🏃‍♂️", color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
                { nameAr: "العمل العميق والإنتاجية", nameEn: "Deep Work & Focus Output", val: 90, icon: "🎯", color: "bg-gradient-to-r from-amber-500 to-orange-500" },
                { nameAr: "السكينة والروحانيات", nameEn: "Spiritual Peace & Purpose", val: 82, icon: "🌙", color: "bg-gradient-to-r from-purple-500 to-indigo-500" }
              ].map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[12.5px] font-bold">
                    <span className="flex items-center gap-1.5 text-ink">
                      <span>{skill.icon}</span>
                      <span>{isAr ? skill.nameAr : skill.nameEn}</span>
                    </span>
                    <span className="text-hotpink font-extrabold">{skill.val}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden border border-border p-0.5">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-700", skill.color)}
                      style={{ width: `${skill.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </Screen>
      )}
    </MobileShell>
  );
}