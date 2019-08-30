import {RefObject} from "react";

export function insertTextInHtmlRefAndSetCarret(ref: RefObject<HTMLElement>, text: string) {
    const ele = ref.current;

    ele.innerHTML = text;

    // More the caret of the input div to the last position
    const rng = document.createRange();
    const sel = window.getSelection();
    if (ele.innerHTML.length !== 0) {
        rng.setStart(ele.childNodes[0], ele.innerHTML.length);
    }
    rng.collapse(true);
    sel.removeAllRanges();
    sel.addRange(rng);
    ele.focus();

    // Call that the input changed so it rerenders the predictions
    const event = new Event('input', {bubbles: true});
    ele.dispatchEvent(event);
}

