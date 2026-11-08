// Production bootstrap, run on every deploy after migrations. Idempotent:
// - upserts reference data (case categories)
// - creates the first SUPER_ADMIN from ADMIN_EMAIL + ADMIN_PASSWORD_HASH (a bcrypt hash),
//   only when no super admin exists yet, so the plaintext password never reaches the server.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const categories = ["READING", "WRITING", "SPELLING", "LETTERS", "SOUNDS", "OTHER"];
  for (const [order, key] of categories.entries()) {
    await db.caseCategory.upsert({ where: { key }, update: { order }, create: { key, order } });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!email || !passwordHash) {
    console.log("[bootstrap] ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set; skipping admin creation");
    return;
  }
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash)) throw new Error("ADMIN_PASSWORD_HASH must be a bcrypt hash");

  if (await db.user.count({ where: { role: "SUPER_ADMIN" } })) {
    console.log("[bootstrap] super admin already exists; nothing to do");
    return;
  }
  await db.user.create({ data: { email, fullName: "Administrateur", role: "SUPER_ADMIN", passwordHash, locale: "fr" } });
  console.log(`[bootstrap] created super admin ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
