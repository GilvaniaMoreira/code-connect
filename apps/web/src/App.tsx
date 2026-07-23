import { lazy, Suspense, useSyncExternalStore } from 'react'
import { getToken } from './lib/token'

const LoginPage = lazy(() =>
  import('./components/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/pages/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const FeedPage = lazy(() =>
  import('./components/pages/FeedPage').then((m) => ({ default: m.FeedPage })),
)
const PostDetailPage = lazy(() =>
  import('./components/pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })),
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
  if (hash === '' || hash === '#' || hash === '#/' || hash === '#/feed') {
    return <FeedPage />
  }
  if (hash.startsWith('#/post/')) {
    const slug = decodeURIComponent(hash.slice('#/post/'.length))
    if (slug) return <PostDetailPage slug={slug} />
    return <FeedPage />
  }
  if (hash === '#/login') return <LoginPage />
  if (hash === '#/cadastro') return <SignupPage />
  if (hash === '#/inicio') {
    return getToken() ? <HomePage /> : <LoginPage />
  }
  return <FeedPage />
}

function App() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash)
  return <Suspense fallback={null}>{resolvePage(hash)}</Suspense>
}

export default App
