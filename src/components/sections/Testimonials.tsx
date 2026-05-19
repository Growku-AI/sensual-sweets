"use client";

import { motion, type Variants } from "framer-motion";
import { Quote } from "lucide-react";
import { NeonCard } from "@/components/NeonCard";

const testimonials = [
  {
    name: "Noah & Eva",
    handle: "Verified Buyer",
    product: "DUO Bundle",
    rating: 5,
    quote:
      "The packaging felt premium and the ritual made date night feel intentional again. We ordered the subscription after the first box.",
    avatar: "NE",
    avatarGradient: "from-blue-500 to-fuchsia-600",
    speed: 3.5,
  },
  {
    name: "Mila",
    handle: "Verified Buyer",
    product: "HERS Formula",
    rating: 5,
    quote:
      "I bought HERS first and came back for the bundle. The flavor, checkout, and delivery all felt considered.",
    avatar: "MI",
    avatarGradient: "from-fuchsia-500 to-rose-600",
    speed: 2.8,
  },
  {
    name: "Thomas",
    handle: "Verified Buyers",
    product: "HIS Formula",
    rating: 5,
    quote:
      "The HIS/HERS split made the product easy to understand. It looks like a real wellness brand, not a novelty item.",
    avatar: "TH",
    avatarGradient: "from-blue-600 to-blue-400",
    speed: 4,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="star text-base text-amber-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-32" id="reviews">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[#06000c]">
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-pink-700/8 blur-[130px]" />
        <div className="absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full bg-purple-700/8 blur-[100px]" />
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
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-fuchsia-300 uppercase">
            Social proof
          </p>
          <div className="section-divider" />
          <h2 className="font-playfair text-5xl font-bold text-white md:text-6xl">
            Why customers{" "}
            <span className="gradient-text italic">come back</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/50">
            Premium webshop positioning needs believable proof, clear product
            names, and a repeat-order path that feels natural.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={cardVariants} className="h-full">
              <NeonCard speed={t.speed} className="h-full">
                <div className="flex h-full flex-col p-7">
                  {/* Top row */}
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarGradient} text-sm font-bold text-white`}
                        style={{
                          boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)",
                        }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-white/40">{t.handle}</p>
                      </div>
                    </div>
                    <Quote
                      size={22}
                      className="flex-shrink-0 text-purple-500/50"
                      fill="currentColor"
                    />
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-3">
                    <StarRating count={t.rating} />
                    <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                      {t.product}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-sm leading-relaxed text-white/65 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Aggregate score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-10 rounded-2xl border border-white/8 bg-white/3 py-8 px-10 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="font-playfair gradient-text text-5xl font-black">
              4.9
            </div>
            <div className="mt-1 flex justify-center">
              <StarRating count={5} />
            </div>
            <p className="mt-1 text-xs text-white/40">Average Rating</p>
          </div>
          <div className="h-16 w-px bg-white/10" />
          <div className="text-center">
            <div className="font-playfair gradient-text text-5xl font-black">
              1,200+
            </div>
            <p className="mt-2 text-xs text-white/40">Verified Reviews</p>
          </div>
          <div className="h-16 w-px bg-white/10" />
          <div className="text-center">
            <div className="font-playfair gradient-text text-5xl font-black">
              96%
            </div>
            <p className="mt-2 text-xs text-white/40">Would Recommend</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
