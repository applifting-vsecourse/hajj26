import { useEffect, useId, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

type QuackSearchProps = {
  value: string
  onSearch: (search: string) => void
  className?: string
}

// Typing updates the field immediately; the search itself waits for a short
// pause so we don't hit the API on every keystroke.
export function QuackSearch({ value, onSearch, className }: QuackSearchProps) {
  const id = useId()
  const [draft, setDraft] = useState(value)
  const debounced = useDebouncedValue(draft, 300)

  useEffect(() => {
    if (debounced.trim() !== value) onSearch(debounced.trim())
  }, [debounced, value, onSearch])

  return (
    <div className={className}>
      <Label
        htmlFor={id}
        className="mb-2"
      >
        Search quacks
      </Label>
      <Input
        id={id}
        type="search"
        placeholder="A word, a name or @username"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </div>
  )
}
