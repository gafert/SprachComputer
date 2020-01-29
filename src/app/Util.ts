import {RefObject} from "react";
import insertText from 'insert-text-textarea';
import fitTextarea from "fit-textarea";

export function insertTextInHtml(ref: RefObject<HTMLTextAreaElement>, text: string, full?: boolean) {
    const ele = ref.current;

    if(full) {
        ele.select(); // The text needs to be selected so it will be replaced
    }

    insertText(ele, text);
    fitTextarea(ele);

    // Call that the input changed so it rerenders the predictions
    const event = new Event('input', {bubbles: true});
    ele.dispatchEvent(event);
}

