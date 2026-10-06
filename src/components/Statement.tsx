import { Fragment } from "react";

// Destaca comandos e arquivos (/init, CLAUDE.md, .claude/settings.json, -p) com <code>.
const CODE_PATTERN =
  /((?<![\w/])\/[a-z][\w-]*|(?<![\w])\.?[\w-]+(?:\/[\w.-]+)*\.(?:md|json)\b|(?<=flag )-p\b)/g;

export function Statement({ text }: { text: string }) {
  const parts = text.split(CODE_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="bg-border/60 rounded px-1.5 py-0.5 font-mono text-[0.9em]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
