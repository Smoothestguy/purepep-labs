const steps = [
  {
    n: "I",
    title: "Synthesis",
    body: "Solid-phase Fmoc synthesis on Rink Amide resin. Coupled in DMF with HBTU activation.",
    metric: "≤ 24 hr",
    metricLabel: "per compound",
  },
  {
    n: "II",
    title: "Cleavage & precipitation",
    body: "TFA / TIPS / water cocktail; crude peptide precipitated in cold diethyl ether.",
    metric: "−20 °C",
    metricLabel: "etherolysis",
  },
  {
    n: "III",
    title: "Purification",
    body: "Reverse-phase HPLC on C18 column; acetonitrile / water / 0.1% TFA gradient.",
    metric: "≥ 99.0%",
    metricLabel: "purity floor",
  },
  {
    n: "IV",
    title: "Assay",
    body: "Mass-spec confirmation (ESI-TOF), endotoxin LAL assay, residual solvent GC.",
    metric: "3×",
    metricLabel: "independent labs",
  },
  {
    n: "V",
    title: "Fill & finish",
    body: "Filtered through 0.22 µm into amber borosilicate, argon-flushed, capped and crimped.",
    metric: "ISO 7",
    metricLabel: "cleanroom",
  },
  {
    n: "VI",
    title: "Lyophilisation",
    body: "Freeze-drying at −50 °C under 0.01 mbar for 36 hrs; residual moisture < 1%.",
    metric: "−50 °C",
    metricLabel: "primary dry",
  },
];

export function Science() {
  return (
    <section id="science" className="relative border-b border-hairline bg-background">
      <div
        className="mx-auto grid w-full max-w-[var(--content-max)] grid-cols-1 pad-x section-y lg:grid-cols-12"
        style={{
          columnGap: "clamp(1.5rem, 3vw, 3rem)",
          rowGap: "clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-[clamp(5rem,8vw,7rem)]">
            <div className="section-eyebrow">
              <span className="whitespace-nowrap text-brand">§ 03</span>
              <span className="h-px shrink-0 bg-hairline" style={{ width: "clamp(1.5rem, 3vw, 2.75rem)" }} />
              <span>Method</span>
            </div>
            <h2
              className="font-display leading-[0.95] tracking-[-0.02em]"
              style={{
                marginTop: "clamp(1rem, 1.5vw, 1.5rem)",
                fontSize: "clamp(2.25rem, 5.4vw, 5.25rem)",
              }}
            >
              Six steps
              <span className="block italic font-light text-muted-foreground">
                between the residue
              </span>
              <span className="block">
                and the <span className="italic text-gradient-brand">vial.</span>
              </span>
            </h2>
            <p
              className="max-w-md font-sans leading-relaxed text-muted-foreground"
              style={{
                marginTop: "clamp(1.25rem, 2vw, 2rem)",
                fontSize: "clamp(0.95rem, 0.4vw + 0.85rem, 1.05rem)",
              }}
            >
              We publish our synthesis protocol because reproducibility is the
              only credential that matters. Every batch is retained and
              reassayed for five years.
            </p>

            <dl
              className="grid grid-cols-2 border-t border-hairline"
              style={{
                marginTop: "clamp(1.75rem, 3vw, 2.5rem)",
                paddingTop: "clamp(1.25rem, 2vw, 1.75rem)",
                gap: "clamp(1rem, 2vw, 1.5rem)",
              }}
            >
              {[
                { k: "Retention", v: "5 yr" },
                { k: "Retest cycle", v: "90 d" },
                { k: "Cleanroom", v: "ISO 7" },
                { k: "Endotoxin", v: "<0.1" },
              ].map((s) => (
                <div key={s.k}>
                  <dt
                    className="font-mono tracking-[0.25em] uppercase text-muted-foreground"
                    style={{ fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)" }}
                  >
                    {s.k}
                  </dt>
                  <dd
                    className="mt-1.5 font-display leading-none"
                    style={{ fontSize: "clamp(1.5rem, 2.2vw, 2rem)" }}
                  >
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <ol className="relative lg:col-span-7 xl:col-span-8">
          <div
            aria-hidden
            className="absolute top-2 bottom-2 w-px bg-hairline"
            style={{ left: "clamp(1.25rem, 2vw, 2.1rem)" }}
          />
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative flex border-b border-hairline last:border-b-0"
              style={{
                gap: "clamp(1rem, 2vw, 2rem)",
                paddingBlock: "clamp(1.5rem, 3vw, 2rem)",
              }}
            >
              <div
                className="relative z-10 flex shrink-0 items-center justify-center border border-hairline bg-background font-display italic text-foreground"
                style={{
                  width: "clamp(2.5rem, 4.5vw, 4.25rem)",
                  height: "clamp(2.5rem, 4.5vw, 4.25rem)",
                  fontSize: "clamp(1.1rem, 1.6vw, 1.7rem)",
                }}
              >
                {s.n}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="flex flex-wrap items-baseline justify-between"
                  style={{ columnGap: "clamp(0.75rem, 2vw, 1.5rem)", rowGap: "0.25rem" }}
                >
                  <h3
                    className="font-display leading-tight tracking-tight"
                    style={{ fontSize: "clamp(1.5rem, 2.8vw, 2.5rem)" }}
                  >
                    {s.title}
                  </h3>
                  <div className="text-right">
                    <div
                      className="font-display leading-none text-brand"
                      style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.75rem)" }}
                    >
                      {s.metric}
                    </div>
                    <div
                      className="mt-1 font-mono tracking-[0.22em] uppercase text-muted-foreground"
                      style={{ fontSize: "clamp(9px, 0.25vw + 8px, 10.5px)" }}
                    >
                      {s.metricLabel}
                    </div>
                  </div>
                </div>
                <p
                  className="max-w-2xl font-sans leading-relaxed text-muted-foreground"
                  style={{
                    marginTop: "clamp(0.65rem, 1vw, 0.9rem)",
                    fontSize: "clamp(0.85rem, 0.35vw + 0.77rem, 1rem)",
                  }}
                >
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
