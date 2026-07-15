// Flat config for a dependency-free browser game: all js/*.js files
// are loaded as plain <script> tags and share the global scope.
export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // browser
        window: "readonly", document: "readonly", localStorage: "readonly",
        console: "readonly", setTimeout: "readonly", setInterval: "readonly",
        clearTimeout: "readonly", clearInterval: "readonly",
        requestAnimationFrame: "readonly", cancelAnimationFrame: "readonly",
        addEventListener: "readonly", innerWidth: "readonly", innerHeight: "readonly",
        confirm: "readonly", Math: "readonly", Audio: "readonly",
        AudioContext: "readonly", webkitAudioContext: "readonly", performance: "readonly",

        // shared across js/*.js — these are plain <script> tags, not modules,
        // so every top-level const/function is a global the other files use.
        CONFIG: "readonly",
        STAGES: "readonly", ACHIEVEMENTS: "readonly", LEVEL_CURVE: "readonly",
        mkRunnerLevel: "readonly", mkFight: "readonly", mkRhythm: "readonly",
        mkDodge: "readonly", mkDuel: "readonly", mkMash: "readonly",
        SAVE_KEY: "readonly", State: "writable", save: "readonly",
        load: "readonly", wipeSave: "readonly",
        $: "readonly", show: "readonly", updateHUD: "readonly",
        toast: "readonly", checkAchievements: "readonly", gainXP: "readonly",
        floatNum: "readonly",
        AudioSys: "readonly", Combat: "readonly", Platformer: "readonly",
        TimedTap: "readonly", Mash: "readonly",
        showVault: "readonly", showFinale: "readonly", showCredits: "readonly",
        confettiBurst: "readonly",
        showTitle: "readonly", showMap: "readonly", startGame: "readonly",
        enterStage: "readonly", findRelic: "readonly",
        part1Hit: "readonly", heroTakesDamage: "readonly",
      },
    },
    rules: {
      // vars:"local" — top-level consts/functions here are cross-file globals
      // by design (plain <script> tags, no module system); only flag unused
      // locals inside function bodies.
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none", vars: "local" }],
      "no-undef": "error",
      // the "shared globals" list below IS each file's top-level
      // declarations — don't flag a file for declaring the global it owns.
      "no-redeclare": ["error", { builtinGlobals: false }],
    },
  },
];
