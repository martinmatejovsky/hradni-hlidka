import mitt from 'mitt'

const emitter = mitt()

export const useEventBus = emitter.emit
export const useListenBus = emitter.on
