"use client";

import { motion, type Variants } from "framer-motion";
import { Zap, Leaf, Timer, ShieldCheck } from "lucide-react";
import { NeonCard } from "@/components/NeonCard";

const benefits = [
  {
    icon: Zap,
    title: "Supercharged Performance",
    description:
      "Natural adaptogens and L-Arginine work together to increase blood flow, energy, and stamina when it matters most.",
    color: "from-purple-500 to-violet-600",
    glow: "rgba(139, 92, 246, 0.4)",
    speed: 3,
  },
  {
    icon: Leaf,
    title: "Pure Natural Ingredients",
    description:
      "Zero synthetic additives, zero compromise. Every ingredient is 100% plant-based, vegan certified, and third-party tested.",
    color: "from-pink-500 to-rose-600",
    glow: "rgba(236, 72, 153, 0.4)",
    speed: 3.5,
  },
  {
    icon: Timer,
    title: "Fast-Acting Formula",
    description:
      "Our proprietary absorption matrix delivers peak effects within 30–45 minutes. No waiting. No wondering.",
    color: "from-red-500 to-rose-500",
    glow: "rgba(239, 68, 68, 0.4)",
    speed: 2.5,
  },
  {
    icon: ShieldCheck,
    title: "Discreet & Premium",
    description:
      "Elegant, unmarked packaging. Privacy from order to delivery. Designed for the couple who values both pleasure and discretion.",
    color: "from-fuchsia-500 to-pink-600",
    glow: "rgba(217, 70, 239, 0.4)",
    speed: 4,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Benefits() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-pink-600/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-purple-400 uppercase">
            Why Choose Us
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair mx-auto max-w-2xl text-5xl font-bold leading-tight text-white md:text-6xl">
            Crafted for{" "}
            <span className="gradient-text italic">Extraordinary</span>{" "}
            Moments
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            Science-backed ingredients. Sensual results. Every formula is
            designed with a single purpose — to elevate your most intimate
            experiences.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                variants={cardVariants}
                className="h-full"
              >
                <NeonCard speed={benefit.speed} className="h-full">
                  <div className="flex h-full flex-col p-7">
                    {/* Icon */}
                    <div
                      className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color}`}
                      style={{
                        boxShadow: `0 0 20px ${benefit.glow}`,
                      }}
                    >
                      <Icon size={26} className="text-white" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-playfair mb-3 text-xl font-bold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/55">
                      {benefit.description}
                    </p>
                  </div>
                </NeonCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
