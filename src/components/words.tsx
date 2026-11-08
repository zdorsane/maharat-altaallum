/** Splits text into words that rise in sequence (see `.word` in globals.css). `start` offsets the stagger index. */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word" style={{ "--i": start + i } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </>
  );
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
