/**
 * Application
 */
import React, {
    Fragment,
    FunctionComponent,
    useEffect,
    useState,
    useRef,
    useCallback
} from 'react';
import {
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumScheduler,
    BryntumNumberField,
    BryntumButton
} from '@bryntum/scheduler-react';
import { Toast, EventModel } from '@bryntum/scheduler/scheduler.umd.js';
import axios from 'axios';
import { schedulerConfig } from './AppConfig';
import './App.scss';

const App: FunctionComponent = () => {
    const schedulerRef = useRef<typeof BryntumScheduler | null>(null);

    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [timeRanges, setTimeRanges] = useState([]);

    const [barMargin, setBarMargin] = useState(5);
    const [selectedEvent, setSelectedEvent] = useState<EventModel | null>(null);

    // load and set data
    useEffect(function() {
        axios
            .get('data/data.json')
            .then(response => {
                const { data } = response;
                setResources(data.resources.rows);
                setEvents(data.events.rows);
                setTimeRanges(data.timeRanges.rows);
            })
            .catch(error => {
                Toast.show(String(error));
                console.warn(error);
            });
    }, []);

    // event selection change handler
    const onEventSelectionChange = useCallback(({ selected }: { selected: EventModel[] }) => {
        setSelectedEvent(selected.length ? selected[0] : null);
    }, []);

    // add event handler
    const addEvent = useCallback(() => {
        const scheduler = schedulerRef.current.instance;
        const startDate = new Date(scheduler.startDate.getTime());
        const endDate = new Date(startDate.getTime());
        const resource = scheduler.resourceStore.first;

        if (!resource) {
            Toast.show('There is no resource available');
            return;
        }

        endDate.setHours(endDate.getHours() + 2);

        scheduler.eventStore.add({
            resourceId : resource.id,
            startDate  : startDate,
            endDate    : endDate,
            name       : 'New task',
            eventType  : 'Meeting'
        });
    }, []);

    // remove event handler
    const removeEvent = useCallback(() => {
        selectedEvent?.remove();
        setSelectedEvent(null);
    }, [selectedEvent]);

    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-typescript-basic"
                children={<BryntumThemeCombo />}
            />
            <div className="demo-toolbar align-right">
                {(() => {
                    return selectedEvent ? (
                        <div className="selected-event">
                            <span>Selected event: </span>
                            <span>{selectedEvent.name}</span>
                        </div>
                    ) : (
                        ''
                    );
                })()}

                <BryntumNumberField
                    label="Bar margin"
                    min={0}
                    max={15}
                    value={barMargin}
                    onChange={({ value }: { value: number }) => setBarMargin(value)}
                />
                <BryntumButton icon="b-fa-plus" cls="b-green" onClick={addEvent} />
                <BryntumButton
                    icon="b-fa-trash"
                    cls="b-red"
                    onClick={removeEvent}
                    disabled={!selectedEvent}
                />
            </div>
            <BryntumScheduler
                ref={schedulerRef}
                {...schedulerConfig}
                events={events}
                resources={resources}
                timeRanges={timeRanges}
                barMargin={barMargin}
                onEventSelectionChange={onEventSelectionChange}
            />
        </Fragment>
    );
};

export default App;
