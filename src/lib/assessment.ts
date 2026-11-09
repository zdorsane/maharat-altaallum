// Learning-difficulty checklist: the single source of truth for keys used by the parent
// wizard, the server validation and the staff/specialist views. Labels live in the i18n
// dictionaries under `assessment.items`. Educational observation only — not a diagnosis.

export const DIFFICULTY_SECTIONS = {
  WRITING: ["W_PENCIL_CONTROL", "W_PRESSURE", "W_LETTER_SIZE", "W_LINE", "W_OVERLAP"],
  SPELLING: ["S_VISUAL_CONFUSION", "S_SOUND_CONFUSION", "S_REVERSAL", "S_ALIF_YA"],
  READING: ["R_RECOGNIZE_SIMILAR", "R_CONFUSE_SHAPES", "R_VISUAL_DISCRIMINATION", "R_FORGET_NAMES"],
} as const;

export type SectionKey = keyof typeof DIFFICULTY_SECTIONS;
export type DifficultyKey = (typeof DIFFICULTY_SECTIONS)[SectionKey][number];

export const SECTION_KEYS = Object.keys(DIFFICULTY_SECTIONS) as SectionKey[];
export const ALL_DIFFICULTIES = SECTION_KEYS.flatMap((s) => [...DIFFICULTY_SECTIONS[s]]) as DifficultyKey[];

export const CONSULTATION_MODES = ["IN_PERSON", "ONLINE", "DIRECT"] as const;
export type ConsultationMode = (typeof CONSULTATION_MODES)[number];

export const GENDERS = ["MALE", "FEMALE"] as const;

export const SPECIALIST_DOC_KINDS = ["CV", "CERTIFICATE", "OTHER"] as const;

export const splitList = (s: string | null | undefined) => (s ?? "").split(",").map((x) => x.trim()).filter(Boolean);

export const isDifficulty = (k: string): k is DifficultyKey => (ALL_DIFFICULTIES as string[]).includes(k);

/** A section is complete once the parent ticked at least one item or confirmed "nothing observed". */
export function sectionDone(section: SectionKey, items: string[], clear: string[]) {
  return clear.includes(section) || DIFFICULTY_SECTIONS[section].some((k) => items.includes(k));
}

/** Sections (→ case categories) in which at least one difficulty was ticked. */
export function sectionsWithItems(items: string[]): SectionKey[] {
  return SECTION_KEYS.filter((s) => DIFFICULTY_SECTIONS[s].some((k) => items.includes(k)));
}

/** Parent may still edit a submitted assessment until the team starts working on the file. */
export const EDITABLE_CASE_STATUSES = ["RECEIVED", "WAITING_INFO"];
