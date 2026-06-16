import { StatsViewModel, PlayerStats, XpConfig } from "./types";

// RuneScape XP table formula: floor(1/4 * sum(floor(n + 300 * 2^(n/7))), n=1..L-1)
export function getTotalXpForLevel(level: number): number {
    const safeLevel = Math.max(1, Math.floor(level));
    let points = 0;

    for (let n = 1; n < safeLevel; n++) {
        points += Math.floor(n + 300 * Math.pow(2, n / 7));
    }

    return Math.floor(points / 4);
}

export function getLevelForTotalXp(totalXp: number): number {
    const safeXp = Math.max(0, Math.floor(totalXp));
    let level = 1;

    while (getTotalXpForLevel(level + 1) <= safeXp) {
        level++;
    }

    return level;
}

export function getStatsViewModel(stats: PlayerStats, config: XpConfig): StatsViewModel {
    const currentLevelXp = getTotalXpForLevel(stats.level);
    const nextLevelXp = getTotalXpForLevel(stats.level + 1);
    const xpInLevel = Math.max(0, stats.totalXp - currentLevelXp);
    const xpNeeded = Math.max(1, nextLevelXp - currentLevelXp);
    const progressPercent = Math.min(100, (xpInLevel / xpNeeded) * 100);

    return {
        level: stats.level,
        totalXp: stats.totalXp,
        xpInLevel,
        xpNeeded,
        progressPercent,
        xpMultiplier: config.xpMultiplier,
    };
}

export function renderTextProgressBar(progressPercent: number, width: number): string {
    const safeWidth = Math.max(1, Math.floor(width));
    const clamped = Math.max(0, Math.min(100, progressPercent));
    const filled = Math.round((clamped / 100) * safeWidth);
    return `[${"=".repeat(filled)}${"-".repeat(Math.max(0, safeWidth - filled))}]`;
}

export function renderTooltipProgressBar(progressPercent: number, width: number): string {
    const safeWidth = Math.max(1, Math.floor(width));
    const clamped = Math.max(0, Math.min(100, progressPercent));
    const filled = Math.round((clamped / 100) * safeWidth);
    return "🟦".repeat(filled) + "⬜".repeat(Math.max(0, safeWidth - filled));
}
