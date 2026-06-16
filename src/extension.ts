import * as vscode from "vscode";
import { createHash } from "crypto";
import {
    DUPLICATE_CONTENT_WINDOW_MS,
    IGNORED_FILE_NAMES,
    IGNORED_PATH_SEGMENTS,
    MAX_COUNTED_CHANGES_PER_SAVE,
    MAX_XP_MULTIPLIER,
    MIN_CHANGES_FOR_XP,
    MIN_XP_MULTIPLIER,
    XP_CHANGE_DIVISOR,
} from "./constants";
import { getLevelForTotalXp, getStatsViewModel, renderTooltipProgressBar } from "./xp";
import {
    getConfig,
    getStats,
    resetXPBar,
    setConfig,
    setStats,
    validateXpMultiplier,
} from "./state";
import { showConfettiInStatusBar, showStatsPopup } from "./ui";

export function activate(context: vscode.ExtensionContext) {
    const stats = getStats(context);
    const config = getConfig(context);
    const pendingChanges = new Map<string, number>();
    const recentFingerprints = new Map<string, number>();
    const showInfoMessage = (message: string) => {
        if (config.showInfoMessages) {
            void vscode.window.showInformationMessage(message);
        }
    };

    const confettiBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        101,
    );
    confettiBar.text = "";
    confettiBar.tooltip = "Level-up celebration";

    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100,
    );
    statusBar.command = "vscx.showStats";
    context.subscriptions.push(confettiBar, statusBar);

    const updateStatus = () => {
        const model = getStatsViewModel(stats, config);
        const tooltipBar = renderTooltipProgressBar(model.progressPercent, 14);

        const tooltip = new vscode.MarkdownString(undefined, true);
        tooltip.supportThemeIcons = true;
        tooltip.appendMarkdown("### XP Progress\n\n");
        tooltip.appendMarkdown(`${tooltipBar} **${model.progressPercent.toFixed(1)}%**\n\n`);
        tooltip.appendMarkdown(`Level: **${model.level}**  \n`);
        tooltip.appendMarkdown(
            `XP in level: **${model.xpInLevel.toLocaleString()} / ${model.xpNeeded.toLocaleString()}**  \n`,
        );
        tooltip.appendMarkdown(`Total XP: **${model.totalXp.toLocaleString()}**  \n`);
        tooltip.appendMarkdown(`Multiplier: **${model.xpMultiplier}x**  \n\n`);
        tooltip.appendMarkdown("Click to open settings.");

        statusBar.text = "$(milestone) LVL "+stats.level;
        statusBar.tooltip = tooltip;
        confettiBar.show();
        statusBar.show();
    };

    const changeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.isUntitled || event.contentChanges.length === 0) {
            return;
        }

        const key = event.document.uri.toString();
        const current = pendingChanges.get(key) ?? 0;

        const added = event.contentChanges.reduce((sum, change) => {
            const delta = Math.abs(change.text.length - change.rangeLength);
            return sum + Math.max(1, delta);
        }, 0);

        pendingChanges.set(key, current + added);
    });

    const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.isUntitled) {
            return;
        }

        const key = document.uri.toString();
        if (shouldIgnoreDocument(document)) {
            pendingChanges.delete(key);
            return;
        }

        const changes = pendingChanges.get(key) ?? 0;

        if (changes < MIN_CHANGES_FOR_XP) {
            pendingChanges.delete(key);
            return;
        }

        const now = Date.now();
        pruneOldFingerprints(recentFingerprints, now);

        const fingerprint = getDocumentFingerprint(document.getText());
        const seenAt = recentFingerprints.get(fingerprint);
        if (seenAt !== undefined && now - seenAt <= DUPLICATE_CONTENT_WINDOW_MS) {
            pendingChanges.delete(key);
            return;
        }

        recentFingerprints.set(fingerprint, now);

        const effectiveChanges = Math.min(changes, MAX_COUNTED_CHANGES_PER_SAVE);
        const baseXp = Math.ceil(effectiveChanges / XP_CHANGE_DIVISOR);
        const gainedXp = Math.ceil(baseXp * config.xpMultiplier);
        stats.totalXp += gainedXp;
        pendingChanges.delete(key);

        const previousLevel = stats.level;
        stats.level = getLevelForTotalXp(stats.totalXp);
        const leveledUp = stats.level > previousLevel;

        if (leveledUp) {
            showInfoMessage(
                `🎉 Level Up! You are now level ${stats.level}!`,
            );
            if (config.showStatusBarConfetti) {
                showConfettiInStatusBar(confettiBar);
            }
        }

        void setStats(context, stats);
        updateStatus();
    });

    const configListener = vscode.workspace.onDidChangeConfiguration((event) => {
        if (
            event.affectsConfiguration("vscode-xp.xpMultiplier")
            || event.affectsConfiguration("vscode-xp.showInfoMessages")
            || event.affectsConfiguration("vscode-xp.showStatusBarConfetti")
        ) {
            const refreshed = getConfig(context);
            config.xpMultiplier = refreshed.xpMultiplier;
            config.showInfoMessages = refreshed.showInfoMessages;
            config.showStatusBarConfetti = refreshed.showStatusBarConfetti;
            updateStatus();
        }
    });

    context.subscriptions.push(changeListener, saveListener, configListener);

    context.subscriptions.push(
        vscode.commands.registerCommand("vscx.showStats", async () => {
            await showStatsPopup(stats, config);
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vscx.configureXp", async () => {
            const xpMultiplierInput = await vscode.window.showInputBox({
                title: "XP Bar: XP Multiplier",
                prompt: `Set XP multiplier (${MIN_XP_MULTIPLIER} to ${MAX_XP_MULTIPLIER}). Default is 1.`,
                value: String(config.xpMultiplier),
                validateInput: (value) => validateXpMultiplier(value),
            });

            if (xpMultiplierInput === undefined) {
                return;
            }

            const xpMultiplier = Number(xpMultiplierInput);
            config.xpMultiplier = xpMultiplier;
            await setConfig(context, config);

            showInfoMessage(`XP settings saved: multiplier ${xpMultiplier}.`);
            updateStatus();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vscx.toggleInfoMessages", async () => {
            config.showInfoMessages = !config.showInfoMessages;
            await setConfig(context, config);

            if (config.showInfoMessages) {
                void vscode.window.showInformationMessage("Info messages enabled.");
            }

            updateStatus();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vscx.toggleStatusBarConfetti", async () => {
            config.showStatusBarConfetti = !config.showStatusBarConfetti;
            await setConfig(context, config);
            showInfoMessage(
                `Status bar confetti ${config.showStatusBarConfetti ? "enabled" : "disabled"}.`,
            );
            updateStatus();
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("vscx.reset", async () => {
            const confirm = await vscode.window.showInputBox({
                title: "XP Bar: Restart XP Bar",
                prompt: "Reset the XP bar. Type CONFIRM to confirm.",
            });

            if (confirm === "CONFIRM") {
                await resetXPBar(context, stats, pendingChanges, updateStatus);
                showInfoMessage("Restarted XP Bar");
            }
        }),
    );

    updateStatus();
}

export function deactivate() {}

function shouldIgnoreDocument(document: vscode.TextDocument): boolean {
    const fsPath = document.uri.fsPath.replace(/\\/g, "/").toLowerCase();
    const fileName = fsPath.split("/").pop() ?? "";

    if (IGNORED_FILE_NAMES.has(fileName)) {
        return true;
    }

    if (fileName.endsWith(".min.js") || fileName.endsWith(".map")) {
        return true;
    }

    return IGNORED_PATH_SEGMENTS.some((segment) => fsPath.includes(segment));
}

function getDocumentFingerprint(text: string): string {
    // Normalize whitespace/case so trivial formatting-only repeats don't farm XP.
    const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
    return createHash("sha1").update(normalized).digest("hex");
}

function pruneOldFingerprints(cache: Map<string, number>, now: number): void {
    for (const [hash, seenAt] of cache.entries()) {
        if (now - seenAt > DUPLICATE_CONTENT_WINDOW_MS) {
            cache.delete(hash);
        }
    }
}
