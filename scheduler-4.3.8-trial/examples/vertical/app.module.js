import { EventModel, Scheduler, DateHelper, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

class Task extends EventModel {
    static get fields() {
        return [
            // Set a default event icon for all events
            { name : 'iconCls', defaultValue : 'b-fa b-fa-calendar' }
        ];
    }
}

const scheduler = new Scheduler({
    appendTo : 'container',

    mode : 'vertical',

    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass : Task
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    startDate      : new Date(2019, 0, 1, 6),
    endDate        : new Date(2019, 0, 1, 18),
    viewPreset     : 'hourAndDay',
    barMargin      : 5,
    resourceMargin : 5,
    eventStyle     : 'colored',
    tickSize       : 80,

    resourceImagePath : '../_shared/images/users/',

    features : {
        filterBar          : true, // required to filterable on columns work
        resourceTimeRanges : true,
        timeRanges         : {
            enableResizing      : true,
            showCurrentTimeLine : true
        },

        summary : {
            disabled                    : true,
            renderer                    : ({ events }) => events.length,
            verticalSummaryColumnConfig : {
                text : 'Summary'
            }
        }
    },

    resourceColumns : {
        columnWidth : 140//,
        //headerRenderer : ({ resourceRecord }) => StringHelper.xss`${resourceRecord.id} - ${resourceRecord.name}`
    },

    verticalTimeAxisColumn : {
        filterable : { // filter configuration
            filterField : { // define the configuration for the filter field
                type        : 'text', // type of the field rendered for the filter
                placeholder : 'Filter events',
                onChange    : ({ value }) => { // on change of the field, filter the event store
                    scheduler.eventStore.filter({
                        // filter event by name converting to lowerCase to be equal comparison
                        filters : event => event.name.toLowerCase().includes(value.toLowerCase()),
                        replace : true // to replace all existing filters with a new filter
                    });
                }
            }
        }
    },

    subGridConfigs : {
        locked : {
            // Wide enough to not clip tick labels for all the zoom levels.
            width : 115
        }
    },

    eventRenderer : ({ eventRecord }) => StringHelper.xss`
        <div class="time">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
        <div class="name">${eventRecord.name}</div>
    `,

    tbar : [
        {
            type  : 'date',
            value : 'up.startDate',
            step  : '1d',
            onChange({ value }) {
                // Preserve time, only changing "day"
                const diff = DateHelper.diff(DateHelper.clearTime(scheduler.startDate), value, 'days');
                scheduler.startDate = DateHelper.add(scheduler.startDate, diff, 'days');
            }
        },
        {
            type : 'button',
            id   : 'fitButton',
            text : 'Fit',
            icon : 'b-fa-arrows-alt-h',
            menu : {
                items : {
                    none : {
                        text        : 'No fit',
                        checked     : false, //!scheduler.resourceColumns.fitWidth && !scheduler.resourceColumns.fillWidth,
                        closeParent : true
                    },
                    fill : {
                        text        : 'Fill width',
                        checked     : 'up.resourceColumns.fillWidth',
                        closeParent : true
                    },
                    fit : {
                        text        : 'Fit width',
                        checked     : 'up.resourceColumns.fitWidth',
                        closeParent : true
                    }
                },

                onItem({ source : item }) {
                    item.owner.widgetMap.none.checked = item.ref === 'none';
                    scheduler.resourceColumns.fillWidth = item.owner.widgetMap.fill.checked = item.ref === 'fill';
                    scheduler.resourceColumns.fitWidth = item.owner.widgetMap.fit.checked = item.ref === 'fit';
                    scheduler.resourceColumns.fitWidth = item.ref === 'fit';
                }
            }
        },
        {
            type : 'button',
            text : 'Layout',
            icon : 'b-fa-layer-group',
            menu : {
                items : {
                    none : {
                        text        : 'Overlap',
                        checked     : false,
                        closeParent : true
                    },
                    pack : {
                        text        : 'Pack',
                        checked     : true,
                        closeParent : true
                    },
                    mixed : {
                        text        : 'Mixed',
                        checked     : false,
                        closeParent : true
                    }
                },

                onItem({ source : item }) {
                    const { none, pack, mixed } = item.owner.widgetMap;

                    none.checked = item.ref === 'none';
                    pack.checked = item.ref === 'pack';
                    mixed.checked = item.ref === 'mixed';

                    scheduler.eventLayout = item.ref;
                }
            }
        },
        {
            type : 'button',
            text : 'Sizing',
            icon : 'b-fa-expand-arrows-alt',
            menu : {
                columnWidth : {
                    type      : 'slider',
                    text      : 'Column width',
                    showValue : true,
                    min       : 50,
                    max       : 200,
                    value     : 'up.resourceColumnWidth',
                    onInput({ value }) {
                        const
                            fitWidgetMap  = scheduler.widgetMap.fitButton.menu.widgetMap || {},
                            fitNoneButton = fitWidgetMap.none,
                            fitFillButton = fitWidgetMap.fill,
                            fitFitButton  = fitWidgetMap.fit;

                        if (fitNoneButton) {
                            fitNoneButton.checked = true;
                            fitFillButton.checked = false;
                            fitFitButton.checked  = false;
                        }

                        scheduler.resourceColumns.fitWidth    = scheduler.resourceColumns.fillWidth = null;

                        scheduler.resourceColumns.columnWidth = value;
                    }
                },
                tickHeight : {
                    type      : 'slider',
                    text      : 'Tick height',
                    showValue : true,
                    min       : 20,
                    style     : 'margin-top: .5em',
                    value     : 'up.tickSize',
                    onInput({ value }) {
                        // To allow ticks to not fill height
                        scheduler.suppressFit = true;

                        // Set desired size
                        scheduler.tickSize = value;
                    }
                },
                barMargin : {
                    type      : 'slider',
                    text      : 'Bar margin',
                    showValue : true,
                    min       : 0,
                    max       : 10,
                    style     : 'margin-top: .5em',
                    value     : 'up.barMargin',
                    onInput({ value }) {
                        scheduler.barMargin = value;
                    }
                },
                resourceMargin : {
                    type      : 'slider',
                    text      : 'Resource margin',
                    showValue : true,
                    min       : 0,
                    max       : 10,
                    style     : 'margin-top: .5em',
                    value     : 'up.resourceMargin',
                    onInput({ value }) {
                        scheduler.resourceMargin = value;
                    }
                }
            }
        },
        {
            type       : 'button',
            text       : 'Show summary',
            toggleable : true,
            icon       : 'b-fa-table',
            onToggle({ pressed }) {
                scheduler.features.summary.disabled = !pressed;
            }
        }
    ]
});
