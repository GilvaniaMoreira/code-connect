import { useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button'
import { FormField } from '../../molecules/FormField'

export type PostFormValues = {
  title: string
  description: string
  code: string
  tags: string
  thumbnail: string
}

type PostFormProps = {
  submitLabel: string
  initialValues?: Partial<PostFormValues>
  onSubmit: (values: PostFormValues) => Promise<void>
  onCancel?: () => void
  submittingLabel?: string
}

const emptyValues: PostFormValues = {
  title: '',
  description: '',
  code: '',
  tags: '',
  thumbnail: '',
}

export function PostForm({
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
  submittingLabel = 'Salvando...',
}: Readonly<PostFormProps>) {
  const [values, setValues] = useState<PostFormValues>({
    ...emptyValues,
    ...initialValues,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update =
    (field: keyof PostFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-4" noValidate>
      <FormField
        id="post-title"
        name="title"
        label="Título"
        placeholder="Como usar useEffect"
        value={values.title}
        onChange={update('title')}
      />

      <FormField
        id="post-description"
        name="description"
        label="Descrição"
        placeholder="Um resumo curto do post (mín. 10 caracteres)"
        value={values.description}
        onChange={update('description')}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="post-code" className="text-sm font-medium text-foreground">
          Código
        </label>
        <textarea
          id="post-code"
          name="code"
          rows={10}
          value={values.code}
          onChange={update('code')}
          placeholder="cole seu snippet aqui"
          className="w-full resize-y rounded-md bg-input p-3 font-mono text-sm text-surface placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <FormField
        id="post-tags"
        name="tags"
        label="Tags (separadas por vírgula)"
        placeholder="React, Hooks"
        value={values.tags}
        onChange={update('tags')}
      />

      <FormField
        id="post-thumbnail"
        name="thumbnail"
        label="URL da thumbnail (opcional)"
        placeholder="https://..."
        value={values.thumbnail}
        onChange={update('thumbnail')}
      />

      {error && (
        <p role="alert" className="text-sm text-foreground/90">
          {error}
        </p>
      )}

      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? submittingLabel : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

// Converte o formulário (tags como string CSV, thumbnail vazio como omitido)
// no payload que a API espera.
export function toApiPayload(values: PostFormValues) {
  const tags = values.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return {
    title: values.title,
    description: values.description,
    code: values.code,
    tags,
    ...(values.thumbnail.trim() ? { thumbnail: values.thumbnail.trim() } : {}),
  }
}
