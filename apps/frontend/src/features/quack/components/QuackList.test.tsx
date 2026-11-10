// Example component test — the pattern to copy for your own components.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Quack } from "@/features/quack/api/quackSchemas"
import { QuackList } from "@/features/quack/components/QuackList"

const quack = (overrides: Partial<Quack> = {}): Quack => ({
  id: "q1",
  text: "quack quack",
  mood: null,
  userId: "u1",
  createdAt: new Date("2026-01-01T12:00:00Z"),
  user: { id: "u1", name: "Caffeinated Duck", username: "CaffeinatedDuck" },
  ...overrides,
})

describe("QuackList", () => {
  it("renders quacks with author info", () => {
    render(<QuackList quacks={[quack()]} />)

    expect(screen.getByText("quack quack")).toBeInTheDocument()
    expect(screen.getByText("Caffeinated Duck")).toBeInTheDocument()
    expect(screen.getByText("@CaffeinatedDuck")).toBeInTheDocument()
  })

  it("shows the mood a quack was posted with", () => {
    render(<QuackList quacks={[quack({ mood: "silly" })]} />)

    expect(screen.getByText(/Mood:/).parentElement).toHaveTextContent("Mood: 🤪 Silly")
  })

  it("shows no mood for a quack posted without one", () => {
    render(<QuackList quacks={[quack()]} />)

    expect(screen.queryByText(/Mood:/)).not.toBeInTheDocument()
  })

  it("explains an empty result with the given message", () => {
    render(
      <QuackList
        quacks={[]}
        emptyMessage="No quacks match “heron”."
      />,
    )

    expect(screen.getByText("No quacks match “heron”.")).toBeInTheDocument()
  })

  it("shows an error with a working reload button", async () => {
    const onReload = vi.fn()
    render(
      <QuackList
        quacks={[]}
        error={new Error("Server unreachable")}
        onReload={onReload}
      />,
    )

    expect(screen.getByText("Couldn't load quacks")).toBeInTheDocument()
    expect(screen.getByText("Server unreachable")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: /reload/i }))
    expect(onReload).toHaveBeenCalledOnce()
  })

  it("offers delete only on the signed-in user's own quacks", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <QuackList
          quacks={[
            quack({ id: "mine", text: "my quack", userId: "u1" }),
            quack({
              id: "theirs",
              text: "their quack",
              userId: "u2",
              user: { id: "u2", name: "Bread Critic", username: "BreadCritic" },
            }),
          ]}
          currentUserId="u1"
        />
      </QueryClientProvider>,
    )

    const deleteButton = screen.getByRole("button", { name: "Delete quack" })
    expect(screen.getByText("my quack").closest("article")).toContainElement(deleteButton)
  })

  it("offers no delete at all without a signed-in user", () => {
    render(<QuackList quacks={[quack()]} />)

    expect(screen.queryByRole("button", { name: "Delete quack" })).not.toBeInTheDocument()
  })

  it("shows an action under the empty message", () => {
    render(
      <QuackList
        quacks={[]}
        emptyMessage="You haven't quacked yet."
        emptyAction={<button type="button">Write your first quack</button>}
      />,
    )

    expect(screen.getByText("You haven't quacked yet.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Write your first quack" })).toBeInTheDocument()
  })
})
