import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api-client"

import { quackKeys } from "@/features/quack/api/quackKeys"
import { quacksSchema } from "@/features/quack/api/quackSchemas"

// The signed-in user's Saved, the most recently saved first (the server orders it).
export const savedQuacksQueryOptions = () =>
  queryOptions({
    queryKey: quackKeys.saved(),
    queryFn: async () => quacksSchema.parse(await api.get("saved").json()),
  })
