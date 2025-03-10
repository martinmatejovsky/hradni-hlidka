import horseRiderIcon from "assets/icons/horse-rider.svg";
import cauldronEmptyIcon from "assets/icons/cauldron-empty.svg";
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
import defenderSwordsmanMe from "assets/icons/defender-swordsman-me.svg";
import defenderSwordsmanOther from "assets/icons/defender-swordsman-other.svg";
import invaderStandard from "assets/icons/invader-regular.svg";
import invaderCaptain from "assets/icons/invader-captain.svg";

interface IconLeafletOptions {
    icon?: "horse-rider"
        | "cauldron-empty"
        | "cauldron-full"
        | "defender-swordsman-me"
        | "defender-swordsman-other"
        | "invader-regular"
        | "invader-captain";
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
        "defender-swordsman-me": { src: defenderSwordsmanMe, defaultClass: "hh-defender-swordsman" },
        "defender-swordsman-other": { src: defenderSwordsmanOther, defaultClass: "hh-defender-swordsman" },
        "invader-regular": { src: invaderStandard, defaultClass: "hh-invader-regular" },
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
                 <img class="h-icon-image ${className}-image" alt="" src="${selectedIcon.src}"/>
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