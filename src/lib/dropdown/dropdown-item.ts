import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    ViewEncapsulation,
    Inject,
    Optional
} from '@angular/core';
import { IFocusableOption, FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import {
    CanDisable, CanDisableCtor,
    mixinDisabled
} from '@ptsecurity/mosaic/core';

import { MC_DROPDOWN_PANEL, McDropdownPanel } from './dropdown-panel';


// Boilerplate for applying mixins to McDropdownItem.
/** @docs-private */
export class McDropdownItemBase {}
export const _McDropdownItemMixinBase: CanDisableCtor & typeof McDropdownItemBase =
    mixinDisabled(McDropdownItemBase);

/**
 * This directive is intended to be used inside an mc-dropdown tag.
 * It exists mostly to set the role attribute.
 */
@Component({
    selector: 'mc-dropdown-item, [mc-dropdown-item]',
    exportAs: 'mcDropdownItem',
    inputs: ['disabled'],
    host: {
        role: 'dropdown-item',
        class: 'mc-dropdown__item',
        '[attr.tabindex]': '_getTabIndex()',
        '[attr.disabled]': 'disabled || null',
        '(click)': '_checkDisabled($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `<ng-content></ng-content>`
})
export class McDropdownItem extends _McDropdownItemMixinBase
    implements IFocusableOption, CanDisable, OnDestroy {

    private _document: Document;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        @Inject(DOCUMENT) document: any,
        private _focusMonitor: FocusMonitor,
        @Inject(MC_DROPDOWN_PANEL) @Optional() private _parentDropdownPanel?: McDropdownPanel<McDropdownItem>) {
        super();

        if (_focusMonitor) {
            // Start monitoring the element so it gets the appropriate focused classes. We want
            // to show the focus style for dropdown items only when the focus was not caused by a
            // mouse or touch interaction.
            _focusMonitor.monitor(this._elementRef.nativeElement, false);
        }

        if (_parentDropdownPanel && _parentDropdownPanel.addItem) {
            _parentDropdownPanel.addItem(this);
        }

        this._document = document;
    }

    /** Focuses the dropdown item. */
    focus(origin: FocusOrigin = 'program'): void {
        if (this._focusMonitor) {
            this._focusMonitor.focusVia(this._getHostElement(), origin);
        } else {
            this._getHostElement().focus();
        }
    }

    ngOnDestroy() {
        if (this._focusMonitor) {
            this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
        }

        if (this._parentDropdownPanel && this._parentDropdownPanel.removeItem) {
            this._parentDropdownPanel.removeItem(this);
        }
    }

    /** Used to set the `tabindex`. */
    _getTabIndex(): string {
        return this.disabled ? '-1' : '0';
    }

    /** Returns the host DOM element. */
    _getHostElement(): HTMLElement {
        return this._elementRef.nativeElement;
    }

    /** Prevents the default element actions if it is disabled. */
    _checkDisabled(event: Event): void {
        if (this.disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    /** Gets the label to be used when determining whether the option should be focused. */
    getLabel(): string {
        const element: HTMLElement = this._elementRef.nativeElement;
        // tslint:disable-next-line:no-magic-numbers
        const textNodeType = this._document ? this._document.TEXT_NODE : 3;
        let output = '';

        if (element.childNodes) {
            const length = element.childNodes.length;

            // Go through all the top-level text nodes and extract their text.
            // We skip anything that's not a text node to prevent the text from
            // being thrown off by something like an icon.
            for (let i = 0; i < length; i++) {
                if (element.childNodes[i].nodeType === textNodeType) {
                    output += element.childNodes[i].textContent;
                }
            }
        }

        return output.trim();
    }
}
