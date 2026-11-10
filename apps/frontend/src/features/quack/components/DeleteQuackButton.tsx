import { useState, type MouseEvent } from "react"
import { Loader2, Trash2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import type { Quack } from "@/features/quack/api/quackSchemas"
import { useDeleteQuack } from "@/features/quack/hooks/useDeleteQuack"

type DeleteQuackButtonProps = { quack: Quack }

// How much of the quack the dialog quotes back, so you know which one you're
// about to lose without the dialog growing with a long post.
const PREVIEW_LENGTH = 80

export function DeleteQuackButton({ quack }: DeleteQuackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const deleteQuack = useDeleteQuack()

  const preview =
    quack.text.length > PREVIEW_LENGTH
      ? `${quack.text.slice(0, PREVIEW_LENGTH).trimEnd()}…`
      : quack.text

  const handleOpenChange = (isNextOpen: boolean) => {
    // Don't let Escape or Cancel close the dialog mid-request.
    if (deleteQuack.isPending) return
    if (!isNextOpen) deleteQuack.reset()
    setIsOpen(isNextOpen)
  }

  const handleDelete = (event: MouseEvent) => {
    // AlertDialogAction closes on click by default; keep it open until the
    // request succeeds so a failure can be shown in place.
    event.preventDefault()
    deleteQuack.mutate(quack.id, { onSuccess: () => setIsOpen(false) })
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete quack"
          className="text-muted-foreground"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this quack?</AlertDialogTitle>
          <AlertDialogDescription>
            “{preview}” will disappear from the feed for everyone. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteQuack.error ? (
          <Alert variant="destructive">
            <AlertDescription>{deleteQuack.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteQuack.isPending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteQuack.isPending}
            onClick={handleDelete}
          >
            {deleteQuack.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
