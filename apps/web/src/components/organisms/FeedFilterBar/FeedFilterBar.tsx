import { Tag } from '../../atoms/Tag'
import { SearchBox } from '../../molecules/SearchBox'

type FeedFilterBarProps = {
  query: string
  tags: string[]
  onQueryChange: (query: string) => void
  onRemoveTag: (tag: string) => void
  onClearAll: () => void
}

export function FeedFilterBar({
  query,
  tags,
  onQueryChange,
  onRemoveTag,
  onClearAll,
}: FeedFilterBarProps) {
  const hasFilters = query.length > 0 || tags.length > 0
  return (
    <section className="flex w-full flex-col gap-4">
      <SearchBox value={query} onSearch={onQueryChange} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-4">
          {tags.map((tag) => (
            <li key={tag}>
              <Tag label={tag} variant="active" onRemove={() => onRemoveTag(tag)} />
            </li>
          ))}
        </ul>
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="cursor-pointer text-sm text-muted underline underline-offset-4 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </section>
  )
}
