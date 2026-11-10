import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api-client"

import { quackKeys, type QuackListFilters } from "@/features/quack/api/quackKeys"
import { quacksSchema } from "@/features/quack/api/quackSchemas"

export const quacksQueryOptions = (filters: QuackListFilters = {}) =>
  queryOptions({
    queryKey: quackKeys.list(filters),
    queryFn: async () =>
      quacksSchema.parse(
        await api
          .get("quacks", {
            searchParams: {
              ...(filters.search ? { search: filters.search } : {}),
              ...(filters.mine ? { mine: "true" } : {}),
            },
          })
          .json(),
      ),
    // Keep showing the previous results while the next search loads, so the
    // list doesn't flash a spinner on every keystroke — but only within the
    // same tab: switching to "Mine" must never briefly show everyone's quacks.
    placeholderData: (previousData, previousQuery) => {
      const previousFilters = previousQuery?.queryKey[2]
      return Boolean(previousFilters?.mine) === Boolean(filters.mine) ? previousData : undefined
    },
  })
