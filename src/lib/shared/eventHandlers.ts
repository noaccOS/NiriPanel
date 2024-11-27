import { GtkWidget } from 'src/lib/types/widget.js';
import { Gdk } from 'astal/gtk3';
import { ThrottleFn } from '../types/utils';

/**
 * Connects a primary click handler and returns a disconnect function.
 */
export function connectPrimaryClick(
    widget: GtkWidget,
    handler: (self: GtkWidget, event: Gdk.Event) => void,
): () => void {
    const id = widget.connect('button-press-event', (self: GtkWidget, event: Gdk.Event) => {
        const eventButton = event.get_button()[1];
        if (eventButton === Gdk.BUTTON_PRIMARY) {
            handler(self, event);
        }
    });
    return () => widget.disconnect(id);
}

/**
 * Connects a secondary click handler and returns a disconnect function.
 */
export function connectSecondaryClick(
    widget: GtkWidget,
    handler: (self: GtkWidget, event: Gdk.Event) => void,
): () => void {
    const id = widget.connect('button-press-event', (self: GtkWidget, event: Gdk.Event) => {
        const eventButton = event.get_button()[1];
        if (eventButton === Gdk.BUTTON_SECONDARY) {
            handler(self, event);
        }
    });
    return () => widget.disconnect(id);
}

/**
 * Connects a middle click handler and returns a disconnect function.
 */
export function connectMiddleClick(
    widget: GtkWidget,
    handler: (self: GtkWidget, event: Gdk.Event) => void,
): () => void {
    const id = widget.connect('button-press-event', (self: GtkWidget, event: Gdk.Event) => {
        const eventButton = event.get_button()[1];
        if (eventButton === Gdk.BUTTON_MIDDLE) {
            handler(self, event);
        }
    });
    return () => widget.disconnect(id);
}

/**
 * Connects a scroll handler and returns a disconnect function.
 */
export function connectScroll(
    widget: GtkWidget,
    throttledHandler: ThrottleFn,
    scrollUpAction: string,
    scrollDownAction: string,
): () => void {
    const id = widget.connect('scroll-event', (self: GtkWidget, event: Gdk.Event) => {
        const eventDirection = event.get_scroll_direction()[1];
        if (eventDirection === Gdk.ScrollDirection.UP) {
            throttledHandler(scrollUpAction, { clicked: self, event });
        } else if (eventDirection === Gdk.ScrollDirection.DOWN) {
            throttledHandler(scrollDownAction, { clicked: self, event });
        }
    });
    return () => widget.disconnect(id);
}
