const numberedLinePattern = /^\s*\d{1,3}[.)](?:\s+|(?=[\p{L}]|$))(.*)$/u;
const weekdayPattern = /^(?:วัน)?(?:จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์|อาทิตย์)(?=$|\s)/u;
const timePattern = /\b\d{1,2}[.:]\d{2}\b/u;

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function isHeaderLine(line: string): boolean {
  return line.startsWith("ลงชื่อ")
    || line.includes("สนาม")
    || weekdayPattern.test(line)
    || timePattern.test(line)
    || /\b\d{1,2}\/\d{1,2}\b/u.test(line);
}

/** Extract non-empty player names from numbered lists or one-name-per-line text. */
export function extractUsernames(text: string): string[] {
  const lines = text.split(/\r?\n/u);
  const hasNumberedList = lines.some((line) => numberedLinePattern.test(line));
  const names = lines.flatMap((line) => {
    const numberedLine = line.match(numberedLinePattern);
    if (hasNumberedList) return numberedLine ? [numberedLine[1]] : [];

    const name = line.replace(/^\s*[•*-]\s*/u, "");
    return isHeaderLine(name) ? [] : [name];
  }).map(normalizeName).filter(Boolean);

  const seenNames = new Set<string>();
  return names.filter((name) => {
    const normalizedName = name.toLocaleLowerCase();
    if (seenNames.has(normalizedName)) return false;
    seenNames.add(normalizedName);
    return true;
  });
}
