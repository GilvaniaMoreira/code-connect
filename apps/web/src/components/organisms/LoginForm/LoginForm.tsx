import { useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button'
import { FormField } from '../../molecules/FormField'
import { RememberForgot } from '../../molecules/RememberForgot'
import { SignupCTA } from '../../molecules/SignupCTA'
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

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrarMe, setLembrarMe] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log({ email, senha, lembrarMe })
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Login</h1>
        <p className="text-base text-white/90">Boas-vindas! Faça seu login.</p>
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

        <Button type="submit" icon={<ArrowRightIcon />} className="mt-2 w-full">
          Login
        </Button>
      </form>

      <SocialLoginGroup />

      <SignupCTA
        question="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        href="#"
      />
    </div>
  )
}
