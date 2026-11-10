// ilike treats `%`, `_` and `\` as pattern syntax, so user search text must be
// escaped (backslash first) to match literally.
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export function containsPattern(term: string): string {
  return `%${escapeLike(term)}%`;
}
