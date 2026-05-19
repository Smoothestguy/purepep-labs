"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0.4]);

  // Mobile Safari blocks autoplay in several states (Low Power Mode, slow
  // network, first paint before metadata). Force play on mount, on tab
  // visibility, and on the first user gesture so the hero stays alive even
  // when the initial `autoplay` attribute is ignored.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const tryPlay = () => {
      v.play().catch(() => {});
    };

    tryPlay();
    v.addEventListener("loadedmetadata", tryPlay);
    v.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);
    window.addEventListener("touchstart", tryPlay, { once: true });
    window.addEventListener("click", tryPlay, { once: true });
    window.addEventListener("scroll", tryPlay, { once: true });

    return () => {
      v.removeEventListener("loadedmetadata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("click", tryPlay);
      window.removeEventListener("scroll", tryPlay);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className="
        pointer-events-none relative z-0 w-full
        aspect-[16/10] lg:aspect-auto
        lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto
        lg:w-full lg:max-w-[1700px]
        lg:flex lg:items-start lg:justify-center
      "
      style={{ y, scale, opacity, willChange: "transform" }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover object-[70%_center] lg:object-[60%_center]"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 99%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 94%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 99%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 94%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <source src="/videos/purepepvid.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}
