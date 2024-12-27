import mitt from 'mitt'
import type {MittEvents} from "~/types/CustomTypes";

const emitter = mitt<MittEvents>()

export const useEventBus = emitter.emit
export const useListenBus = emitter.on
