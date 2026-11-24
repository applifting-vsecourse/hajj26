import { Bookmark } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { Quack } from "@/features/quack/api/quackSchemas"
import { useToggleSavedQuack } from "@/features/quack/hooks/useToggleSavedQuack"

type SaveQuackButtonProps = { quack: Pick<Quack, "id" | "isSaved"> }

// A toggle: the name stays "Save quack" and aria-pressed says whether it is
// saved, which is how screen readers expect toggle buttons to behave.
export function SaveQuackButton({ quack }: SaveQuackButtonProps) {
  const toggle = useToggleSavedQuack()

  // While the request runs, show where it is heading so the click feels
  // instant; the refetch afterwards brings the server's answer.
  const isSaved = toggle.isPending ? toggle.variables.shouldSave : Boolean(quack.isSaved)

  const handleClick = () => {
    // Not `disabled`: that would drop keyboard focus mid-toggle. A click while
    // the previous one is in flight is simply ignored.
    if (toggle.isPending) return
    toggle.mutate(
      { quackId: quack.id, shouldSave: !isSaved },
      {
        onError: (error) =>
          toast.error(isSaved ? "Couldn't remove from Saved" : "Couldn't save the quack", {
            description: error.message,
          }),
      },
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Save quack"
      aria-pressed={isSaved}
      title={isSaved ? "Saved — click to remove" : "Save for later"}
      onClick={handleClick}
      className={cn(isSaved ? "text-foreground" : "text-muted-foreground")}
    >
      <Bookmark className={cn(isSaved && "fill-current")} />
    </Button>
  )
}
