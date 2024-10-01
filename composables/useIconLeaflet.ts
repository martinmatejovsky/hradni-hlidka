import horseRiderIcon from "assets/icons/horse-rider.svg";

interface IconLeafletOptions {
    className?: string;
    label?: string;
    size?: [number, number];
}

export function useIconLeaflet(options: IconLeafletOptions = {}): L.DivIconOptions {
    const {
        className = 'h-rider-icon',
        label = 'Hráč',
    } = options;

    return {
        className: className,
        html: `<div class="h-icon-leaflet d-flex flex-column position-absolute align-center text-center">` +
            `<img class="h-icon-image h-rider-icon-image" alt="" src="${horseRiderIcon}"/>` +
            `<span class="h-rider-icon-description">${label}</span>` +
            `</div>`,
        iconSize: [0, 0],
    };
}