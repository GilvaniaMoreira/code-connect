import { lazy, Suspense, useSyncExternalStore } from 'react'
import { getToken } from './lib/token'

const LoginPage = lazy(() =>
  import('./components/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const HomePage = lazy(() =>
  import('./components/pages/HomePage').then((m) => ({ default: m.HomePage })),
)

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHash = () => window.location.hash
const getServerHash = () => ''

function resolvePage(hash: string) {
  if (hash === '#/cadastro') return <SignupPage />
  if (hash === '#/inicio') {
    return getToken() ? <HomePage /> : <LoginPage />
  }
  return <LoginPage />
}

function App() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash)
  return <Suspense fallback={null}>{resolvePage(hash)}</Suspense>
}

export default App
