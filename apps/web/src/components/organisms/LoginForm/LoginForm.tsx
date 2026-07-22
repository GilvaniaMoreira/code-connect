import { useState, type FormEvent } from 'react'
import { extractApiError, login } from '../../../services/auth'
import { setToken } from '../../../lib/token'
import { Button } from '../../atoms/Button'
import { AuthCTA } from '../../molecules/AuthCTA'
import { FormField } from '../../molecules/FormField'
import { RememberForgot } from '../../molecules/RememberForgot'
import { SocialLoginGroup } from '../../molecules/SocialLoginGroup'

const ArrowRightIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

const ClipboardIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    className="h-4 w-4"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
)

export type LoginFormProps = {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps = {}) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrarMe, setLembrarMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const { access_token } = await login({ email, senha })
      setToken(access_token, lembrarMe)
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.hash = '#/feed'
      }
    } catch (err) {
      setError(extractApiError(err, 'Não foi possível fazer login. Verifique suas credenciais.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Login</h1>
        <p className="text-base text-foreground/90">Boas-vindas! Faça seu login.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          id="email"
          name="email"
          label="Email ou usuário"
          placeholder="usuario123"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <FormField
          id="senha"
          name="senha"
          type="password"
          label="Senha"
          placeholder="******"
          autoComplete="current-password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />

        <RememberForgot
          checked={lembrarMe}
          onChange={(event) => setLembrarMe(event.target.checked)}
          forgotHref="#"
        />

        {error && (
          <p role="alert" className="text-sm text-foreground/90">
            {error}
          </p>
        )}

        <Button
          type="submit"
          icon={<ArrowRightIcon />}
          className="mt-2 w-full"
          disabled={submitting}
        >
          {submitting ? 'Entrando...' : 'Login'}
        </Button>
      </form>

      <SocialLoginGroup />

      <AuthCTA
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        href="#/cadastro"
        icon={<ClipboardIcon />}
      />
    </div>
  )
}
