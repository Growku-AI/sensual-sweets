"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { HeartPulse, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NeonCard } from "@/components/NeonCard";

const formulas = [
  {
    key: "his",
    label: "HIS Formula",
    title: "Drive & Endurance",
    description:
      "Clinically studied botanicals formulated to support stamina, sexual drive, and a steady physical response.",
    serving: "2,400mg Ashwagandha per serving",
    price: "€49.95",
    cta: "Shop HIS",
    Icon: Zap,
    accent: "blue",
    image: "/packshots/angle-a.jpg",
    ingredients: [
      "Ashwagandha KSM-66 2,400mg",
      "Maca Root Extract 800mg",
      "L-Arginine 500mg",
      "Zinc Bisglycinate 15mg",
    ],
  },
  {
    key: "hers",
    label: "HERS Formula",
    title: "Sensation & Mood",
    description:
      "Plant-powered support for mood, sensation, and ease, built for the whole body and the shared moment.",
    serving: "Clinically studied Saffron 30mg extract",
    price: "€49.95",
    cta: "Shop HERS",
    Icon: HeartPulse,
    accent: "rose",
    image: "/packshots/angle-c.jpg",
    ingredients: [
      "Damiana Leaf Extract 400mg",
      "Saffron Extract 30mg",
      "Tribulus Terrestris 600mg",
      "Vitamin B6 10mg",
    ],
  },
] as const;

const bundlePerks = [
  "Save €9.95 on the paired set",
  "Free express shipping",
  "Discreet premium packaging",
] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 44 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export default function Products() {
  return (
    <section className="relative overflow-hidden bg-[#06000c] py-24 sm:py-32" id="products">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-20 h-[460px] w-[460px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute bottom-20 right-[10%] h-[460px] w-[460px] rounded-full bg-rose-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-fuchsia-300 uppercase">
            Webshop
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair text-5xl font-black italic leading-tight text-white md:text-7xl">
            Pick your side.{" "}
            <span className="gradient-text block">Complete the ritual.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55">
            The Sensual Sweets collection is built around a simple color story:
            HIS in electric blue, HERS in rose red, and the DUO bundle where
            both formulas meet.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.02] md:grid-cols-2"
        >
          {formulas.map((formula) => {
            const Icon = formula.Icon;
            const isHis = formula.key === "his";
            return (
              <motion.article
                key={formula.key}
                variants={cardVariants}
                className={[
                  "relative grid min-h-full gap-6 p-7 sm:p-10 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_300px]",
                  isHis
                    ? "bg-[linear-gradient(135deg,#04001a_0%,#0b1a40_100%)]"
                    : "bg-[linear-gradient(135deg,#1a0008_0%,#3a0010_100%)]",
                ].join(" ")}
              >
                <div
                  className={[
                    "pointer-events-none absolute right-8 top-8 h-28 w-28 rounded-full blur-2xl",
                    isHis ? "bg-blue-500/25" : "bg-rose-500/25",
                  ].join(" ")}
                />
                <div className="relative">
                  <p
                    className={[
                      "mb-3 text-xs font-bold tracking-[0.16em] uppercase",
                      isHis ? "text-blue-300" : "text-rose-300",
                    ].join(" ")}
                  >
                    {formula.label}
                  </p>
                  <h3 className="font-playfair text-4xl font-black italic leading-none text-white sm:text-5xl">
                    {formula.title}
                  </h3>

                  <div className="mt-8 flex items-center gap-5">
                    <div
                      className={[
                        "grid h-20 w-20 shrink-0 place-items-center rounded-full shadow-[0_0_44px_currentColor]",
                        isHis
                          ? "bg-[linear-gradient(135deg,#1e3a8a,#3b82f6)] text-blue-400/55"
                          : "bg-[linear-gradient(135deg,#7f1d1d,#e11d48)] text-rose-400/55",
                      ].join(" ")}
                    >
                      <Icon size={32} className="text-white" strokeWidth={1.5} />
                    </div>
                    <p className="max-w-[14rem] text-sm leading-6 text-white/55">
                      {formula.serving}
                    </p>
                  </div>

                  <p className="mt-8 text-sm leading-7 text-white/62">
                    {formula.description}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {formula.ingredients.map((ingredient, index) => (
                      <div
                        key={ingredient}
                        className="flex items-center gap-3 text-sm text-white/75"
                      >
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full",
                            isHis
                              ? index % 2 === 0
                                ? "bg-blue-400"
                                : "bg-blue-200"
                              : index % 2 === 0
                                ? "bg-rose-400"
                                : "bg-rose-200",
                          ].join(" ")}
                        />
                        {ingredient}
                      </div>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <a
                      href="#products"
                      className={[
                        "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-bold tracking-[0.1em] text-white uppercase transition-transform hover:scale-[1.02]",
                        isHis
                          ? "bg-blue-500 shadow-[0_0_22px_rgba(59,130,246,0.42)]"
                          : "bg-rose-600 shadow-[0_0_22px_rgba(225,29,72,0.42)]",
                      ].join(" ")}
                    >
                      <ShoppingBag size={16} />
                      {formula.cta}
                    </a>
                    <span className="font-playfair gradient-text text-3xl font-black">
                      {formula.price}
                    </span>
                  </div>
                </div>

                {/* Product photography */}
                <div className="relative mx-auto w-full max-w-[260px] md:max-w-none">
                  <div
                    className={[
                      "pointer-events-none absolute inset-0 -z-10 rounded-[2rem] blur-2xl",
                      isHis
                        ? "bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.45),transparent_70%)]"
                        : "bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.45),transparent_70%)]",
                    ].join(" ")}
                  />
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
                    <Image
                      src={formula.image}
                      alt={`Sensual Sweets ${formula.label} packshot`}
                      fill
                      sizes="(min-width: 1280px) 300px, (min-width: 1024px) 260px, (min-width: 768px) 220px, 260px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="rounded-b-[2rem] border-x border-b border-fuchsia-400/20 bg-[linear-gradient(135deg,#04001a_0%,#0d0020_50%,#1a0008_100%)] px-6 py-10 text-center sm:px-10"
        >
          <Badge className="mb-4 border-fuchsia-400/35 bg-fuchsia-500/12 text-fuchsia-200">
            <Sparkles size={13} className="mr-1.5" />
            His + Hers · DUO Bundle
          </Badge>
          <h3 className="font-playfair text-4xl font-black italic text-white">
            Better together. <span className="gradient-text">Always.</span>
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/55">
            Build the full ritual with both formulas, premium gift-ready
            packaging, and express delivery included.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-white/45">
            {bundlePerks.map((perk) => (
              <span
                key={perk}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2"
              >
                {perk}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#products"
              className="gradient-button glow-md inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold tracking-[0.08em] text-white uppercase transition-transform hover:scale-[1.02]"
            >
              <ShoppingBag size={18} />
              Shop the DUO Bundle — €89.95
            </a>
            <a
              href="#benefits"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-8 py-4 text-sm font-bold tracking-[0.08em] text-white/75 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:text-white"
            >
              Compare formulas
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {[
            ["Starter Set", "Trial pack for the first shared ritual", "€24.95"],
            ["DUO Bundle", "The full paired experience", "€89.95"],
            ["Subscribe", "Monthly delivery with 20% savings", "€71.95"],
          ].map(([name, description, price]) => (
            <NeonCard key={name} speed={3.6}>
              <div className="p-6">
                <p className="text-xs font-bold tracking-[0.16em] text-fuchsia-200 uppercase">
                  {name}
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-white/55">
                  {description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="font-playfair text-3xl font-black italic text-white">
                    {price}
                  </span>
                  <a
                    href="#products"
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold tracking-[0.1em] text-white/70 uppercase transition-colors hover:text-white"
                  >
                    Add
                  </a>
                </div>
              </div>
            </NeonCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
