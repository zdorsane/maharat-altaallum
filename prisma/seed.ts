// Development seed: reference data plus one account per role.
// Demo specialists are flagged isDemo so they are excluded from real statistics.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const DEV_PASSWORD = "Maharat2026!";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed demo accounts in production");

  const categories = ["READING", "WRITING", "SPELLING", "LETTERS", "SOUNDS", "OTHER"];
  for (const [order, key] of categories.entries()) {
    await db.caseCategory.upsert({ where: { key }, update: { order }, create: { key, order } });
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);
  const upsertUser = (email: string, fullName: string, role: string) =>
    db.user.upsert({ where: { email }, update: {}, create: { email, fullName, role, passwordHash } });

  await upsertUser("admin@maharat.local", "مدير المنصة", "SUPER_ADMIN");
  await upsertUser("reviewer@maharat.local", "سارة بن علي", "REVIEWER");

  const specUser = await upsertUser("specialist@maharat.local", "د. أمينة حداد", "SPECIALIST");
  await db.specialist.upsert({
    where: { userId: specUser.id },
    update: {},
    create: {
      userId: specUser.id,
      displayName: "د. أمينة حداد",
      title: "أخصائية أرطفونيا",
      specialization: "ORTHOPHONIST",
      bio: "ملف تجريبي لأغراض التطوير.",
      yearsExperience: 8,
      wilaya: "16",
      languages: "ar,fr",
      services: "تقييم صعوبات القراءة\nحصص تكفل أرطفوني",
      availability: "الأحد إلى الخميس، 9:00–16:00",
      isDemo: true,
      qualifications: { create: [{ title: "ماستر في الأرطفونيا", institution: "جامعة الجزائر 2", year: 2016 }] },
    },
  });

  const parent = await upsertUser("parent@maharat.local", "كريم مسعودي", "PARENT");
  const profile = await db.parentProfile.upsert({
    where: { userId: parent.id },
    update: {},
    create: { userId: parent.id, wilaya: "16", consentAt: new Date() },
  });
  if ((await db.child.count({ where: { parentId: profile.id } })) === 0) {
    await db.child.create({
      data: { parentId: profile.id, firstName: "يوسف", birthDate: new Date("2018-03-14"), schoolLevel: "PRIMARY_2", schoolLanguage: "ar" },
    });
  }

  console.log(`Seeded. Dev accounts (password: ${DEV_PASSWORD}):`);
  for (const e of ["admin", "reviewer", "specialist", "parent"]) console.log(`  ${e}@maharat.local`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
