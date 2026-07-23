import { useState, type FormEvent } from 'react'
import { extractApiError, login, register } from '../../../services/auth'
import { setToken } from '../../../lib/token'
import { Button } from '../../atoms/Button'
import { Checkbox } from '../../atoms/Checkbox'
import { AuthCTA } from '../../molecules/AuthCTA'
import { FormField } from '../../molecules/FormField'
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

const LoginIcon = () => (
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
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
)

export type SignupFormProps = {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps = {}) {
  const [nome, setNome] = useState('')
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
      await register({ nome, email, senha })
      const { access_token } = await login({ email, senha })
      setToken(access_token, lembrarMe)
      if (onSuccess) {
        onSuccess()
      } else {
        window.location.hash = '#/feed'
      }
    } catch (err) {
      setError(extractApiError(err, 'Não foi possível concluir o cadastro. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Cadastro</h1>
        <p className="text-base text-foreground/90">Olá! Preencha seus dados.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          id="nome"
          name="nome"
          label="Nome"
          placeholder="Nome completo"
          autoComplete="name"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
        />

        <FormField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Digite seu email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <FormField
          id="senha"
          name="senha"
          type="password"
          label="Senha"
          placeholder="******"
          autoComplete="new-password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />

        <Checkbox
          id="lembrar-me"
          checked={lembrarMe}
          onChange={(event) => setLembrarMe(event.target.checked)}
        >
          Lembrar-me
        </Checkbox>

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
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>

      <SocialLoginGroup />

      <AuthCTA
        question="Já tem conta?"
        linkText="Faça seu login!"
        href="#/login"
        icon={<LoginIcon />}
      />
    </div>
  )
}
