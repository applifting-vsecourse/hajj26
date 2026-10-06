import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { Seo } from "@/components/Seo"

import { quacksQueryOptions } from "@/features/quack/api/quacksQueryOptions"
import { QuackForm } from "@/features/quack/components/QuackForm"
import { QuackList } from "@/features/quack/components/QuackList"
import { QuackSearch } from "@/features/quack/components/QuackSearch"

// The search lives in the URL so a reload or a shared link keeps it.
const quacksSearchParamsSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute("/_ProtectedPages/quacks")({
  component: QuacksPage,
  validateSearch: quacksSearchParamsSchema,
})

function QuacksPage() {
  const { q = "" } = Route.useSearch()
  const navigate = Route.useNavigate()
  const quacksQuery = useQuery(quacksQueryOptions({ search: q || undefined }))

  const handleSearch = useCallback(
    (search: string) => void navigate({ search: { q: search || undefined }, replace: true }),
    [navigate],
  )

  return (
    <>
      <Seo title="Quacks" />
      <section className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Quacks</h1>

        <QuackForm className="mb-8" />

        <QuackSearch
          value={q}
          onSearch={handleSearch}
          className="mb-4"
        />

        <QuackList
          quacks={quacksQuery.data ?? []}
          isLoading={quacksQuery.isLoading}
          error={quacksQuery.error ?? undefined}
          // Only the error state offers a retry — posting invalidates the list,
          // and refocusing the tab refetches it.
          onReload={() => void quacksQuery.refetch()}
          emptyMessage={q ? `No quacks match “${q}”.` : undefined}
        />
      </section>
    </>
  )
}
