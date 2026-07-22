import { lazy, Suspense, useSyncExternalStore } from 'react'

const LoginPage = lazy(() =>
  import('./components/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
)

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHash = () => window.location.hash
const getServerHash = () => ''

function App() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash)
  return (
    <Suspense fallback={null}>
      {hash === '#/cadastro' ? <SignupPage /> : <LoginPage />}
    </Suspense>
  )
}

export default App
