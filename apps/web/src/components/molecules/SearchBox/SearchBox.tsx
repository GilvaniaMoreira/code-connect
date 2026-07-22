import { useEffect, useState, type FormEvent } from 'react'
import { MaterialIcon } from '../../atoms/MaterialIcon'

type SearchBoxProps = {
  value: string
  onSearch: (query: string) => void
  placeholder?: string
  id?: string
}

// Debounce local para não bombardear o backend a cada tecla, sem depender de uma lib.
export function SearchBox({
  value,
  onSearch,
  placeholder = 'Digite o que você procura',
  id = 'feed-search',
}: SearchBoxProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft !== value) onSearch(draft)
    }, 300)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(draft)
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-4 rounded-sm bg-surface px-4 py-2"
    >
      <label htmlFor={id} className="sr-only">
        Buscar
      </label>
      <MaterialIcon name="search" size="lg" className="text-muted" />
      <input
        id={id}
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full bg-transparent text-lg text-foreground placeholder:text-muted focus:outline-none"
      />
    </form>
  )
}
