import type {WeaponAbility} from '~/types/CustomTypes';
import {WeaponType} from '~/types/CustomTypes';

export const useEvaluateWeaponAbility = (weapon: WeaponType): WeaponAbility => ({
  perkSharpSword: weapon === WeaponType.SWORD,
  perkBoilingOil: weapon === WeaponType.SWORD || weapon === WeaponType.CANNON || weapon === WeaponType.NONE,
  canDefeatInvaders: weapon === WeaponType.SWORD || weapon === WeaponType.NONE,
  canBombardAssemblyArea: weapon === WeaponType.CANNON,
});

export const canUseSmithyPerks = (weapon: WeaponType): boolean => {
  return (
    useEvaluateWeaponAbility(weapon).perkSharpSword ||
    useEvaluateWeaponAbility(weapon).perkBoilingOil
  )
}