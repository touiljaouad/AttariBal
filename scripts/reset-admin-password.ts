import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { admins } from "../src/db/schema";
import { hashPassword, verifyPassword } from "../src/lib/auth";

/**
 * Secure password recovery for the store owner.
 *
 *   npx tsx scripts/reset-admin-password.ts <admin-email>
 *
 * The new password is read from an interactive prompt (never from argv or a
 * committed file) so it does not leak into shell history or process lists.
 */
async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/reset-admin-password.ts <admin-email>");
    process.exit(1);
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin) {
    console.error(`Aucun administrateur trouvé pour : ${email}`);
    process.exit(1);
  }

  const password = await promptHidden("Nouveau mot de passe (10 caractères minimum) : ");
  if (!password || password.length < 10) {
    console.error("Mot de passe trop court : 10 caractères minimum.");
    process.exit(1);
  }

  const confirmation = await promptHidden("Confirmer le mot de passe : ");
  if (password !== confirmation) {
    console.error("Les deux mots de passe ne correspondent pas.");
    process.exit(1);
  }

  const passwordHash = hashPassword(password);
  if (!verifyPassword(password, passwordHash)) {
    console.error("Erreur de hachage, opération annulée.");
    process.exit(1);
  }

  await db.update(admins).set({ passwordHash }).where(eq(admins.id, admin.id));
  console.log(`Mot de passe mis à jour pour ${admin.email}. Connectez-vous sur /admin/login.`);
  process.exit(0);
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    process.stdout.write(question);
    if (stdin.isTTY && stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          if (stdin.isTTY && stdin.setRawMode) stdin.setRawMode(Boolean(wasRaw));
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          if (stdin.isTTY && stdin.setRawMode) stdin.setRawMode(Boolean(wasRaw));
          process.stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else value += char;
      }
    };
    stdin.on("data", onData);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
