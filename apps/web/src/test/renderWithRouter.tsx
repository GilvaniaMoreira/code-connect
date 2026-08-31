import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

type RenderWithRouterOptions = Omit<RenderOptions, 'wrapper'> & {
  route?: string
  path?: string
}

// Renders a component under a MemoryRouter. Pass `path` when the component
// depends on route params (via useParams); otherwise the initial `route`
// is enough.
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', path, ...options }: RenderWithRouterOptions = {},
): RenderResult {
  const element = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  )
  return render(<MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>, options)
}
