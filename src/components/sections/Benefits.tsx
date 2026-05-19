"use client";

import { motion, type Variants } from "framer-motion";
import { Zap, Leaf, Timer, ShieldCheck } from "lucide-react";
import { NeonCard } from "@/components/NeonCard";

const benefits = [
  {
    icon: Zap,
    title: "HIS/HERS Pairing",
    description:
      "Two formulas with a clear role: HIS for drive and endurance, HERS for sensation and mood, designed to be taken as one ritual.",
    color: "from-blue-500 to-fuchsia-600",
    glow: "rgba(59, 130, 246, 0.4)",
    speed: 3,
  },
  {
    icon: Leaf,
    title: "Botanical Actives",
    description:
      "Ashwagandha, maca, damiana, saffron, tribulus, B6, zinc, and L-arginine in clean vegan gummies.",
    color: "from-fuchsia-500 to-rose-600",
    glow: "rgba(192, 38, 211, 0.4)",
    speed: 3.5,
  },
  {
    icon: Timer,
    title: "30-Minute Ritual",
    description:
      "Take the gummies before the evening starts. The routine is simple, discreet, and easy to repeat.",
    color: "from-rose-600 to-red-500",
    glow: "rgba(225, 29, 72, 0.4)",
    speed: 2.5,
  },
  {
    icon: ShieldCheck,
    title: "Premium Webshop Flow",
    description:
      "Straightforward bundles, subscription savings, secure checkout, and unmarked delivery from order to doorstep.",
    color: "from-blue-500 via-fuchsia-500 to-rose-600",
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
    <section className="relative overflow-hidden py-24 sm:py-32" id="benefits">
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
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-blue-300 uppercase">
            Why it works
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair mx-auto max-w-2xl text-5xl font-bold leading-tight text-white md:text-6xl">
            Crafted for{" "}
            <span className="gradient-text italic">shared</span>{" "}
            momentum
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            The brand system uses HIS blue, HERS red, and the DUO magenta hinge
            to make the product range easy to understand at first glance.
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
