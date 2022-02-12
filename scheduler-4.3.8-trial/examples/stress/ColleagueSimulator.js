import StringHelper from '../../lib/Core/helper/StringHelper.js';
import DateHelper from '../../lib/Core/helper/DateHelper.js';
import Toast from '../../lib/Core/widget/Toast.js';
import DataGenerator from '../../lib/Core/helper/util/DataGenerator.js';

const
    generator      = DataGenerator.generate(1000),
    actionInterval = 10000,
    eventNames     = [
        'Feed the ducks',
        'Zoom meeting',
        'Customer call',
        'Sales campaign',
        'Server maintenance',
        'Replace IE with Chrome',
        'Install anti-virus',
        'Water flowers',
        'Fly to Vegas',
        'Book meeting room',
        'Get vaccinated',
        'Buy Covid masks 50-pack',
        'Cancel Netflix subscription'
    ];

export default class ColleagueSimulator {
    constructor(config) {
        Object.assign(this, config);

        this.eventStore.on({
            change  : 'onEventStoreChange',
            thisObj : this
        });

        this.resourceStore.on({
            change  : 'onResourceStoreChange',
            thisObj : this
        });

        this.scheduler.element.addEventListener('animationend', ({ target, animationName }) => {
            if (animationName === 'slideout') {
                delete target.dataset.editMessage;
            }
        });

        this.nbrOfColleagues = config.nbrOfColleagues;
    }

    start() {
        this.stop();
        this.timer = setInterval(this.randomChange.bind(this), this.interval);
    }

    stop() {
        clearTimeout(this.timer);
    }

    get interval() {
        return this._interval;
    }

    set interval(value) {
        this._interval = value;
        this.start();
    }

    set nbrOfColleagues(value) {
        this.interval = actionInterval / value;
    }

    randomChange() {
        const
            me         = this,
            eventStore = me.eventStore,
            index      = Math.round(Math.random() * eventStore.count),
            record     = eventStore.getAt(index) || eventStore.last;

        let changeType = Math.round(Math.random() * 7);

        if (!me.resourceStore.count) {
            changeType = 3;
        }
        else if (!record) {
            changeType = 2;
        }

        switch (changeType) {
            case 0:
                return me.shift(record);

            case 1:
                return me.changeName(record);

            case 2:
                return me.addEvent();

            case 3:
                return me.addResource();

            case 4:
                return Math.round() > 0.5 && me.removeResource();

            case 5:
                return me.changeDuration(record);

            case 6:
                return me.reassignEvent(record);

            case 7:
                return Math.round() > 0.5 && me.removeEvent(record);
        }
    }

    shift(event) {
        event.shift(Math.round() > 0.5 ? 1 : -1);
    }

    changeName(event) {
        event.name = this.getRandomEventName();
    }

    removeEvent(event) {
        event.remove();
    }

    addEvent() {
        const startDate = DateHelper.add(this.startDate, Math.round(Math.random() * 6), 'h');

        this.eventStore.add({
            name         : this.getRandomEventName(),
            resourceId   : this.resourceStore.getAt(Math.round(Math.random() * (this.resourceStore.count - 1))).id,
            startDate,
            endDate      : DateHelper.add(startDate, 2, 'h'),
            duration     : 2,
            durationUnit : 'h'
        });
    }

    addResource() {
        const next = generator.next();
        this.resourceStore.add(next.value);
    }

    changeDuration(event) {
        const sign = event.duration > 1 && Math.round() > 0.5 ? -1 : 1;
        event.endDate = DateHelper.add(event.endDate, 1 * sign, event.durationUnit);
    }

    removeResource() {
        this.resourceStore.last?.remove();
    }

    reassignEvent(event) {
        const
            otherResources = this.resourceStore.getRange().filter(r => r !== event.resource),
            newResource    = otherResources[Math.floor(Math.random() * otherResources.length)];

        if (newResource !== event.resource) {
            this.eventStore.assignEventToResource(event, newResource);
        }
    }

    getRandomEventName() {
        return eventNames[Math.round(Math.random() * eventNames.length - 1)];
    }

    getRandomResourceName() {
        return StringHelper.encodeHtml(this.resourceStore.getAt(Math.round(Math.random() * this.resourceStore.count))?.name || 'Mystery man');
    }

    async onResourceStoreChange({ source, action, record, records }) {
        switch (action) {
            case 'remove':
            case 'add': {
                Toast.show({
                    html    : `${this.getRandomResourceName()} ${action + (action === 'remove' ? 'd' : 'ed')} <strong>${StringHelper.encodeHtml(records[0].name)}</strong>`,
                    timeout : Math.max(500, this.interval)
                });

                break;
            }
        }
    }

    async onEventStoreChange({ source, action, record, records }) {
        switch (action) {
            case 'remove': {
                Toast.show({
                    html    : `${this.getRandomResourceName()} deleted task <strong>${StringHelper.encodeHtml(records[0].name)}</strong>`,
                    timeout : Math.max(500, this.interval)
                });

                break;
            }

            case 'update':
            case 'add': {
                record = record || records[0];

                const eventBar = this.scheduler.getElementFromEventRecord(record);

                if (eventBar) {
                    eventBar.parentElement.dataset.editMessage = `${StringHelper.capitalize(action)} by ${this.getRandomResourceName()}`;
                }

                break;
            }
        }
    }
}
