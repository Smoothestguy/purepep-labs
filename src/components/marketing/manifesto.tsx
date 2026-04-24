export function Manifesto() {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-background">
      <div
        className="mx-auto w-full max-w-[var(--content-max)] pad-x"
        style={{
          paddingTop: "clamp(4rem, 8vw + 1rem, 10rem)",
          paddingBottom: "clamp(4rem, 8vw + 1rem, 10rem)",
        }}
      >
        <div className="section-eyebrow">
          <span className="whitespace-nowrap text-brand">§ 05</span>
          <span className="h-px shrink-0 bg-hairline" style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }} />
          <span>Position</span>
        </div>

        <p
          className="max-w-[20ch] display-xl text-foreground"
          style={{ marginTop: "clamp(1.75rem, 3vw, 3rem)" }}
        >
          We don&apos;t sell
          <span className="italic font-light text-muted-foreground"> wellness.</span>
          <br />
          We sell
          <span className="italic"> a</span>
          <span className="italic text-gradient-brand"> receipt</span>
          <span className="italic">.</span>
        </p>

        <div
          className="grid grid-cols-1 border-t border-hairline md:grid-cols-3"
          style={{
            marginTop: "clamp(3rem, 6vw, 5rem)",
            paddingTop: "clamp(2rem, 3.5vw, 3rem)",
            gap: "clamp(1.75rem, 3vw, 2.5rem)",
          }}
        >
          {[
            { k: "No blends", body: "One compound per vial. Anything else is theatre." },
            { k: "No excuses", body: "Open CoAs. Open synthesis route. Open lot numbers." },
            { k: "No humans", body: "For research use only. We will not pretend otherwise." },
          ].map((c) => (
            <div key={c.k} className="flex flex-col gap-3">
              <div
                className="font-mono tracking-[0.25em] uppercase text-brand"
                style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
              >
                {c.k}
              </div>
              <p
                className="font-display italic leading-snug text-foreground"
                style={{ fontSize: "clamp(1.15rem, 1.5vw, 1.5rem)" }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
