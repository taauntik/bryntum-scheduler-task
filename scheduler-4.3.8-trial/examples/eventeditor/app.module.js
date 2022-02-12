import { DateHelper, StringHelper, Scheduler, Toast } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const resourceComboConfig = {
    // Will resolve on owning Widget which implememnts this; The Scheduler
    createOnUnmatched : 'up.createNewEmployee',

    listeners : {
        focusIn() {
            // This widget filters the actual resourceStore when choosing a resource.
            // We don't want that to go through to the Scheduler UI.
            scheduler.suspendRefresh();
        },
        focusOut() {
            // Unfilter the Scheduler resourceStore by any typed value
            this.primaryFilter.setConfig({
                value    : '',
                disabled : true
            });
            this.store.filter();

            // Now we leave the store in its pristine state, the Scheduler UI can respond
            scheduler.resumeRefresh();
        },
        change({ value }) {
            scheduler.selectedRecord = value;
        }
    }
};

const scheduler = new Scheduler({

    appendTo          : 'container',
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/users/',

    features : {
        stripe     : true,
        timeRanges : true,
        headerZoom : true,
        eventEdit  : {
            // Uncomment to make event editor readonly from the start
            // readOnly : true,
            // Add items to the event editor
            items : {
                resourceField : resourceComboConfig,

                // Using this ref hooks dynamic toggling of fields per eventType up
                eventTypeField : {
                    type   : 'combo',
                    name   : 'eventType',
                    label  : 'Type',
                    // Provided items start at 100, and go up in 100s, so insert after first one
                    weight : 110,
                    items  : ['Appointment', 'Internal', 'Meeting']
                },
                locationField : {
                    type    : 'text',
                    name    : 'location',
                    label   : 'Location',
                    weight  : 120,
                    // This field is only displayed for meetings
                    dataset : { eventType : 'Meeting' }
                },
                eventColorField : {
                    type        : 'combo',
                    label       : 'Color',
                    name        : 'eventColor',
                    editable    : false,
                    weight      : 130,
                    listItemTpl : item => StringHelper.xss`<div class="color-box b-sch-${item.value}"></div><div>${item.text}</div>`,
                    items       : Scheduler.eventColors.map(color => [color, StringHelper.capitalize(color)])
                },
                linkField : {
                    type     : 'displayfield',
                    label    : 'Link',
                    name     : 'id',
                    weight   : 600,
                    template : link => StringHelper.xss`<a href='//your.app/task/${link}' target='blank'>Open in new tab</a></div>`
                }
            }
        }
    },

    subGridConfigs : {
        locked : { width : 300 }
    },

    columns : [
        {
            type : 'resourceInfo',
            flex : 1,
            text : 'Staff'
        },
        {
            text   : 'Type',
            field  : 'role',
            flex   : 1,
            editor : {
                type        : 'combo',
                items       : ['Sales', 'Developer', 'Marketing', 'Product manager', 'CEO', 'CTO'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        eventStore : {
            // Extra fields used on EventModels. Store tries to be smart about it and extracts these from the first
            // record it reads, but it is good practice to define them anyway to be certain they are included.
            fields : [
                'location',
                { name : 'eventType', defaultValue : 'Appointment' }
            ]
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    barMargin  : 2,
    rowHeight  : 50,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },

    // Specialized body template with header and footer
    eventBodyTemplate : data => StringHelper.xss`<i class="${data.iconCls || ''}"></i><section><div class="b-sch-event-header">${data.headerText}</div><div class="b-sch-event-footer">${data.footerText}</div></section>`,

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = 'background-color:' + resourceRecord.color;

        return {
            headerText : DateHelper.format(eventRecord.startDate, 'LT'),
            footerText : eventRecord.name || '',
            iconCls    : eventRecord.iconCls
        };
    },

    listeners : {
        eventEditBeforeSetRecord({ source : editor, record : eventRecord }) {
            editor.title = `Edit ${eventRecord.eventType || ''}`;

            // Only CEO and CTO roles are allowed to play golf...
            if (eventRecord.name === 'Golf') {
                editor.widgetMap.resourceField.store.filter({
                    filterBy : resource => resource.role.startsWith('C'),
                    id       : 'golfFilter'
                });
            }
            else {
                // Clear our golf filter before editing starts
                editor.widgetMap.resourceField.store.removeFilter('golfFilter');
            }
        },
        selectionChange({ mode, selected }) {
            if (mode === 'row' && selected?.length) {
                scheduler.tbar.widgetMap.resourceCombo.value = selected[0];
            }
        }
    },

    tbar : {
        items : {
            resourceCombo : {
                type         : 'combo',
                flex         : '0 0 250px',
                label        : 'Resource',
                store        : 'up.resourceStore',
                displayField : 'name',

                // This means that our "value" is the selected record, not a field from within it.
                valueField : null,

                ...resourceComboConfig
            },
            addEventButton : {
                type     : 'button',
                icon     : 'b-icon b-icon-add',
                text     : 'Add event',
                onAction : () => {
                    const
                        { resourceCombo } = scheduler.widgetMap,
                        resource          = resourceCombo.value;

                    if (!resource) {
                        Toast.show('Please select a resource to create an event for');
                        resourceCombo.focus();
                        return;
                    }

                    const event = new scheduler.eventStore.modelClass({
                        resourceId   : resource.id,
                        startDate    : scheduler.startDate,
                        duration     : 1,
                        durationUnit : 'h',
                        name         : 'New task'
                    });

                    scheduler.editEvent(event);
                }
            },
            removeAllButton : {
                type     : 'button',
                icon     : 'b-icon b-icon-trash',
                color    : 'b-red',
                text     : 'Clear all events',
                onAction : () => scheduler.eventStore.removeAll()
            },
            filler           : '->',
            readOnlyCheckbox : {
                type    : 'checkbox',
                label   : 'Read only editor',
                tooltip : 'Toggle read only mode for the event editor',
                onChange({ checked }) {
                    scheduler.features.eventEdit.readOnly = checked;
                }
            },
            dateField : {
                type       : 'datefield',
                label      : 'View date',
                inputWidth : '8em',
                value      : new Date(2017, 1, 7),
                editable   : false,
                listeners  : {
                    change : ({ value }) => scheduler.setTimeSpan(DateHelper.add(value, 8, 'hour'), DateHelper.add(value, 22, 'hour'))
                }
            }
        }
    },

    // Create new resources for when the resource combo is used to type new names
    createNewEmployee(name) {
        return this.resourceStore.createRecord({
            name,
            role : 'Developer'
        });
    }
});
