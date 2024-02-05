import {GameLocationsAll} from "~/data/gameLocationsAll";
import type {GameLocation} from "~/types/CustomTypes";

export default defineEventHandler((): GameLocation[] => {
    return GameLocationsAll
})