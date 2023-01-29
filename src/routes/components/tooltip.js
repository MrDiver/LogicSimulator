import Tooltip from './Tooltip.svelte';


export function genTooltip(...args) {
    let tmp = [];
    for (let x of args) {
        tmp.push('"' + x + '"');
    }
    return "[" + tmp.toString() + "]";
}

export const tooltip = (el) => {

    let tooltipText, tooltipComponent;

    const addTooltip = () => {
        tooltipText = el.getAttribute('data-tooltip');
        tooltipText = JSON.parse(tooltipText);

        tooltipComponent = new Tooltip({
            target: document.body,
            props: {
                tooltipText,
                xAxis: 0,
                yAxis: 0
            }
        });

        const tooltipDiv = document.querySelectorAll('.tooltip');
        let parentCoords = el.getBoundingClientRect();

        tooltipDiv.forEach((i) => {
            if (el.offsetWidth === undefined) {
                el.offsetWidth = 0;
            }

            let top = parseInt(parentCoords.top + parentCoords.bottom) / 2 + window.scrollY - i.offsetHeight - 10;
            let center = parentCoords.left + window.scrollX + (el.offsetWidth - i.offsetWidth) / 2 + parentCoords.width / 2 - 2;

            tooltipComponent.$set({
                xAxis: center,
                yAxis: top
            });
        });

    }

    const removeTooltip = () => {
        tooltipComponent.$destroy();
    }

    el.addEventListener('mouseover', addTooltip);
    el.addEventListener('mouseout', removeTooltip);

    return {
        destroy() {
            el.removeEventListener('mouseover', addTooltip);
            el.removeEventListener('mouseout', removeTooltip);
        }
    }
}

