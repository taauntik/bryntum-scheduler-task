/**
 * Actions script
 */
import { Action } from '@ngrx/store';

// action names (add your names here)
export const BAR_MARGIN_CHANGE = 'BAR_MARGIN_CHANGE';

// actions (add you actions here)
export class BarMarginChange implements Action {

    readonly type = BAR_MARGIN_CHANGE;

    constructor(public payload: number) {
    }

}


