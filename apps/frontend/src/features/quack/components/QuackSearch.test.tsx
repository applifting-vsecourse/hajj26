import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { QuackSearch } from "@/features/quack/components/QuackSearch"

describe("QuackSearch", () => {
  it("searches for the trimmed term once the user stops typing", async () => {
    const onSearch = vi.fn()
    render(
      <QuackSearch
        value=""
        onSearch={onSearch}
      />,
    )

    await userEvent.type(screen.getByLabelText("Search quacks"), "  bread ")

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("bread"))
    // Debounced: one search for the whole word, not one per keystroke.
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it("starts with the current search filled in", () => {
    render(
      <QuackSearch
        value="duck"
        onSearch={vi.fn()}
      />,
    )

    expect(screen.getByLabelText("Search quacks")).toHaveValue("duck")
  })
})
