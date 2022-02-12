/**
 * Scheduler Component
 */

// React libraries
import React, { useRef } from 'react';

// Bryntum libraries
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { DateHelper, StringHelper } from '@bryntum/scheduler/scheduler.umd';

// Application components

// Scheduler component
const Scheduler = props => {
    const schedulerRef = useRef(null);
    // Handlers

    // Scheduler config
    const schedulerConfig = {

        mode: 'vertical',

        crudManager: {
            autoLoad: true,
            transport: {
                load: {
                    url: 'data/data.json'
                }
            },
            // This config enables response validation and dumping of found errors to the browser console.
            // It's meant to be used as a development stage helper only so please set it to false for production systems.
            validateResponse : true
        },

        startDate: new Date(2019, 0, 1, 6),
        endDate: new Date(2019, 0, 1, 18),
        viewPreset: 'hourAndDay',
        barMargin: 5,
        resourceMargin: 5,
        eventStyle: 'colored',
        tickSize: 80,

        resourceImagePath: 'users/',

        filterBarFeature: true, // required to filterable on columns work
        resourceTimeRangesFeature: true,
        timeRangesFeature: {
            enableResizing: true,
            showCurrentTimeLine: true
        },

        resourceColumns: {
            columnWidth: 140 //,
            //headerRenderer : ({ resourceRecord }) => `${resourceRecord.id} - ${resourceRecord.name}`
        },

        verticalTimeAxisColumn: {
            filterable: {
                // filter configuration
                filterField: {
                    // define the configuration for the filter field
                    type: 'text', // type of the field rendered for the filter
                    placeholder: 'Filter events',
                    onChange: ({ value }) => {
                        const scheduler = schedulerRef.current?.instance;

                        // on change of the field, filter the event store
                        scheduler.eventStore.filter({
                            // filter event by name converting to lowerCase to be equal comparison
                            filters: event =>
                                event.name.toLowerCase().includes(value.toLowerCase()),
                            replace: true // to replace all existing filters with a new filter
                        });
                    }
                }
            }
        },

        subGridConfigs: {
            locked: {
                // Wide enough to not clip tick labels for all the zoom levels.
                width: 115
            }
        },

        eventRenderer: ({ eventRecord }) => `
            <div class="time">${DateHelper.format(eventRecord.startDate, 'LT')}</div>
            <div class="name">${StringHelper.encodeHtml(eventRecord.name)}</div>
        `,

        tbar: [
            {
                type: 'date',
                value: 'up.startDate',
                step: '1d',
                onChange({ value }) {
                    const scheduler = schedulerRef.current?.instance;

                    // Preserve time, only changing "day"
                    const diff = DateHelper.diff(
                        DateHelper.clearTime(scheduler.startDate),
                        value,
                        'days'
                    );
                    scheduler.startDate = DateHelper.add(
                        scheduler.startDate,
                        diff,
                        'days'
                    );
                }
            },
            {
                type: 'button',
                id: 'fitButton',
                text: 'Width',
                icon: 'b-fa-arrows-alt-h',
                width: '9em',
                menu: {
                    items: [
                        {
                            text: 'No fit',
                            checked: false, //!scheduler.resourceColumns.fitWidth && !scheduler.resourceColumns.fillWidth,
                            ref: 'none',
                            closeParent: true
                        },
                        {
                            text: 'Fill width',
                            ref: 'fill',
                            checked: 'up.resourceColumns.fillWidth',
                            closeParent: true
                        },
                        {
                            text: 'Fit width',
                            ref: 'fit',
                            checked: 'up.resourceColumns.fitWidth',
                            closeParent: true
                        }
                    ],

                    onItem({ source: item }) {
                        const scheduler = schedulerRef.current?.instance;

                        item.owner.widgetMap.none.checked = item.ref === 'none';
                        scheduler.resourceColumns.fillWidth = item.owner.widgetMap.fill.checked =
                            item.ref === 'fill';
                        scheduler.resourceColumns.fitWidth = item.owner.widgetMap.fit.checked =
                            item.ref === 'fit';
                        scheduler.resourceColumns.fitWidth = item.ref === 'fit';
                    }
                }
            },
            {
                type: 'button',
                text: 'Layout',
                icon: 'b-fa-layer-group',
                width: '9em',
                menu: {
                    items: [
                        {
                            text: 'Overlap',
                            checked: false,
                            ref: 'none',
                            closeParent: true
                        },
                        {
                            text: 'Pack',
                            ref: 'pack',
                            checked: true,
                            closeParent: true
                        },
                        {
                            text: 'Mixed',
                            ref: 'mixed',
                            checked: false,
                            closeParent: true
                        }
                    ],

                    onItem({ source: item }) {
                        const scheduler = schedulerRef.current?.instance;

                        const { none, pack, mixed } = item.owner.widgetMap;

                        none.checked = item.ref === 'none';
                        pack.checked = item.ref === 'pack';
                        mixed.checked = item.ref === 'mixed';

                        scheduler.eventLayout = item.ref;
                    }
                }
            },
            {
                type: 'button',
                text: 'Sizing',
                icon: 'b-fa-expand-arrows-alt',
                width: '9em',
                menu: {
                    type: 'popup',
                    anchor: true,
                    layoutStyle: {
                        flexDirection: 'column'
                    },
                    items: [
                        {
                            type: 'slider',
                            ref: 'columnWidth',
                            text: 'Column width',
                            showValue: true,
                            min: 50,
                            max: 200,
                            value: 'up.resourceColumnWidth',
                            onInput({ value }) {
                                const scheduler = schedulerRef.current?.instance;

                                const fitWidgetMap =
                                        scheduler.widgetMap.fitButton.menu.widgetMap ||
                                        {},
                                    fitNoneButton = fitWidgetMap.none,
                                    fitFillButton = fitWidgetMap.fill,
                                    fitFitButton = fitWidgetMap.fit;

                                if (fitNoneButton) {
                                    fitNoneButton.checked = true;
                                    fitFillButton.checked = false;
                                    fitFitButton.checked = false;
                                }

                                scheduler.resourceColumns.fitWidth = scheduler.resourceColumns.fillWidth = null;

                                scheduler.resourceColumns.columnWidth = value;
                            }
                        },
                        {
                            type: 'slider',
                            ref: 'tickHeight',
                            text: 'Tick height',
                            showValue: true,
                            min: 20,
                            style: 'margin-top: .5em',
                            value: 'up.tickSize',
                            onInput({ value }) {
                                const scheduler = schedulerRef.current?.instance;

                                // To allow ticks to not fill height
                                scheduler.suppressFit = true;

                                // Set desired size
                                scheduler.tickSize = value;
                            }
                        },
                        {
                            type: 'slider',
                            ref: 'barMargin',
                            text: 'Bar margin',
                            showValue: true,
                            min: 0,
                            max: 10,
                            style: 'margin-top: .5em',
                            value: 'up.barMargin',
                            onInput({ value }) {
                                const scheduler = schedulerRef.current?.instance;

                                scheduler.barMargin = value;
                            }
                        },
                        {
                            type: 'slider',
                            ref: 'resourceMargin',
                            text: 'Resource margin',
                            showValue: true,
                            min: 0,
                            max: 10,
                            style: 'margin-top: .5em',
                            value: 'up.resourceMargin',
                            onInput({ value }) {
                                const scheduler = schedulerRef.current?.instance;

                                scheduler.resourceMargin = value;
                            }
                        }
                    ]
                }
            }
        ]
    };

    return <BryntumScheduler {...schedulerConfig} {...props} ref={schedulerRef} />;
};

export default Scheduler;
