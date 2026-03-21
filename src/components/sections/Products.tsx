"use client";

import { motion, type Variants } from "framer-motion";
import { ShoppingCart, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NeonCard } from "@/components/NeonCard";

const products = [
  {
    emoji: "🍇",
    name: "Purple Passion",
    subtitle: "Grape & L-Arginine",
    tag: "For Stamina",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    description:
      "Deep, sustained energy. L-Arginine supports nitric oxide production for enhanced blood flow and endurance.",
    price: "$29.99",
    per: "per 30-count",
    bestSeller: false,
    speed: 3,
    gradient: "from-purple-900/40 to-violet-900/20",
    accentColor: "#9333ea",
  },
  {
    emoji: "🍒",
    name: "Cherry Rush",
    subtitle: "Wild Cherry & Maca Root",
    tag: "For Desire",
    tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    description:
      "Ignite passion on demand. Peruvian Maca Root has been used for centuries to naturally enhance libido and desire.",
    price: "$29.99",
    per: "per 30-count",
    bestSeller: false,
    speed: 3.5,
    gradient: "from-pink-900/40 to-rose-900/20",
    accentColor: "#ec4899",
  },
  {
    emoji: "🌹",
    name: "Midnight Rose",
    subtitle: "Strawberry & Ashwagandha",
    tag: "For Endurance",
    tagColor: "bg-red-500/20 text-red-300 border-red-500/30",
    description:
      "Go longer, feel stronger. Ashwagandha reduces cortisol and fatigue while amplifying endurance and recovery.",
    price: "$34.99",
    per: "per 30-count",
    bestSeller: false,
    speed: 2.5,
    gradient: "from-red-900/40 to-rose-900/20",
    accentColor: "#f43f5e",
  },
  {
    emoji: "⚡",
    name: "Electric Bliss",
    subtitle: "Mixed Berry & Ginseng",
    tag: "Best Seller",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description:
      "Our signature formula. Panax Ginseng + all four adaptogens combined for the ultimate enhancement experience.",
    price: "$39.99",
    per: "per 30-count",
    bestSeller: true,
    speed: 2,
    gradient: "from-fuchsia-900/40 to-purple-900/20",
    accentColor: "#d946ef",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Products() {
  return (
    <section className="relative overflow-hidden py-32" id="products">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[#06000c]">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/6 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-pink-400 uppercase">
            Our Collection
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair text-5xl font-bold text-white md:text-6xl">
            Find Your <span className="gradient-text italic">Perfect</span>{" "}
            Formula
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            Four distinct blends. One extraordinary mission — to make every
            intimate moment unforgettable.
          </p>
        </motion.div>

        {/* Product grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div
              key={product.name}
              variants={cardVariants}
              className="h-full"
            >
              <NeonCard speed={product.speed} className="h-full">
                <div className="flex h-full flex-col p-6">
                  {/* Best seller badge */}
                  {product.bestSeller && (
                    <div className="mb-4 flex items-center gap-1.5">
                      <Flame
                        size={14}
                        className="text-amber-400"
                        fill="currentColor"
                      />
                      <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Emoji product visual */}
                  <div
                    className={`mb-5 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br ${product.gradient}`}
                    style={{
                      border: `1px solid ${product.accentColor}20`,
                      boxShadow: `0 0 30px ${product.accentColor}15`,
                    }}
                  >
                    <span className="text-6xl" role="img" aria-label={product.name}>
                      {product.emoji}
                    </span>
                  </div>

                  {/* Tag */}
                  <Badge
                    className={`mb-3 w-fit border text-xs font-medium ${product.tagColor}`}
                  >
                    {product.tag}
                  </Badge>

                  {/* Name & subtitle */}
                  <h3 className="font-playfair text-xl font-bold text-white">
                    {product.name}
                  </h3>
                  <p className="mb-3 text-xs text-white/40">{product.subtitle}</p>

                  {/* Description */}
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-white/55">
                    {product.description}
                  </p>

                  {/* Price + CTA */}
                  <div className="mt-auto border-t border-white/10 pt-5">
                    <div className="mb-4 flex items-end gap-1">
                      <span className="font-playfair gradient-text text-3xl font-black">
                        {product.price}
                      </span>
                      <span className="mb-1 text-xs text-white/35">
                        {product.per}
                      </span>
                    </div>

                    <button className="gradient-button group flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03]">
                      <ShoppingCart size={15} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Bundle offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-pink-900/15 to-red-900/20 p-8 text-center backdrop-blur-sm"
        >
          <p className="text-xs font-semibold tracking-[0.3em] text-purple-400 uppercase mb-2">
            Save 25%
          </p>
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">
            The Ultimate Bundle
          </h3>
          <p className="text-white/50 text-sm mb-5">
            Get all four formulas and discover your perfect match.
          </p>
          <button className="gradient-button inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white glow-md hover:scale-105 transition-all duration-300">
            Shop the Bundle — $89.99
          </button>
        </motion.div>
      </div>
    </section>
  );
}
