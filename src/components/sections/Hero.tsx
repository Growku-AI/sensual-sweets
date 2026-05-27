"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Leaf,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CartIndicator } from "@/components/CartIndicator";

const proofItems = [
  { icon: Star, label: "4.9 from 1,200+ reviews" },
  { icon: Leaf, label: "Vegan botanicals" },
  { icon: ShieldCheck, label: "Discreet delivery" },
] as const;

/**
 * HeroPackshot
 * Cinematic packaging photography replaces the previous 3D mock-card stage.
 * Layered with HIS / HERS ambient glow halos and a soft duo gradient floor.
 */
function HeroPackshot() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
      className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:min-h-[640px]"
      aria-label="Sensual Sweets packshot — 4 erotic gummies, For Him & Her"
    >
      {/* HIS halo */}
      <div className="pointer-events-none absolute -left-10 top-10 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.50)_0%,transparent_68%)] blur-3xl [animation:orb-breath_6.5s_ease-in-out_infinite_alternate]" />
      {/* HERS halo */}
      <div className="pointer-events-none absolute -right-10 bottom-2 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.48)_0%,transparent_68%)] blur-3xl [animation:orb-breath_7.5s_ease-in-out_infinite_alternate-reverse]" />
      {/* DUO floor */}
      <div className="pointer-events-none absolute inset-x-12 bottom-0 h-24 rounded-full bg-[radial-gradient(ellipse,rgba(192,38,211,0.35),transparent_70%)] blur-2xl" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 aspect-[2/3] w-[300px] sm:w-[360px] lg:w-[440px]"
      >
        <Image
          src="/packshots/hero.jpg"
          alt="Sensual Sweets — 4 erotic gummies pouch, For Him & Her"
          fill
          priority
          sizes="(min-width: 1024px) 440px, (min-width: 640px) 360px, 300px"
          className="rounded-[2rem] object-cover shadow-[0_50px_140px_-30px_rgba(192,38,211,0.55),0_0_80px_rgba(59,130,246,0.18)]"
        />
        {/* age gate badge overlay */}
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-white backdrop-blur-md">
          18+
        </span>
      </motion.div>

      {/* Floating HIS / HERS micro-chips */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
        className="absolute left-0 top-10 hidden flex-col gap-2 rounded-2xl border border-blue-400/30 bg-[#0e0018]/85 p-3 backdrop-blur-md sm:flex"
      >
        <span className="text-[10px] font-bold tracking-[0.18em] text-blue-200 uppercase">
          HIS · Drive
        </span>
        <span className="text-[11px] text-white/55">Ashwagandha · Maca</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
        className="absolute bottom-12 right-0 hidden flex-col gap-2 rounded-2xl border border-rose-400/30 bg-[#0e0018]/85 p-3 backdrop-blur-md sm:flex"
      >
        <span className="text-[10px] font-bold tracking-[0.18em] text-rose-200 uppercase">
          HERS · Glow
        </span>
        <span className="text-[11px] text-white/55">Damiana · Saffron</span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden bg-[#07000e] px-4 pb-12 pt-5 sm:px-6 lg:min-h-[96svh] lg:px-8">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.40)_0%,transparent_70%)] blur-2xl [animation:orb-breath_7s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.40)_0%,transparent_70%)] blur-2xl [animation:orb-breath_8.5s_ease-in-out_infinite_alternate-reverse]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,#07000e_100%)]" />

      {/* Nav */}
      <nav
        className="relative z-20 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/[0.06] bg-[#0e0018]/80 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
        aria-label="Primary navigation"
      >
        <a
          href="#top"
          className="font-playfair gradient-text text-xl font-black italic leading-none"
        >
          Sensual Sweets
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {["Shop", "HIS", "HERS", "Ritual", "Reviews"].map((item) => (
            <a
              key={item}
              href={
                item === "Reviews"
                  ? "#reviews"
                  : item === "Ritual"
                    ? "#ritual"
                    : "#products"
              }
              className="text-xs font-semibold tracking-[0.12em] text-white/55 uppercase transition-colors hover:text-white"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <CartIndicator />
          <a
            href="#products"
            className="gradient-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-white uppercase shadow-[0_0_24px_rgba(192,38,211,0.35)]"
          >
            <ShoppingBag size={15} />
            <span>Shop now</span>
          </a>
        </div>
      </nav>

      <div
        id="top"
        className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-10 lg:py-14 xl:gap-16"
      >
        <div className="max-w-3xl text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/35 bg-fuchsia-500/10 px-4 py-2 text-[11px] font-bold tracking-[0.12em] text-fuchsia-200 uppercase"
          >
            <Sparkles size={14} />
            It’s time to get freaky · 18+
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
            className="font-playfair mt-6 text-[clamp(3rem,11vw,8.2rem)] font-black italic leading-[0.92] tracking-tight text-white sm:mt-7 lg:text-[6.6rem] xl:text-[7.4rem]"
          >
            His · Hers ·{" "}
            <span className="gradient-text-animate text-glow block">
              One Ritual
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: "easeOut" }}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/65 sm:mt-7 sm:text-lg sm:leading-8 lg:mx-0"
          >
            Four erotic gummies in one pouch, two formulas designed to be taken
            together. Crafted to ignite desire, deepen sensation, and turn the
            evening into a shared ritual.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 lg:justify-start"
          >
            <AddToCartButton
              productId="duo"
              iconSize={18}
              className="gradient-button glow-md inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-[0.08em] text-white uppercase transition-transform hover:scale-[1.02]"
            >
              Shop the DUO bundle
            </AddToCartButton>
            <a
              href="#ritual"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-sm font-bold tracking-[0.08em] text-white/80 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/[0.09] hover:text-white"
            >
              <PlayCircle size={18} />
              <span>The ritual</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.58 }}
            className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-4 border-t border-white/10 pt-6 sm:mt-12 sm:pt-7 lg:justify-start"
          >
            {proofItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-xs font-medium text-white/50"
                >
                  <Icon size={16} className="text-fuchsia-300" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        <HeroPackshot />
      </div>
    </section>
  );
}
