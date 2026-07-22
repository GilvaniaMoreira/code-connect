import { useSyncExternalStore } from 'react'
import { LoginPage } from './components/pages/LoginPage'
import { SignupPage } from './components/pages/SignupPage'

const subscribe = (callback: () => void) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHash = () => window.location.hash
const getServerHash = () => ''

function App() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash)
  return hash === '#/cadastro' ? <SignupPage /> : <LoginPage />
}

export default App
