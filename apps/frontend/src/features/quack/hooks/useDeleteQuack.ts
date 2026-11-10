import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteQuack } from "@/features/quack/api/deleteQuack"
import { quackKeys } from "@/features/quack/api/quackKeys"

export function useDeleteQuack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQuack,
    // Awaited, so the mutation stays pending until the feed has refetched —
    // the dialog closes at the same moment the quack leaves the list.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quackKeys.all() }),
  })
}
