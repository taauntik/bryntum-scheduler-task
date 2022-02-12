import ResourceModel from '../../../lib/Scheduler/model/ResourceModel.js';

export default class Employee extends ResourceModel {
    static get fields() {
        return [
            { name : 'available', type : 'boolean', defaultValue : true },
            { name : 'statusMessage', defaultValue : 'Gone fishing' }
        ];
    }

    get cls() {
        return this.available ? '' : 'unavailable';
    }
}
