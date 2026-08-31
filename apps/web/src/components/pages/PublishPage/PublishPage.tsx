import { useNavigate } from 'react-router-dom'
import { extractApiError } from '../../../services/auth'
import { createPost } from '../../../services/posts'
import { PostForm, toApiPayload, type PostFormValues } from '../../organisms/PostForm'
import { AppLayout } from '../../templates/AppLayout'

export function PublishPage() {
  const navigate = useNavigate()

  const handleSubmit = async (values: PostFormValues) => {
    try {
      const created = await createPost(toApiPayload(values))
      navigate(`/post/${created.slug}`)
    } catch (err) {
      throw new Error(extractApiError(err, 'Não foi possível publicar o post.'))
    }
  }

  return (
    <AppLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Publicar</h1>
        <p className="text-base text-foreground/90">
          Compartilhe um snippet com a comunidade.
        </p>
      </header>

      <PostForm
        submitLabel="Publicar"
        submittingLabel="Publicando..."
        onSubmit={handleSubmit}
        onCancel={() => navigate('/feed')}
      />
    </AppLayout>
  )
}
