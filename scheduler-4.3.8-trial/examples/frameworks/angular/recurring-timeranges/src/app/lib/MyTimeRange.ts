import { RecurringTimeSpan, TimeSpan, RecurringTimeSpansMixin, Store } from '@bryntum/scheduler/scheduler.lite.umd.js';

// Define a new Model extending TimeSpan class
// with RecurringTimeSpan mixin which adds recurrence support
export class MyTimeRange extends RecurringTimeSpan(TimeSpan) {}

// Define a new store extending the Store class
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain time ranges.
export class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {
    static get defaultConfig(): object {
        return {
            // use our new MyTimeRange model
            modelClass : MyTimeRange,
            storeId    : 'timeRanges'
        };
    }
}
