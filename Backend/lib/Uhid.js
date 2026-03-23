// Character pools
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

/**
 * Pick `count` random characters from a given set
 */
function pickRandom(set, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * set.length);
    result.push(set[index]);
  }
  return result;
}

/**
 * Fisher–Yates shuffle (unbiased, classic)
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generate a 12-character UHID (NO DB CHECK)
 * Rules:
 * - 7 uppercase letters
 * - 5 digits
 * - total 12 characters
 */
function generateUHID() {
  const letters = pickRandom(LETTERS, 7);
  const digits = pickRandom(DIGITS, 5);

  const mixed = shuffle([...letters, ...digits]).join("");

  return {
    stored: mixed,                                   // ✅ DB value (12 chars)
    display: mixed.match(/.{1,4}/g).join(" "),       // ✅ UI value
  };
}

/**
 * Generate a UNIQUE UHID using DB check
 * Prisma is injected (controller decides DB)
 */
export async function generateUniqueUHID(prisma) {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const uhid = generateUHID();

    const exists = await prisma.patient.findUnique({
      where: { uhid: uhid.stored },
    });

    if (!exists) {
      return uhid;
    }
  }

  throw new Error("Failed to generate unique UHID after retries");
}
