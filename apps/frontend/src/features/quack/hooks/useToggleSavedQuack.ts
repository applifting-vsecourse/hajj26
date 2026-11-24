import { useMutation, useQueryClient } from "@tanstack/react-query"

import { quackKeys } from "@/features/quack/api/quackKeys"
import { saveQuack, unsaveQuack } from "@/features/quack/api/savedQuacks"

export function useToggleSavedQuack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quackId, shouldSave }: { quackId: string; shouldSave: boolean }) =>
      shouldSave ? saveQuack(quackId) : unsaveQuack(quackId),
    // Refreshes both the feed (isSaved) and Saved, which share the `all` key.
    onSettled: () => queryClient.invalidateQueries({ queryKey: quackKeys.all() }),
  })
}
