import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { saveQuack, unsaveQuack } from "@/features/quack/api/savedQuacks"
import { SaveQuackButton } from "@/features/quack/components/SaveQuackButton"

vi.mock("@/features/quack/api/savedQuacks", () => ({ saveQuack: vi.fn(), unsaveQuack: vi.fn() }))

const renderButton = (isSaved: boolean) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
    >
      <SaveQuackButton quack={{ id: "q1", isSaved }} />
    </QueryClientProvider>,
  )

describe("SaveQuackButton", () => {
  beforeEach(() => {
    vi.mocked(saveQuack).mockReset()
    vi.mocked(unsaveQuack).mockReset()
  })

  it("saves an unsaved quack and shows it as pressed straight away", async () => {
    // Never resolves, so we see the state while the request is in flight.
    vi.mocked(saveQuack).mockReturnValue(new Promise<void>(() => undefined))
    renderButton(false)

    const button = screen.getByRole("button", { name: "Save quack" })
    expect(button).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(button)

    expect(saveQuack).toHaveBeenCalledWith("q1")
    expect(unsaveQuack).not.toHaveBeenCalled()
    expect(button).toHaveAttribute("aria-pressed", "true")
  })

  it("removes a saved quack from Saved", async () => {
    vi.mocked(unsaveQuack).mockResolvedValue()
    renderButton(true)

    const button = screen.getByRole("button", { name: "Save quack" })
    expect(button).toHaveAttribute("aria-pressed", "true")

    await userEvent.click(button)

    await waitFor(() => expect(unsaveQuack).toHaveBeenCalledWith("q1"))
    expect(saveQuack).not.toHaveBeenCalled()
  })
})
