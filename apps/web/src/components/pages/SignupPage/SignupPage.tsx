import { SignupForm } from '../../organisms/SignupForm'
import { AuthLayout } from '../../templates/AuthLayout'

export function SignupPage() {
  return (
    <AuthLayout
      banner={{
        webp: '/signup-banner.webp',
        fallback: '/signup-banner.png',
        alt: 'Ilustração Code Connect',
        width: 900,
        height: 600,
      }}
    >
      <SignupForm />
    </AuthLayout>
  )
}
