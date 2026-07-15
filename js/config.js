/* ═══════════════════════════════════════════════════════════════
   CONFIG — everything you'll want to customize lives here.
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {
  // Name shown in a few dialogue lines. Keep it short.
  heroName: "Hero",

  // Birthday chests revealed inside the Vault, opened one by one.
  vaultRewards: [
    { icon: "🍫", name: "Chocolate of Strength",  desc: "+16 Power. Melts in mortal hands." },
    { icon: "🍪", name: "Cookies of Vitality",    desc: "Baked in the ovens of the Sixteenth Gate." },
    { icon: "🥤", name: "Potion of Refreshment",  desc: "Restores all HP. Serve chilled." },
    { icon: "🍜", name: "Noodles of Endurance",   desc: "A legendary broth. Slurp for +5 Stamina." },
    { icon: "🎭", name: "Mask of Rejuvenation",   desc: "Worn by kings before great feasts." },
  ],

  // ★ CUSTOMIZE THIS ★ — the real-world treasure hint shown at the very
  // end, after "HAPPY 16TH BIRTHDAY". Point it at wherever the actual
  // gift is hidden.
  realTreasureMessage: "Your real treasure now awaits in the place where it has been hidden.",

  // Final sign-off on the credits screen.
  creditsFrom: "Made with ❤️ for your 16th birthday",
};
