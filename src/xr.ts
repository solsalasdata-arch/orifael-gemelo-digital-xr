import { createXRStore } from '@react-three/xr'

export const xrStore = createXRStore({
  emulate: import.meta.env.DEV ? 'metaQuest3' : false,
  offerSession: false,
})
