/**
 * Content component
 */
import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';

import { Toast } from '@bryntum/scheduler/scheduler.umd';
import { BryntumScheduler, BryntumButton } from '@bryntum/scheduler-react';
import TaskStore from '../lib/TaskStore.js';
import UnplannedGridComponent from '../components/UnplannedGrid.js';
import Drag from '../lib/Drag.js';

const Content = props => {
    // we need there refs for setting up dragging
    const scheduler = useRef(null);
    const grid = useRef(null);

    const [autoReschedule, setAutoReschedule] = useState(false);

    // event store is needed by both scheduler and grid
    // so we create it before to be accessible by both
    const [eventStore] = useState(new TaskStore());

    /**
     * @param {Event} record Event record
     * @param {TaskStore} eventStore Event store firing the event
     *
     * Reschedules the overlapping events if the button is pressed
     */
    const onEventStoreUpdate = useCallback(
        ({ record, source: eventStore }) => {
            if (autoReschedule) {
                eventStore.rescheduleOverlappingTasks(record);
            }
        },
        [autoReschedule]
    );

    /**
     * @param {Event[]} records Array of Event records
     * @param {TaskStore} eventStore Event store firing the event
     *
     * Reschedules the overlapping events if the button is pressed
     */
    const onEventStoreAdd = useCallback(
        ({ records, source: eventStore }) => {
            if (autoReschedule) {
                records.forEach(eventRecord =>
                    eventStore.rescheduleOverlappingTasks(eventRecord)
                );
            }
        },
        [autoReschedule]
    );

    useEffect(() => {
        Object.assign(eventStore, {
            onUpdate: onEventStoreUpdate,
            onAdd: onEventStoreAdd
        });

        new Drag({
            grid: grid.current.unplannedGrid,
            schedule: scheduler.current.instance,
            constrain: false,
            outerElement: grid.current.unplannedGrid.element
        });

        Toast.show({
            timeout: 3500,
            html:
                'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });
    }, [eventStore, onEventStoreAdd, onEventStoreUpdate]);

    return (
        <Fragment>
            <div className="demo-toolbar align-right">
                <BryntumButton
                    toggleable={true}
                    icon="b-fa b-fa-calendar"
                    tooltip="Toggles whether to automatically reschedule overlapping tasks"
                    cls="reschedule-button"
                    onClick={({ source: button }) => {
                        setAutoReschedule(button.pressed);
                    }}
                />
            </div>
            <div id="main">
                <BryntumScheduler
                    ref={scheduler}
                    id="schedulerComponent"
                    stripeFeature={true}
                    timeRangesFeature={true}
                    eventMenuFeature={{
                        items: {
                            // custom item with inline handler
                            unassign: {
                                text: 'Unassign',
                                icon: 'b-fa b-fa-user-times',
                                weight: 200,
                                onItem: ({ eventRecord, resourceRecord }) =>
                                    eventRecord.unassign(resourceRecord)
                            }
                        }
                    }}
                    rowHeight={50}
                    barMargin={4}
                    eventColor="indigo"
                    resourceImagePath="users/"
                    columns={[
                        {
                            type: 'resourceInfo',
                            text: 'Name',
                            width: 200,
                            showEventCount: false,
                            showRole: true
                        },
                        {
                            text: 'Nbr tasks',
                            editor: false,
                            renderer: data => `${data.record.events.length || ''}`,
                            align: 'center',
                            sortable: (a, b) => (a.events.length < b.events.length ? -1 : 1),
                            width: 100
                        }
                    ]}
                    // Custom view preset with header configuration
                    viewPreset={{
                        base: 'hourAndDay',
                        columnLinesFor: 0,
                        headers: [
                            {
                                unit: 'd',
                                align: 'center',
                                dateFormat: 'ddd DD MMM'
                            },
                            {
                                unit: 'h',
                                align: 'center',
                                dateFormat: 'HH'
                            }
                        ]
                    }}
                    startDate={new Date(2025, 11, 1, 8)}
                    endDate={new Date(2025, 11, 1, 18)}
                    crudManager={{
                        autoLoad: true,
                        eventStore: eventStore,
                        transport: {
                            load: {
                                url: 'data/data.json'
                            }
                        },
                        // This config enables response validation and dumping of found errors to the browser console.
                        // It's meant to be used as a development stage helper only so please set it to false for production systems.
                        validateResponse : true
                    }}
                />
                <UnplannedGridComponent ref={grid} eventStore={eventStore} />
            </div>
        </Fragment>
    );
};

export default Content;
