import * as vscode from "vscode";
import { clearInterval, setInterval } from "timers";
import { PlayerStats, StatsQuickPickItem, XpConfig } from "./types";

export async function showStatsPopup(
    _stats: PlayerStats,
    config: XpConfig,
): Promise<void> {
    const items: StatsQuickPickItem[] = [
        {
            label: "Settings",
            kind: vscode.QuickPickItemKind.Separator,
            action: "none",
        },
        {
            label: "$(settings-gear) Configure XP",
            detail: `Current multiplier: ${config.xpMultiplier}x`,
            action: "configure",
        },
        {
            label: "$(bell) Info Messages",
            detail: config.showInfoMessages ? "Enabled" : "Disabled",
            action: "toggleInfoMessages",
        },
        {
            label: "$(symbol-event) Status Bar Confetti",
            detail: config.showStatusBarConfetti ? "Enabled" : "Disabled",
            action: "toggleStatusBarConfetti",
        },
        {
            label: "$(trash) Reset XP Bar",
            detail: "Reset level and XP back to zero.",
            action: "reset",
        },
    ];

    const picked = await vscode.window.showQuickPick(items, {
        title: "XP Bar Settings",
        placeHolder: "Configure XP behavior",
        ignoreFocusOut: false,
        matchOnDescription: false,
        matchOnDetail: true,
    });

    if (!picked) {
        return;
    }

    if (picked.action === "configure") {
        await vscode.commands.executeCommand("vscl.configureXp");
        await showStatsPopup(_stats, config);
        return;
    }

    if (picked.action === "toggleInfoMessages") {
        await vscode.commands.executeCommand("vscl.toggleInfoMessages");
        await showStatsPopup(_stats, config);
        return;
    }

    if (picked.action === "toggleStatusBarConfetti") {
        await vscode.commands.executeCommand("vscl.toggleStatusBarConfetti");
        await showStatsPopup(_stats, config);
        return;
    }

    if (picked.action === "reset") {
        await vscode.commands.executeCommand("vscl.reset");
        await showStatsPopup(_stats, config);
    }
}

export function showConfettiInStatusBar(confettiBar: vscode.StatusBarItem): void {
    const frames = ["🎉", "✨", "🎊", "✨", "🎉", ""];
    let index = 0;

    const interval = setInterval(() => {
        confettiBar.text = frames[index] ? `${frames[index]} ` : "";
        index++;

        if (index >= frames.length) {
            clearInterval(interval);
            confettiBar.text = "";
        }
    }, 180);
}
