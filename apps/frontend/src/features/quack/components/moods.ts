import type { QuackMood } from "@/features/quack/api/quackSchemas"

// One place that decides how each mood reads — the form and the feed both use it.
// The emoji carries the tone at a glance; the word keeps it unambiguous.
export const moodOptions: Record<QuackMood, { emoji: string; label: string }> = {
  happy: { emoji: "😄", label: "Happy" },
  sad: { emoji: "😢", label: "Sad" },
  angry: { emoji: "😠", label: "Angry" },
  silly: { emoji: "🤪", label: "Silly" },
}
