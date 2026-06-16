import * as vscode from "vscode";
import {
    CONFIG_KEY,
    DEFAULT_SHOW_INFO_MESSAGES,
    DEFAULT_SHOW_STATUS_BAR_CONFETTI,
    DEFAULT_XP_MULTIPLIER,
    LEGACY_STATS_KEY,
    MAX_XP_MULTIPLIER,
    MIN_XP_MULTIPLIER,
    SETTINGS_NAMESPACE,
    SETTING_SHOW_INFO_MESSAGES,
    SETTING_SHOW_STATUS_BAR_CONFETTI,
    SETTING_XP_MULTIPLIER,
    STATS_KEY,
} from "./constants";
import { getLevelForTotalXp, getTotalXpForLevel } from "./xp";
import { LegacyPlayerStats, PlayerStats, XpConfig } from "./types";

export function getStats(context: vscode.ExtensionContext): PlayerStats {
    const current = context.globalState.get<PlayerStats>(STATS_KEY);
    if (current) {
        if (typeof current.totalXp === "number" && typeof current.level === "number") {
            return {
                totalXp: Math.max(0, Math.floor(current.totalXp)),
                level: Math.max(1, Math.floor(current.level)),
            };
        }

        const migrated = migrateLegacyStats(current as unknown as LegacyPlayerStats);
        void context.globalState.update(STATS_KEY, migrated);
        return migrated;
    }

    const legacy = context.globalState.get<LegacyPlayerStats>(LEGACY_STATS_KEY);
    if (legacy) {
        const migrated = migrateLegacyStats(legacy);
        void context.globalState.update(STATS_KEY, migrated);
        return migrated;
    }

    return { totalXp: 0, level: 1 };
}

export function setStats(context: vscode.ExtensionContext, stats: PlayerStats) {
    return context.globalState.update(STATS_KEY, stats);
}

export function getConfig(context: vscode.ExtensionContext): XpConfig {
    const stored = context.globalState.get<Partial<XpConfig>>(
        CONFIG_KEY,
        {},
    );
    const settings = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);

    const xpMultiplier = readNumberSetting(
        settings,
        SETTING_XP_MULTIPLIER,
        stored.xpMultiplier,
    );
    const showInfoMessages = readBooleanSetting(
        settings,
        SETTING_SHOW_INFO_MESSAGES,
        stored.showInfoMessages,
    );
    const showStatusBarConfetti = readBooleanSetting(
        settings,
        SETTING_SHOW_STATUS_BAR_CONFETTI,
        stored.showStatusBarConfetti,
    );

    return {
        xpMultiplier: normalizePositiveNumber(xpMultiplier, DEFAULT_XP_MULTIPLIER),
        showInfoMessages: normalizeBoolean(showInfoMessages, DEFAULT_SHOW_INFO_MESSAGES),
        showStatusBarConfetti: normalizeBoolean(
            showStatusBarConfetti,
            DEFAULT_SHOW_STATUS_BAR_CONFETTI,
        ),
    };
}

export async function setConfig(
    context: vscode.ExtensionContext,
    config: XpConfig,
): Promise<void> {
    const settings = vscode.workspace.getConfiguration(SETTINGS_NAMESPACE);

    await context.globalState.update(CONFIG_KEY, config);
    await Promise.all([
        settings.update(
            SETTING_XP_MULTIPLIER,
            config.xpMultiplier,
            vscode.ConfigurationTarget.Global,
        ),
        settings.update(
            SETTING_SHOW_INFO_MESSAGES,
            config.showInfoMessages,
            vscode.ConfigurationTarget.Global,
        ),
        settings.update(
            SETTING_SHOW_STATUS_BAR_CONFETTI,
            config.showStatusBarConfetti,
            vscode.ConfigurationTarget.Global,
        ),
    ]);
}

export async function resetXPBar(
    context: vscode.ExtensionContext,
    stats: PlayerStats,
    pendingChanges: Map<string, number>,
    updateStatus: () => void,
): Promise<void> {
    stats.totalXp = 0;
    stats.level = 1;
    pendingChanges.clear();
    await setStats(context, stats);
    updateStatus();
}

export function validateXpMultiplier(value: string): string | undefined {
    const parsed = Number(value);
    if (
        !Number.isFinite(parsed)
        || parsed < MIN_XP_MULTIPLIER
        || parsed > MAX_XP_MULTIPLIER
    ) {
        return `Enter a number from ${MIN_XP_MULTIPLIER} to ${MAX_XP_MULTIPLIER}.`;
    }

    return undefined;
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        return fallback;
    }

    return value;
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallback;
    }

    if (value < MIN_XP_MULTIPLIER || value > MAX_XP_MULTIPLIER) {
        return fallback;
    }

    return value;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value !== "boolean") {
        return fallback;
    }

    return value;
}

function hasExplicitSetting<T>(
    settings: vscode.WorkspaceConfiguration,
    key: string,
): boolean {
    const inspected = settings.inspect<T>(key);
    if (!inspected) {
        return false;
    }

    return inspected.workspaceFolderValue !== undefined
        || inspected.workspaceValue !== undefined
        || inspected.globalValue !== undefined;
}

function readNumberSetting(
    settings: vscode.WorkspaceConfiguration,
    key: string,
    fallback: unknown,
): unknown {
    if (!hasExplicitSetting<number>(settings, key)) {
        return fallback;
    }

    return settings.get<number>(key);
}

function readBooleanSetting(
    settings: vscode.WorkspaceConfiguration,
    key: string,
    fallback: unknown,
): unknown {
    if (!hasExplicitSetting<boolean>(settings, key)) {
        return fallback;
    }

    return settings.get<boolean>(key);
}

function migrateLegacyStats(legacy: LegacyPlayerStats): PlayerStats {
    const level = normalizePositiveInteger(legacy.level, 1);
    const legacyXp =
        typeof legacy.xp === "number" && Number.isFinite(legacy.xp)
            ? Math.max(0, Math.floor(legacy.xp))
            : 0;

    const totalXp = getTotalXpForLevel(level) + legacyXp;
    return {
        totalXp,
        level: getLevelForTotalXp(totalXp),
    };
}
