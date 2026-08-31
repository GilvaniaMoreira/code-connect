import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useIsAuthenticated } from './lib/session'

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
  import('./components/pages/PostDetailPage').then((m) => ({
    default: m.PostDetailPage,
  })),
)
const HomePage = lazy(() =>
  import('./components/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const PublishPage = lazy(() =>
  import('./components/pages/PublishPage').then((m) => ({ default: m.PublishPage })),
)
const EditPostPage = lazy(() =>
  import('./components/pages/EditPostPage').then((m) => ({ default: m.EditPostPage })),
)
const ProfilePage = lazy(() =>
  import('./components/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

function RequireAuth({ children }: Readonly<{ children: React.ReactElement }>) {
  const isAuthenticated = useIsAuthenticated()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route
            path="/post/:slug/editar"
            element={
              <RequireAuth>
                <EditPostPage />
              </RequireAuth>
            }
          />
          <Route
            path="/publicar"
            element={
              <RequireAuth>
                <PublishPage />
              </RequireAuth>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<SignupPage />} />
          <Route
            path="/inicio"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
