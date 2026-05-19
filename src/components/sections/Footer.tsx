"use client";

import { motion } from "framer-motion";
import { Sparkles, Instagram, Twitter, Heart } from "lucide-react";

const navLinks = [
  { label: "Shop", href: "#products" },
  { label: "Benefits", href: "#benefits" },
  { label: "Ritual", href: "#ritual" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <section className="relative overflow-hidden">
      {/* CTA Section */}
      <div className="relative py-32">
        {/* Glowing orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-700/15 blur-[160px] animate-glow-pulse" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-pink-600/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-red-600/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-5 py-2 text-sm font-medium text-pink-200">
                <Sparkles size={14} className="text-pink-400" />
                Free express shipping on DUO orders
                <Sparkles size={14} className="text-pink-400" />
              </span>
            </div>

            <h2 className="font-playfair mb-6 text-5xl font-black leading-tight text-white md:text-7xl">
              Start the{" "}
              <span className="gradient-text-animate text-glow italic">
                DUO
              </span>{" "}
              Ritual?
            </h2>

            <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/55">
              Shop the paired HIS/HERS bundle, save €9.95, and keep the
              ritual stocked with subscription delivery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="gradient-button glow-lg inline-flex items-center gap-2 rounded-full px-12 py-5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(168,85,247,0.8)]">
                <Sparkles size={18} />
                Shop the bundle
              </button>

              <button className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-12 py-5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-pink-400/40 hover:bg-pink-500/10">
                Subscribe &amp; save 20%
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-[#04000a] py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col items-center gap-8 md:flex-row md:justify-between">
            {/* Logo */}
            <div className="flex flex-col items-center gap-1 md:items-start">
              <div className="font-playfair gradient-text text-2xl font-black italic">
                Sensual Sweets
              </div>
              <p className="text-xs tracking-widest text-white/30 uppercase">
                His · Hers · One Ritual
              </p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-white/40 transition-colors hover:text-white/80"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-300"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Legal */}
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="max-w-3xl text-xs leading-relaxed text-white/25">
              These statements have not been evaluated by the Food and Drug
              Administration. Sensual Sweets products are not intended to
              diagnose, treat, cure, or prevent any disease. For adults 18+ only.
              Results may vary from person to person.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-white/20">
              &copy; {new Date().getFullYear()} Sensual Sweets. All rights
              reserved. Made for{" "}
              <Heart size={10} className="text-pink-500" fill="currentColor" />{" "}
              shared rituals.
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
