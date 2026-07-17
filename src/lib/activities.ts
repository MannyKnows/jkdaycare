// Daily-report activity kinds and the one-tap presets shared by the child
// profile, the roster quick-log, and the group batch bar. This is the single
// source of truth so every surface offers the same buttons and the same labels.

export const ACTIVITY_KINDS = ["meal", "nap", "mood", "activity", "note", "diaper"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export function isKind(k: string): k is ActivityKind {
	return (ACTIVITY_KINDS as readonly string[]).includes(k);
}

// One-tap presets. `detail` is optional extra text; empty means the kind label
// alone (e.g. "😴 Nap") is enough. The typed form still handles specifics.
export interface Preset {
	emoji: string;
	label: string;
	kind: ActivityKind;
	detail: string;
}

export const PRESETS: Preset[] = [
	{ emoji: "🍎", label: "Ate", kind: "meal", detail: "" },
	{ emoji: "🥣", label: "Snack", kind: "meal", detail: "Snack" },
	{ emoji: "😴", label: "Nap", kind: "nap", detail: "" },
	{ emoji: "🚼", label: "Diaper", kind: "diaper", detail: "" },
	{ emoji: "🙂", label: "Happy", kind: "mood", detail: "Happy" },
];
