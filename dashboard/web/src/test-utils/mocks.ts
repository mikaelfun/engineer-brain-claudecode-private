/**
 * Mock factories for test data — reusable across all test files
 *
 * Usage:
 *   import { createMockCase, createMockSession } from '../test-utils'
 *   const case1 = createMockCase({ caseNumber: '2401010010000123' })
 */

/** Create a mock case object matching the API response shape */
export function createMockCase(overrides: Record<string, any> = {}) {
  return {
    caseNumber: '2401010010000001',
    title: 'Test Case — VM not starting',
    severity: 'B',
    status: 'Active',
    serviceId: 'Virtual Machines',
    supportAreaPath: 'Compute\\Virtual Machines\\Management',
    createdOn: '2026-03-01T08:00:00Z',
    modifiedOn: '2026-03-20T10:00:00Z',
    customer: 'Contoso Ltd',
    contactName: 'John Doe',
    contactEmail: 'john@contoso.com',
    assignedTo: 'Kun Fang',
    entitlement: 'Premier',
    hasInspection: false,
    hasTodo: false,
    hasMeta: false,
    ...overrides,
  }
}

/** Create a mock session badge status */
export function createMockSession(overrides: Record<string, any> = {}) {
  return {
    sessionId: 'sess-abcdef12-3456-7890-abcd-ef1234567890',
    status: 'active' as const,
    caseNumber: '2401010010000001',
    startedAt: '2026-03-20T10:00:00Z',
    ...overrides,
  }
}

/** Create a mock issue object */
export function createMockIssue(overrides: Record<string, any> = {}) {
  return {
    id: 'ISS-001',
    title: 'Test issue',
    description: 'A test issue description',
    type: 'bug',
    priority: 'P2',
    status: 'open',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    ...overrides,
  }
}

/** Create a mock todo item */
export function createMockTodo(overrides: Record<string, any> = {}) {
  return {
    caseNumber: '2401010010000001',
    filename: '260320-1000.md',
    content: '# Todo\n\n## 🔴 需人工决策\n- [ ] Review case\n\n## ✅ 仅通知\n- [x] Data refreshed',
    updatedAt: '2026-03-20T10:00:00Z',
    ...overrides,
  }
}
