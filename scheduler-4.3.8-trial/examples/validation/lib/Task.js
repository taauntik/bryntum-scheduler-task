import EventModel from '../../../lib/Scheduler/model/EventModel.js';

export default class Task extends EventModel {
    static get fields() {
        return ['type'];
    }

    get dragValidationText() {
        const { resource, type } = this;

        let result = '';

        switch (type) {
            case 'Golf':
                result = 'Only C-suite people can play Golf';
                break;
            case 'Meeting':
                result = `Only ${resource.role} can participate in meetings`;
                break;
            case 'Coding':
                result = `Only ${resource.role} can do coding`;
                break;
            case 'Sales':
                result = `Only ${resource.role} can prepare marketing strategies`;
                break;
            case 'Fixed':
                result = 'Fixed time event - may be reassigned, but not rescheduled';
                break;
        }

        return result;
    }

    get resizeValidationText() {
        let result = '';

        switch (this.type) {
            case 'Golf':
                result = 'Golf game has always fixed duration';
                break;
            case 'Coding':
                result = 'Programming task duration cannot be shortened';
                break;
        }

        return result;
    }
}
