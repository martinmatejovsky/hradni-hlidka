import {WeaponAbility, WeaponType} from '~/types/CustomTypes';

export const useEvaluateWeaponAbility = (weapon: WeaponType): WeaponAbility => ({
  perkSharpSword: weapon === WeaponType.SWORD,
  perkBoilingOil: weapon === WeaponType.SWORD || weapon === WeaponType.CANON,
  canDefeatInvaders: weapon === WeaponType.SWORD,
  canBombardAssemblyArea: weapon === WeaponType.CANON,
});