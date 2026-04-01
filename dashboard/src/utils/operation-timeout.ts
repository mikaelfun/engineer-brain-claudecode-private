/**
 * operation-timeout.ts — Inactivity timeout wrapper for async generators
 *
 * Wraps an AsyncIterable and aborts via AbortController if no message
 * arrives within the configured inactivity window. Each yielded value
 * resets the timer, so only true silence triggers the abort.
 */


// ===== Constants =====

export const INACTIVITY_TIMEOUT_MS = 300_000 // 5 minutes


// ===== Inactivity Timeout Wrapper =====

/**
 * Wrap an async iterable with an inactivity timeout.
 * If no value is yielded within `timeoutMs`, the AbortController is aborted.
 * Each yielded value resets the inactivity timer.
 *
 * @param source - The async iterable to monitor
 * @param abortController - AbortController to signal on timeout
 * @param timeoutMs - Inactivity window in milliseconds (default: 5 minutes)
 * @param label - Optional label for log messages
 */
export async function* withInactivityTimeout<T>(
  source: AsyncIterable<T>,
  abortController: AbortController,
  timeoutMs: number = INACTIVITY_TIMEOUT_MS,
  label?: string,
): AsyncGenerator<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  function resetTimer() {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      console.warn(`[operation-timeout] Inactivity timeout triggered (${timeoutMs}ms)`, label ?? '')
      try { abortController.abort() } catch { /* ignore */ }
    }, timeoutMs)
  }

  try {
    resetTimer()

    for await (const value of source) {
      clearTimeout(timer!)
      yield value
      resetTimer()
    }

    // Normal completion
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  } catch (err: unknown) {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    console.error(`[operation-timeout] Wrapper caught error`, label ?? '', err)
    throw err
  }
}
