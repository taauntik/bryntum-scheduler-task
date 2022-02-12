/**
 * Custom task model
 *
 * Taken from the vanilla example
 */
import { EventModel } from '@bryntum/scheduler/scheduler.umd';

export default class Task extends EventModel {
    static get defaults() {
        return {
            // in this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',
            equipment    : []
        };
    }
}
