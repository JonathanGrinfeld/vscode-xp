export const XP_CHANGE_DIVISOR = 10;
export const DEFAULT_XP_MULTIPLIER = 1;
export const DEFAULT_SHOW_INFO_MESSAGES = true;
export const DEFAULT_SHOW_STATUS_BAR_CONFETTI = true;
export const MIN_XP_MULTIPLIER = 0.1;
export const MAX_XP_MULTIPLIER = 100;
export const STATS_KEY = "vscx.globalStats";
export const LEGACY_STATS_KEY = "xpStats";
export const CONFIG_KEY = "vscx.config";
export const SETTINGS_NAMESPACE = "vscode-xp";
export const SETTING_XP_MULTIPLIER = "xpMultiplier";
export const SETTING_SHOW_INFO_MESSAGES = "showInfoMessages";
export const SETTING_SHOW_STATUS_BAR_CONFETTI = "showStatusBarConfetti";
export const MIN_CHANGES_FOR_XP = 5;
export const MAX_COUNTED_CHANGES_PER_SAVE = 2500;
export const DUPLICATE_CONTENT_WINDOW_MS = 2 * 60 * 1000;
export const DAILY_BONUS_XP = 100;
export const DAILY_BONUS_MIN_LEVEL = 10;
export const IGNORED_FILE_NAMES = new Set([
	"package-lock.json",
	"pnpm-lock.yaml",
	"yarn.lock",
	"bun.lockb",
	"composer.lock",
	"cargo.lock",
]);
export const IGNORED_PATH_SEGMENTS = [
	"/node_modules/",
	"/dist/",
	"/build/",
	"/coverage/",
	"/.next/",
	"/out/",
	"/target/",
];
