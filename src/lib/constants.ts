// Domain keys. Display labels live in the i18n dictionaries (src/lib/i18n/dictionaries).

export const ROLES = ["SUPER_ADMIN", "ADMIN", "REVIEWER", "SPECIALIST", "PARENT"] as const;
export type Role = (typeof ROLES)[number];

/** Home route of each role's space. */
export const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  REVIEWER: "/review",
  SPECIALIST: "/specialist",
  PARENT: "/parent",
};

export const CASE_STATUSES = [
  "RECEIVED",
  "UNDER_REVIEW",
  "WAITING_INFO",
  "ASSESSMENT_RECOMMENDED",
  "APPOINTMENT_SET",
  "REFERRED",
  "FOLLOW_UP",
  "CLOSED",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const STATUS_TONE: Record<CaseStatus, "info" | "warn" | "violet" | "success" | "neutral" | "primary"> = {
  RECEIVED: "info",
  UNDER_REVIEW: "primary",
  WAITING_INFO: "warn",
  ASSESSMENT_RECOMMENDED: "violet",
  APPOINTMENT_SET: "violet",
  REFERRED: "violet",
  FOLLOW_UP: "success",
  CLOSED: "neutral",
};

export const CATEGORY_KEYS = ["READING", "WRITING", "SPELLING", "LETTERS", "SOUNDS", "OTHER"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const PRIOR_SUPPORT = ["NONE", "ASSESSMENT", "SUPPORT", "BOTH"] as const;

export const SCHOOL_LEVELS = ["PRESCHOOL", "PRIMARY_1", "PRIMARY_2", "PRIMARY_3", "PRIMARY_4", "PRIMARY_5", "MIDDLE", "NOT_SCHOOLED"] as const;

export const SCHOOL_LANGUAGES = ["ar", "fr", "ar_fr", "other"] as const;

export const SPECIALIZATION_KEYS = ["ORTHOPHONIST", "EDU_PSYCH", "SPECIAL_ED", "PSYCHOLOGIST", "TRAINER"] as const;

export const PROGRAM_CATEGORIES = [
  "LETTER_RECOGNITION",
  "PRONUNCIATION",
  "SOUND_DISCRIMINATION",
  "LETTER_SOUND",
  "SYLLABLES",
  "READING",
  "WRITING",
  "SPELLING",
] as const;

export const EXERCISE_TYPES = ["LETTER_PICK", "SOUND_PICK", "MATCH_IMAGE", "BUILD_WORD", "SPELL", "READ"] as const;
export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/** The 58 wilayas of Algeria: [code, Arabic name, Latin name]. */
export const WILAYAS: [string, string, string][] = [
  ["01", "أدرار", "Adrar"], ["02", "الشلف", "Chlef"], ["03", "الأغواط", "Laghouat"], ["04", "أم البواقي", "Oum El Bouaghi"],
  ["05", "باتنة", "Batna"], ["06", "بجاية", "Béjaïa"], ["07", "بسكرة", "Biskra"], ["08", "بشار", "Béchar"],
  ["09", "البليدة", "Blida"], ["10", "البويرة", "Bouira"], ["11", "تمنراست", "Tamanrasset"], ["12", "تبسة", "Tébessa"],
  ["13", "تلمسان", "Tlemcen"], ["14", "تيارت", "Tiaret"], ["15", "تيزي وزو", "Tizi Ouzou"], ["16", "الجزائر", "Alger"],
  ["17", "الجلفة", "Djelfa"], ["18", "جيجل", "Jijel"], ["19", "سطيف", "Sétif"], ["20", "سعيدة", "Saïda"],
  ["21", "سكيكدة", "Skikda"], ["22", "سيدي بلعباس", "Sidi Bel Abbès"], ["23", "عنابة", "Annaba"], ["24", "قالمة", "Guelma"],
  ["25", "قسنطينة", "Constantine"], ["26", "المدية", "Médéa"], ["27", "مستغانم", "Mostaganem"], ["28", "المسيلة", "M'Sila"],
  ["29", "معسكر", "Mascara"], ["30", "ورقلة", "Ouargla"], ["31", "وهران", "Oran"], ["32", "البيض", "El Bayadh"],
  ["33", "إليزي", "Illizi"], ["34", "برج بوعريريج", "Bordj Bou Arréridj"], ["35", "بومرداس", "Boumerdès"], ["36", "الطارف", "El Tarf"],
  ["37", "تندوف", "Tindouf"], ["38", "تيسمسيلت", "Tissemsilt"], ["39", "الوادي", "El Oued"], ["40", "خنشلة", "Khenchela"],
  ["41", "سوق أهراس", "Souk Ahras"], ["42", "تيبازة", "Tipaza"], ["43", "ميلة", "Mila"], ["44", "عين الدفلى", "Aïn Defla"],
  ["45", "النعامة", "Naâma"], ["46", "عين تموشنت", "Aïn Témouchent"], ["47", "غرداية", "Ghardaïa"], ["48", "غليزان", "Relizane"],
  ["49", "تيميمون", "Timimoun"], ["50", "برج باجي مختار", "Bordj Badji Mokhtar"], ["51", "أولاد جلال", "Ouled Djellal"], ["52", "بني عباس", "Béni Abbès"],
  ["53", "عين صالح", "In Salah"], ["54", "عين قزام", "In Guezzam"], ["55", "تقرت", "Touggourt"], ["56", "جانت", "Djanet"],
  ["57", "المغير", "El M'Ghair"], ["58", "المنيعة", "El Meniaa"],
];

export function wilayaName(code: string | null | undefined, locale = "ar") {
  const w = WILAYAS.find((x) => x[0] === code);
  if (!w) return code ?? "";
  return locale === "ar" ? w[1] : w[2];
}
