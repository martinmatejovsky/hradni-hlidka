import mitt from 'mitt'

type ApplicationEvents = {
    'updateLiveOfInvaders': Boolean
};

const emitter = mitt<ApplicationEvents>()

export const useEventBus = emitter.emit
export const useListenBus = emitter.on
