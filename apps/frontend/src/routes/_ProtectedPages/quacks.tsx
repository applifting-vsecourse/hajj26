import { useCallback, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { Seo } from "@/components/Seo"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSession } from "@/features/auth/hooks/useSession"
import { quacksQueryOptions } from "@/features/quack/api/quacksQueryOptions"
import { QuackForm } from "@/features/quack/components/QuackForm"
import { QuackList } from "@/features/quack/components/QuackList"
import { QuackSearch } from "@/features/quack/components/QuackSearch"

const FEEDS = ["all", "mine"] as const
type Feed = (typeof FEEDS)[number]

// The search and the chosen tab live in the URL so a reload or a shared link
// keeps them. An unknown tab falls back to "all" instead of erroring.
const quacksSearchParamsSchema = z.object({
  q: z.string().optional(),
  feed: z.enum(FEEDS).optional().catch(undefined),
})

export const Route = createFileRoute("/_ProtectedPages/quacks")({
  component: QuacksPage,
  validateSearch: quacksSearchParamsSchema,
})

function QuacksPage() {
  const { q = "", feed = "all" } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { user } = useSession()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMine = feed === "mine"
  const quacksQuery = useQuery(quacksQueryOptions({ search: q || undefined, mine: isMine }))

  const handleSearch = useCallback(
    (search: string) =>
      void navigate({ search: (prev) => ({ ...prev, q: search || undefined }), replace: true }),
    [navigate],
  )

  const handleFeedChange = (value: string) =>
    void navigate({
      search: (prev) => ({ ...prev, feed: value === "mine" ? ("mine" satisfies Feed) : undefined }),
    })

  const writeFirstQuack = () => {
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    textareaRef.current?.focus({ preventScroll: true })
  }

  const emptyMessage = isMine
    ? q
      ? `None of your quacks match “${q}”.`
      : "You haven't quacked yet. Your quacks will show up here."
    : q
      ? `No quacks match “${q}”.`
      : undefined

  return (
    <>
      <Seo title="Quacks" />
      <section className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Quacks</h1>

        <QuackForm
          className="mb-8"
          textareaRef={textareaRef}
        />

        <Tabs
          value={feed}
          onValueChange={handleFeedChange}
        >
          <TabsList aria-label="Which quacks to show">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">Mine</TabsTrigger>
          </TabsList>

          <TabsContent
            value={feed}
            className="mt-4"
          >
            <QuackSearch
              value={q}
              onSearch={handleSearch}
              className="mb-4"
            />

            <QuackList
              quacks={quacksQuery.data ?? []}
              isLoading={quacksQuery.isLoading}
              error={quacksQuery.error ?? undefined}
              // Only the error state offers a retry — posting or deleting
              // invalidates the list, and refocusing the tab refetches it.
              onReload={() => void quacksQuery.refetch()}
              emptyMessage={emptyMessage}
              emptyAction={
                isMine && !q ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={writeFirstQuack}
                  >
                    Write your first quack
                  </Button>
                ) : undefined
              }
              currentUserId={user?.id}
            />
          </TabsContent>
        </Tabs>
      </section>
    </>
  )
}
