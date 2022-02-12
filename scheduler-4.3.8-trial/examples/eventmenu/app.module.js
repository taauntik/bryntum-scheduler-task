import { Scheduler, DateHelper, AjaxHelper, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const scheduler = new Scheduler({
    appendTo          : 'container',
    startDate         : new Date(2019, 0, 1, 6),
    endDate           : new Date(2019, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    rowHeight         : 50,
    barMargin         : 5,
    eventColor        : 'cyan',
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],

    eventStore : {
        // Additional fields added to EventModel
        fields : ['done', 'canceled', 'locked']
    },

    features : {
        eventMenu : {
            items : {
                // Add extra items shown for each event
                move : {
                    text   : 'Move event',
                    icon   : 'b-fa b-fa-fw b-fa-arrows-alt-h',
                    cls    : 'b-separator',
                    weight : 510,
                    // Add submenu
                    menu   : {
                        // Submenu items
                        moveLeft : {
                            text   : 'Move left',
                            icon   : 'b-fa b-fa-fw b-fa-arrow-left',
                            cls    : 'b-separator',
                            weight : 511,
                            onItem({ eventRecord }) {
                                eventRecord.startDate = DateHelper.add(eventRecord.startDate, -1, 'hour');
                            }
                        },
                        moveRight : {
                            text   : 'Move right',
                            icon   : 'b-fa b-fa-fw b-fa-arrow-right',
                            weight : 512,
                            onItem({ eventRecord }) {
                                eventRecord.startDate = DateHelper.add(eventRecord.startDate, 1, 'hour');
                            }
                        }
                    }
                },
                split : {
                    text   : 'Split',
                    icon   : 'b-fa b-fa-fw b-fa-cut',
                    weight : 520,
                    onItem({ eventRecord }) {
                        eventRecord.split();
                    }
                },
                lock : {
                    text   : 'Lock',
                    icon   : 'b-fa b-fa-fw b-fa-lock',
                    cls    : 'b-separator',
                    weight : 530,
                    onItem({ eventRecord }) {
                        eventRecord.locked = true;
                        eventRecord.draggable = false;
                        eventRecord.resizable = false;
                    }
                },

                // Edit a built in item
                editEvent : {
                    text : 'Update'
                },

                // Hide a built in item
                deleteEvent : false
            },

            // Process items before context menu is shown, add or remove or prevent it
            processItems({ eventRecord, items }) {
                if (eventRecord.eventType === 'meeting') {
                    // Add a custom item for meetings
                    items.cancel = {
                        text   : 'Cancel',
                        icon   : 'b-fa b-fa-fw b-fa-ban',
                        cls    : 'b-separator',
                        weight : 540,
                        onItem({ eventRecord }) {
                            eventRecord.canceled = true;
                        }
                    };
                }

                if (eventRecord.eventType === 'activity') {
                    // Remove "Edit" items for activities
                    items.editEvent = false;

                    // Add a "Done" item
                    items.done = {
                        text   : 'Done',
                        icon   : 'b-fa b-fa-fw b-fa-check',
                        cls    : 'b-separator',
                        weight : 550,
                        onItem({ eventRecord }) {
                            eventRecord.done = true;
                        }
                    };
                }

                // Not possible to lock canceled or completed events, disable the item
                if (eventRecord.canceled || eventRecord.done) {
                    items.lock.disabled = true;
                }

                // Prevent menu for "locked" event
                return !eventRecord.locked;
            }
        }
    },

    eventRenderer({ eventRecord, renderData }) {
        let status = '';

        // Canceled meetings have their own styling and icon
        if (eventRecord.canceled) {
            renderData.cls.canceled = true;
            renderData.iconCls = 'b-fa b-fa-ban';
            renderData.eventColor = 'gray';
            status = 'Canceled: ';
        }
        // So does activities flagged with "done"
        else if (eventRecord.done) {
            renderData.cls.done = true;
            renderData.iconCls = 'b-fa b-fa-check';
            renderData.eventColor = 'lime';
            status = 'Done: ';
        }
        // And "locked"
        else if (eventRecord.locked) {
            renderData.cls.locked = true;
            renderData.iconCls = 'b-fa b-fa-lock';
            renderData.eventColor = 'red';
            status = 'Locked: ';
        }
        // All activities use same icon
        else if (eventRecord.eventType === 'activity') {
            renderData.iconCls = 'b-fa b-fa-clock';
        }
        // And the same for meetings
        else if (eventRecord.eventType === 'meeting') {
            renderData.iconCls = 'b-fa b-fa-calendar';
        }

        return `${status}${StringHelper.encodeHtml(eventRecord.name)}`;
    }
});

// Loading data using Ajax, as an alternative to using our stores or CrudManager to load
scheduler.maskBody('Loading JSON data');

AjaxHelper.get('data/data.json', { parseJson : true }).then(response => {
    const data = response.parsedJson;

    if (data) {
        scheduler.resources = data.resources;
        scheduler.events = data.events;
    }

    scheduler.unmaskBody();
});
