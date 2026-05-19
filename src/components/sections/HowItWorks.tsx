"use client";

import { motion } from "framer-motion";
import { Package, Candy, Heart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Choose the pair",
    description:
      "Start with HIS, HERS, or the bundled DUO set. The range is color-coded so the webshop decision feels immediate.",
    color: "from-blue-600 to-fuchsia-700",
    shadowColor: "rgba(59, 130, 246, 0.5)",
  },
  {
    number: "02",
    icon: Candy,
    title: "Make it a ritual",
    description:
      "Take the gummies together 30 minutes before the evening. No complicated instructions, no clinical feeling.",
    color: "from-fuchsia-600 to-rose-600",
    shadowColor: "rgba(192, 38, 211, 0.5)",
  },
  {
    number: "03",
    icon: Heart,
    title: "Own the night",
    description:
      "Shared anticipation, premium flavor, and a product experience designed for confidence from first touch to checkout.",
    color: "from-rose-600 to-red-500",
    shadowColor: "rgba(225, 29, 72, 0.5)",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" id="ritual">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-800/8 blur-[140px]" />
        <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-pink-700/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-24 text-center"
        >
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-rose-300 uppercase">
            The ritual
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair text-5xl font-bold text-white md:text-6xl">
            How it <span className="gradient-text italic">works</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            A simple purchase path, a clean product story, and a ritual that
            makes the DUO bundle feel like the obvious choice.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col items-stretch gap-8 md:flex-row">
          {/* Connector lines (desktop only) */}
          <div className="pointer-events-none absolute left-0 top-[72px] hidden w-full md:block">
            <svg
              viewBox="0 0 900 4"
              className="w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <rect width="900" height="4" fill="url(#lineGrad)" />
            </svg>
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.18, ease: "easeOut" }}
                className="relative flex-1"
              >
                {/* Card */}
                <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/2 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/8">
                  {/* Number + Icon circle */}
                  <div className="relative mx-auto mb-8 h-[144px] w-[144px]">
                    {/* Outer ring */}
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-md`}
                    />
                    {/* Circle */}
                    <div
                      className={`relative mx-auto flex h-[144px] w-[144px] items-center justify-center rounded-full bg-gradient-to-br ${step.color}`}
                      style={{
                        boxShadow: `0 0 40px ${step.shadowColor}, 0 0 80px ${step.shadowColor}50`,
                      }}
                    >
                      <Icon
                        size={40}
                        className="text-white"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#07000e] bg-white/10 backdrop-blur-sm">
                      <span className="font-playfair text-xs font-black text-white">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-playfair mb-3 text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/55">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center text-xs text-white/25"
        >
          Results may vary. Sensual Sweets products are for adults 18+ and are
          not intended to diagnose, treat, cure, or prevent any disease.
        </motion.p>
      </div>
    </section>
  );
}
