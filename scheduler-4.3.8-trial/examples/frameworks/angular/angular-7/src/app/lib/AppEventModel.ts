import { EventModel, EventModelConfig } from '@bryntum/scheduler/scheduler.lite.umd.js';

type AppEventModelConfig = EventModelConfig & {
    desc: string
    eventType: string
    eventColor: string
}

export default class AppEventModel extends EventModel {

    static get $name(): string {
        return 'AppEventModel';
    }

    static get fields() : object[] {
        return [
            { name : 'desc' },
            { name : 'eventType' },
            { name : 'eventColor' }
        ];
    }

    public desc: string
    public eventType: string
    public eventColor: string

    constructor(config: Partial<AppEventModelConfig>) {
        super(config);
    }

}
