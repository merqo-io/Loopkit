export const PASSWORD_REQUIREMENTS_HINT =
  "Use at least 8 characters, with a lowercase letter, an uppercase letter, a number and a symbol.";

type WeakPasswordInput = {
  reasons?: readonly string[] | null;
  message?: string | null;
};

const GENERIC = "That password is too weak. Choose a longer, less common one.";

function lengthSentence(message: string): string {
  const match = /at least (\d+) characters/i.exec(message);
  return match
    ? `Password is too short. Use at least ${match[1]} characters.`
    : "Password is too short. Use a longer one.";
}

function charactersSentence(message: string): string {
  const classes: string[] = [];
  if (/abcdefghijklmnopqrstuvwxyz|a-z/.test(message)) {
    classes.push("a lowercase letter");
  }
  if (/ABCDEFGHIJKLMNOPQRSTUVWXYZ|A-Z/.test(message)) {
    classes.push("an uppercase letter");
  }
  if (/0123456789|0-9/.test(message)) classes.push("a number");
  if (/!@#|symbol/i.test(message)) classes.push("a symbol");
  if (classes.length === 0) {
    return "Password needs a wider mix of characters, such as upper and lower case letters, numbers and symbols.";
  }
  const last = classes[classes.length - 1];
  const list =
    classes.length === 1
      ? last
      : `${classes.slice(0, -1).join(", ")} and ${last}`;
  return `Password must include ${list}.`;
}

/** Builds user-facing copy from a Supabase weak_password response, never from hardcoded policy numbers. */
export function weakPasswordMessage({
  reasons,
  message,
}: WeakPasswordInput): string {
  const text = message ?? "";
  const found = new Set<string>(
    (reasons ?? []).filter(
      (r) => r === "length" || r === "characters" || r === "pwned",
    ),
  );
  if (found.size === 0) {
    if (/at least \d+ characters|too short/i.test(text)) found.add("length");
    if (/at least one character of each/i.test(text)) found.add("characters");
  }
  const parts: string[] = [];
  if (found.has("length")) parts.push(lengthSentence(text));
  if (found.has("characters")) parts.push(charactersSentence(text));
  if (found.has("pwned")) {
    parts.push(
      "This password has appeared in a data breach. Choose a different one.",
    );
  }
  return parts.length > 0 ? parts.join(" ") : GENERIC;
}

/** Returns the specific message for a weak_password error, `null` for any other error. */
export function weakPasswordErrorMessage(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const e = error as { code?: unknown; reasons?: unknown; message?: unknown };
  if (e.code !== "weak_password") return null;
  return weakPasswordMessage({
    reasons: Array.isArray(e.reasons) ? (e.reasons as string[]) : null,
    message: typeof e.message === "string" ? e.message : null,
  });
}
