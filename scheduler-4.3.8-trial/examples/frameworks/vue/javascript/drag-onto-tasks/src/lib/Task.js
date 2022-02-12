/**
 * Custom Task model
 *
 * taken from the vanilla example
 */
import { EventModel } from '@bryntum/scheduler';

export default class Task extends EventModel {
    static get defaults() {
        return {
            // in this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',
            equipment    : []
        };
    }
}
