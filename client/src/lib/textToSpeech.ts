/**
 * Strips Markdown syntax to plain speakable text.
 * Avoids reading out "#", "**", backticks, table pipes, etc. literally.
 */
export function stripMarkdownForSpeech(md: string): string {
  let t = md;
  t = t.replace(/```[\s\S]*?```/g, ". Code block omitted. ");
  t = t.replace(/`([^`]+)`/g, "$1");
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, "");
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  t = t.replace(/^#{1,6}\s+/gm, "");
  t = t.replace(/(\*\*\*|\*\*|\*|___|__|_)/g, "");
  t = t.replace(/^>\s?/gm, "");
  t = t.replace(/^(\s*)[-*+]\s+/gm, "$1");
  t = t.replace(/^(\s*)\d+\.\s+/gm, "$1");
  t = t.replace(/^-{3,}\s*$/gm, "");
  t = t.replace(/^\|(.+)\|$/gm, (_, inner) => {
    if (/^[-| :]+$/.test(inner.trim())) return ""; // separator row
    const cells = inner.split("|").map((c: string) => c.trim()).filter(Boolean);
    return cells.join(", ") + ".";
  });
  t = t.replace(/\n{2,}/g, ". ").replace(/\n/g, " ").replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".");
  return t.trim();
}

/**
 * Splits text into ≤maxLen-char chunks so Chrome's TTS 15-second cutoff
 * bug doesn't silently kill long utterances. Each chunk is a full sentence.
 */
export function chunkTextForSpeech(text: string, maxLen = 200): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (current && current.length + s.length > maxLen) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}
