import { LoginForm } from '../../organisms/LoginForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout
      banner={{
        webp: '/banner.webp',
        fallback: '/banner.png',
        alt: 'Ilustração Code Connect',
        width: 407,
        height: 636,
      }}
    >
      <LoginForm />
    </AuthLayout>
  )
}
