"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute left-[8%] top-[10%] h-[500px] w-[500px] rounded-full bg-purple-700/25 blur-[120px] animate-glow-pulse" />
        <div className="animate-float-reverse absolute right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-pink-600/20 blur-[100px]" />
        <div className="animate-float absolute bottom-[10%] left-[30%] h-[350px] w-[350px] rounded-full bg-red-600/15 blur-[90px]" />
        <div className="animate-float-reverse absolute right-[20%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-fuchsia-600/15 blur-[80px]" />
      </div>

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#07000e_100%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-5 py-2 text-sm font-medium tracking-wide text-purple-200 backdrop-blur-sm">
            <Sparkles size={14} className="text-purple-400" />
            100% Natural &bull; Vegan Friendly &bull; Premium Quality
            <Sparkles size={14} className="text-pink-400" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="font-playfair mb-4 text-[clamp(4rem,14vw,10rem)] font-black leading-[0.9] tracking-tight"
        >
          <span className="block text-white">SENSUAL</span>
          <span className="gradient-text-animate text-glow block italic">
            SWEETS
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="mb-3 text-[clamp(1rem,2.5vw,1.35rem)] font-light tracking-[0.25em] text-white/50 uppercase"
        >
          Feel the Rush. Own the Night.
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-lg text-lg leading-relaxed text-white/60"
        >
          Premium gummies scientifically crafted for enhanced passion, stamina,
          and performance. All natural. All pleasure.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button className="gradient-button glow-md relative overflow-hidden rounded-full px-10 py-4 text-base font-semibold tracking-wide text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(168,85,247,0.7)]">
            <span>Shop Now</span>
          </button>

          <button className="group relative overflow-hidden rounded-full border border-white/20 bg-white/5 px-10 py-4 text-base font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 hover:bg-purple-500/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            Learn More
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-10"
        >
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "4.9★", label: "Average Rating" },
            { value: "100%", label: "Natural Ingredients" },
            { value: "30min", label: "Fast Acting" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-playfair gradient-text text-3xl font-black">
                {stat.value}
              </div>
              <div className="mt-1 text-xs tracking-widest text-white/40 uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="animate-bounce-gentle absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-1 text-white/30">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={18} />
        </div>
      </div>
    </section>
  );
}
