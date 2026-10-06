import type { QuackMood } from "@/features/quack/api/quackSchemas"
import { moodOptions } from "@/features/quack/components/moods"

type QuackMoodBadgeProps = { mood: QuackMood }

export function QuackMoodBadge({ mood }: QuackMoodBadgeProps) {
  const { emoji, label } = moodOptions[mood]

  return (
    <span className="text-xs text-muted-foreground">
      <span className="sr-only">Mood: </span>
      <span aria-hidden="true">{emoji}</span> {label}
    </span>
  )
}
