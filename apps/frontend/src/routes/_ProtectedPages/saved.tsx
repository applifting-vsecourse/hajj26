import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"

import { ROUTES } from "@/app/routes"
import { Seo } from "@/components/Seo"
import { Button } from "@/components/ui/button"

import { useSession } from "@/features/auth/hooks/useSession"
import { savedQuacksQueryOptions } from "@/features/quack/api/savedQuacksQueryOptions"
import { QuackList } from "@/features/quack/components/QuackList"

export const Route = createFileRoute("/_ProtectedPages/saved")({
  component: SavedPage,
})

function SavedPage() {
  const { user } = useSession()
  const savedQuery = useQuery(savedQuacksQueryOptions())

  return (
    <>
      <Seo title="Saved" />
      <section className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
          <p className="text-sm text-muted-foreground">
            Quacks you kept for later, the most recently saved first. Only you can see this list.
          </p>
        </div>

        <QuackList
          quacks={savedQuery.data ?? []}
          isLoading={savedQuery.isLoading}
          error={savedQuery.error ?? undefined}
          onReload={() => void savedQuery.refetch()}
          emptyMessage="Nothing saved yet. Tap the bookmark on a quack and it will wait for you here."
          emptyAction={
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={ROUTES.quacks}>Browse quacks</Link>
            </Button>
          }
          currentUserId={user?.id}
        />
      </section>
    </>
  )
}
