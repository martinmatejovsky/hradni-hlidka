import type {Invader} from "~/types/CustomTypes";

export function useFilterInvadersAssembled (invaders: Invader[]): Invader[] {
    return invaders.filter(invader => invader.assembleArea !== null)
}

export function useFilterInvadersOnLadder (invaders: Invader[]): Invader[] {
    return invaders.filter(invader => invader.ladderStep !== null)
}
