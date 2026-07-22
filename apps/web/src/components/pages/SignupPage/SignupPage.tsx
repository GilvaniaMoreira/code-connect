import { SignupForm } from '../../organisms/SignupForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function SignupPage() {
  return (
    <AuthLayout
      banner={{ src: '/signup-banner.png', alt: 'Ilustração Code Connect' }}
    >
      <SignupForm />
    </AuthLayout>
  )
}
