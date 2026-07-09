import { LoginForm } from '../../organisms/LoginForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout banner={{ src: '/banner.png', alt: 'Ilustração Code Connect' }}>
      <LoginForm />
    </AuthLayout>
  )
}
