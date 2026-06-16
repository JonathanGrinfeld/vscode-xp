import * as vscode from "vscode";

export interface PlayerStats {
    totalXp: number;
    level: number;
}

export interface LegacyPlayerStats {
    xp: number;
    level: number;
}

export interface XpConfig {
    xpMultiplier: number;
    showInfoMessages: boolean;
    showStatusBarConfetti: boolean;
}

export type StatsQuickPickAction =
    | "none"
    | "configure"
    | "toggleInfoMessages"
    | "toggleStatusBarConfetti"
    | "reset";

export interface StatsViewModel {
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpNeeded: number;
    progressPercent: number;
    xpMultiplier: number;
}

export interface StatsQuickPickItem extends vscode.QuickPickItem {
    action: StatsQuickPickAction;
}
