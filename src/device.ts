const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const small = typeof window !== 'undefined' && Math.max(window.screen.width, window.screen.height) < 1100

export const LOW_POWER = !q.has('hq') && (q.has('lite') || coarse || small)
