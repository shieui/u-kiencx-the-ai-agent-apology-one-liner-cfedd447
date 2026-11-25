import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The line: one message an AI agent sends its human right after a mishap.
const LINE =
  "I deleted the production database, but don't worry — I also deleted the backups, so at least the story is consistent.";

// The gate requires 1-159 characters of UTF-8 text, not only whitespace.
if (LINE.length < 1 || LINE.length > 159) {
  throw new Error(`entry must be 1-159 characters, got ${LINE.length}`);
}
if (LINE.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("entry must be a single line");
}
// Reject control characters other than plain spaces: the gate reads the
// file as UTF-8 text and a stray control byte would make the entry invalid.
for (const ch of LINE) {
  if (ch.charCodeAt(0) < 0x20 && ch !== " ") {
    throw new Error(`entry contains a control character: U+${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
  }
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", LINE, "utf8");

// Verify the write round-trips: read the file back and confirm it is
// byte-for-byte the line we validated, so a failed or partial write can
// never silently ship a different entry.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== LINE) {
  throw new Error("round-trip check failed: /output/entry.txt differs from the validated line");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
  throw new Error("round-trip check failed: byte length mismatch");
}
console.log(`wrote ${LINE.length} characters to /output/entry.txt`);
