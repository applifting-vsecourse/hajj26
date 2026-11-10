import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { deleteQuack } from "@/features/quack/api/deleteQuack"
import type { Quack } from "@/features/quack/api/quackSchemas"
import { DeleteQuackButton } from "@/features/quack/components/DeleteQuackButton"

vi.mock("@/features/quack/api/deleteQuack", () => ({ deleteQuack: vi.fn() }))

const quack: Quack = {
  id: "q1",
  text: "Bread is just cake that gave up.",
  mood: null,
  userId: "u1",
  createdAt: new Date("2026-01-01T12:00:00Z"),
  user: { id: "u1", name: "Caffeinated Duck", username: "CaffeinatedDuck" },
}

const renderButton = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <DeleteQuackButton quack={quack} />
    </QueryClientProvider>,
  )

describe("DeleteQuackButton", () => {
  beforeEach(() => {
    vi.mocked(deleteQuack).mockReset()
  })

  it("asks before deleting and quotes the quack", async () => {
    renderButton()

    await userEvent.click(screen.getByRole("button", { name: "Delete quack" }))

    const dialog = screen.getByRole("alertdialog", { name: "Delete this quack?" })
    expect(dialog).toHaveTextContent("Bread is just cake that gave up.")
    expect(deleteQuack).not.toHaveBeenCalled()
  })

  it("does nothing when the author changes their mind", async () => {
    renderButton()

    await userEvent.click(screen.getByRole("button", { name: "Delete quack" }))
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(deleteQuack).not.toHaveBeenCalled()
  })

  it("deletes on confirm and closes the dialog", async () => {
    vi.mocked(deleteQuack).mockResolvedValue()
    renderButton()

    await userEvent.click(screen.getByRole("button", { name: "Delete quack" }))
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))

    expect(deleteQuack).toHaveBeenCalledWith("q1", expect.anything())
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("keeps the dialog open and explains a failure", async () => {
    vi.mocked(deleteQuack).mockRejectedValue(new Error("You can only delete your own quacks"))
    renderButton()

    await userEvent.click(screen.getByRole("button", { name: "Delete quack" }))
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))

    expect(await screen.findByText("You can only delete your own quacks")).toBeInTheDocument()
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })
})
