"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0.4]);

  return (
    <motion.div
      ref={ref}
      className="
        pointer-events-none relative z-0 w-full
        aspect-[16/10] lg:aspect-auto
        lg:absolute lg:inset-0
        lg:flex lg:items-start lg:justify-center
      "
      style={{ y, scale, opacity, willChange: "transform" }}
    >
      <video
        className="
          h-full w-full
          object-cover object-center
        "
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/purepep-vial-poster.jpg"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <source src="/videos/purepeplong.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}
