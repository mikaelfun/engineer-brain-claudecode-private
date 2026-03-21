/**
 * Custom render helper — wraps components with QueryClientProvider + MemoryRouter
 *
 * Usage:
 *   import { renderWithProviders, screen, userEvent } from '../test-utils'
 *   const user = userEvent.setup()
 *   renderWithProviders(<MyComponent />, { route: '/case/123' })
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 */
import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

export { screen, within, waitFor, act } from '@testing-library/react'
export { userEvent }

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route for MemoryRouter */
  route?: string
  /** MemoryRouter initialEntries */
  initialEntries?: MemoryRouterProps['initialEntries']
  /** Custom QueryClient (defaults to a test-friendly one) */
  queryClient?: QueryClient
}

/** Create a QueryClient configured for testing (no retries, no refetch) */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Render a component wrapped with QueryClientProvider + MemoryRouter.
 * Returns the render result plus the queryClient instance for inspection.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    route = '/',
    initialEntries,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options

  const entries = initialEntries ?? [route]

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={entries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions })

  return {
    ...result,
    queryClient,
  }
}
