import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api-client"

import { quackKeys } from "@/features/quack/api/quackKeys"
import { quacksSchema } from "@/features/quack/api/quackSchemas"

export const quacksQueryOptions = (filters: { search?: string } = {}) =>
  queryOptions({
    queryKey: quackKeys.list(filters),
    queryFn: async () =>
      quacksSchema.parse(
        await api
          .get("quacks", { searchParams: filters.search ? { search: filters.search } : undefined })
          .json(),
      ),
    // Keep showing the previous results while the next search loads, so the
    // list doesn't flash a spinner on every keystroke.
    placeholderData: keepPreviousData,
  })
