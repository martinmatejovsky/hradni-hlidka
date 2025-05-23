import horseRiderIcon from "assets/icons/horse-rider.svg";
import cauldronEmptyIcon from "assets/icons/cauldron-empty.svg";
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
import oilBlobIcon from "assets/icons/oil-blob.svg";
import defenderNoWeaponMe from "assets/icons/defender-no-weapon-me.svg";
import defenderNoWeaponOther from "assets/icons/defender-no-weapon-other.svg";
import defenderSwordsmanMe from "assets/icons/defender-swordsman-me.svg";
import defenderSwordsmanOther from "assets/icons/defender-swordsman-other.svg";
import defenderCannonMe from "assets/icons/defender-cannon-me.svg";
import defenderCannonOther from "assets/icons/defender-cannon-other.svg";
import invaderStandard1 from "assets/icons/invader-regular-1.svg";
import invaderStandard2 from "assets/icons/invader-regular-2.svg";
import invaderStandard3 from "assets/icons/invader-regular-3.svg";
import invaderCaptain from "assets/icons/invader-captain.svg";

interface IconLeafletOptions {
    icon?: string;
    className?: string;
    label?: string;
    size?: [number, number];
    progress?: number;
}

export function useIconLeaflet(options: IconLeafletOptions = {}): L.DivIconOptions {
    const iconMap: Record<string, { src: string; defaultClass: string }> = {
        "horse-rider": { src: horseRiderIcon, defaultClass: "hh-rider-icon" },
        "cauldron-empty": { src: cauldronEmptyIcon, defaultClass: "hh-cauldron-empty" },
        "cauldron-full": { src: cauldronFullIcon, defaultClass: "hh-cauldron-full" },
        "oil-blob": { src: oilBlobIcon, defaultClass: "hh-oil-blob" },
        "defender-no-weapon-me": { src: defenderNoWeaponMe, defaultClass: "hh-defender-no-weapon" },
        "defender-no-weapon-other": { src: defenderNoWeaponOther, defaultClass: "hh-defender-no-weapon" },
        "defender-swordsman-me": { src: defenderSwordsmanMe, defaultClass: "hh-defender-swordsman" },
        "defender-swordsman-other": { src: defenderSwordsmanOther, defaultClass: "hh-defender-swordsman" },
        "defender-cannon-me": { src: defenderCannonMe, defaultClass: "hh-defender-cannon" },
        "defender-cannon-other": { src: defenderCannonOther, defaultClass: "hh-defender-cannon" },
        "invader-regular-1": { src: invaderStandard1, defaultClass: "hh-invader-regular" },
        "invader-regular-2": { src: invaderStandard2, defaultClass: "hh-invader-regular" },
        "invader-regular-3": { src: invaderStandard3, defaultClass: "hh-invader-regular" },
        "invader-captain": { src: invaderCaptain, defaultClass: "hh-invader-captain" },
    };

    const selectedIcon = iconMap[options.icon || "horse-rider"]; // Default to horse-rider
    const {
        className = selectedIcon.defaultClass,
        label = "",
    } = options;

    return {
        className: "",
        html: `<div class="hh-icon-leaflet d-flex flex-column position-absolute align-center text-center">
                 <img class="hh-icon-image ${className}-image" alt="" src="${selectedIcon.src}"/>
                 ${options.progress !== undefined
            ? `<div class="hh-progress-bar-container">
                <div class="hh-progress-bar" style="width: ${options.progress}%;"></div>
              </div>`
            : ''}
                 ${label.length ? `<span class="${className}-description">${label}</span>` : ''}
               </div>`,
        iconSize: options.size || [10, 10],
    };
}