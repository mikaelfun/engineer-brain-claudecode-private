/**
 * errors.ts — Structured error classification utilities
 *
 * Provides AppError class with error categories, structured API response
 * formatting, factory functions, and classification of unknown errors.
 *
 * Error response shape:
 * {
 *   error: {
 *     code: "AUTH_TOKEN_EXPIRED",
 *     category: "auth",
 *     message: "Azure AD token expired",
 *     retryable: false,
 *     component: "kusto-query"
 *   }
 * }
 */


// ===== Error Categories =====

export type ErrorCategory =
  | 'auth'
  | 'validation'
  | 'not-found'
  | 'network'
  | 'timeout'
  | 'parse'
  | 'internal'
  | 'conflict'

/** HTTP status codes used by AppError — compatible with Hono's ContentfulStatusCode */
export type AppErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 500 | 502 | 504

export interface ErrorResponse {
  error: {
    code: string
    category: ErrorCategory
    message: string
    retryable: boolean
    component: string
  }
}


// ===== AppError Class =====

export class AppError extends Error {
  readonly code: string
  readonly category: ErrorCategory
  readonly retryable: boolean
  readonly component: string
  readonly statusCode: AppErrorStatusCode

  constructor(options: {
    code: string
    category: ErrorCategory
    message: string
    retryable: boolean
    component: string
    statusCode?: AppErrorStatusCode
    cause?: unknown
  }) {
    super(options.message)
    this.name = 'AppError'
    this.code = options.code
    this.category = options.category
    this.retryable = options.retryable
    this.component = options.component
    this.statusCode = options.statusCode ?? categoryToStatusCode(options.category)
    if (options.cause) {
      this.cause = options.cause
    }
  }

  /** Produce the structured API error response */
  toResponse(): ErrorResponse {
    return {
      error: {
        code: this.code,
        category: this.category,
        message: this.message,
        retryable: this.retryable,
        component: this.component,
      },
    }
  }
}


// ===== Type Guard =====

/** Check if an unknown value is an AppError instance */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}


// ===== Category → HTTP Status Code Mapping =====

function categoryToStatusCode(category: ErrorCategory): AppErrorStatusCode {
  switch (category) {
    case 'auth': return 401
    case 'validation': return 400
    case 'not-found': return 404
    case 'network': return 502
    case 'timeout': return 504
    case 'parse': return 422
    case 'internal': return 500
    case 'conflict': return 409
  }
}


// ===== Factory Functions =====

/** Create an auth-category error (401) */
export function createAuthError(message: string, component: string, code = 'AUTH_FAILED'): AppError {
  return new AppError({
    code,
    category: 'auth',
    message,
    retryable: false,
    component,
  })
}

/** Create a validation-category error (400) */
export function createValidationError(message: string, component: string, code = 'VALIDATION_FAILED'): AppError {
  return new AppError({
    code,
    category: 'validation',
    message,
    retryable: false,
    component,
  })
}

/** Create a not-found-category error (404) */
export function createNotFoundError(message: string, component: string, code = 'NOT_FOUND'): AppError {
  return new AppError({
    code,
    category: 'not-found',
    message,
    retryable: false,
    component,
  })
}

/** Create a network-category error (502) */
export function createNetworkError(message: string, component: string, code = 'NETWORK_ERROR'): AppError {
  return new AppError({
    code,
    category: 'network',
    message,
    retryable: true,
    component,
  })
}

/** Create a timeout-category error (504) */
export function createTimeoutError(message: string, component: string, code = 'TIMEOUT'): AppError {
  return new AppError({
    code,
    category: 'timeout',
    message,
    retryable: true,
    component,
  })
}

/** Create a parse-category error (422) */
export function createParseError(message: string, component: string, code = 'PARSE_ERROR'): AppError {
  return new AppError({
    code,
    category: 'parse',
    message,
    retryable: false,
    component,
  })
}

/** Create an internal-category error (500) */
export function createInternalError(message: string, component: string, code = 'INTERNAL_ERROR'): AppError {
  return new AppError({
    code,
    category: 'internal',
    message,
    retryable: false,
    component,
  })
}

/** Create a conflict-category error (409) */
export function createConflictError(message: string, component: string, code = 'CONFLICT'): AppError {
  return new AppError({
    code,
    category: 'conflict',
    message,
    retryable: true,
    component,
  })
}


// ===== Error Classification =====

/**
 * Classify an unknown caught error into an AppError.
 * Applies heuristics to categorize standard Error objects by inspecting
 * their message for known patterns (auth, timeout, network, etc.).
 *
 * @param err - The unknown thrown value
 * @param component - Component name for error attribution
 * @returns A properly categorized AppError
 */
export function classifyError(err: unknown, component: string): AppError {
  // Already an AppError — return as-is
  if (isAppError(err)) {
    return err
  }

  // Standard Error object — classify by message patterns
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()

    // Auth patterns
    if (msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'))) {
      return createAuthError(err.message, component, 'AUTH_TOKEN_EXPIRED')
    }
    if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('authentication')) {
      return createAuthError(err.message, component, 'AUTH_UNAUTHORIZED')
    }

    // Timeout patterns
    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('abort')) {
      return createTimeoutError(err.message, component, 'TIMEOUT')
    }

    // Network patterns
    if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('fetch failed') || msg.includes('network')) {
      return createNetworkError(err.message, component, 'NETWORK_ERROR')
    }

    // File not found patterns
    if (msg.includes('enoent') || msg.includes('no such file')) {
      return createNotFoundError(err.message, component, 'FILE_NOT_FOUND')
    }

    // Parse patterns
    if (msg.includes('json') && (msg.includes('parse') || msg.includes('syntax'))) {
      return createParseError(err.message, component, 'JSON_PARSE_ERROR')
    }
    if (msg.includes('unexpected token') || msg.includes('invalid format')) {
      return createParseError(err.message, component, 'PARSE_ERROR')
    }

    // Permission patterns
    if (msg.includes('eperm') || msg.includes('eacces') || msg.includes('permission denied')) {
      return createInternalError(err.message, component, 'PERMISSION_DENIED')
    }

    // Fallback: internal error preserving original message
    return new AppError({
      code: 'INTERNAL_ERROR',
      category: 'internal',
      message: err.message,
      retryable: false,
      component,
      cause: err,
    })
  }

  // String error
  if (typeof err === 'string') {
    return createInternalError(err, component, 'INTERNAL_ERROR')
  }

  // Unknown error shape
  return createInternalError('An unexpected error occurred', component, 'UNKNOWN_ERROR')
}
