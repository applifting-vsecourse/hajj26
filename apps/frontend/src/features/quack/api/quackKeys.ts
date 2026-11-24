export type QuackListFilters = { search?: string; mine?: boolean }

export const quackKeys = {
  all: () => ["quacks"] as const,
  lists: () => [...quackKeys.all(), "list"] as const,
  list: (filters: QuackListFilters) => [...quackKeys.lists(), filters] as const,
  // Under `all`, so whatever invalidates the feed (posting, deleting, saving)
  // refreshes Saved too.
  saved: () => [...quackKeys.all(), "saved"] as const,
}
