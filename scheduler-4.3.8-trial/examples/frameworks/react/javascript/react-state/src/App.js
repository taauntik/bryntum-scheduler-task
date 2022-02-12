/**
 * The App component
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

import { Toast } from '@bryntum/scheduler/scheduler.umd.js';

import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumCombo
} from '@bryntum/scheduler-react';
import './App.scss';

import { schedulerConfig, data } from './AppConfig.js';

const App = props => {
    const initialIndex = 0;
    const schedulerRef = useRef(null);

    const [index, setIndex] = useState(initialIndex);
    const [resources, setResources] = useState(data.resources[initialIndex]);
    const [events, setEvents] = useState(data.events[initialIndex]);

    // Header configuration
    const headerConfig = {
        href: '../../../../../#example-frameworks-react-javascript-react-state'
    };

    // Called when user selects "Load data with Axios"
    const loadData = useCallback(() => {
        axios
            .get('./data.json')
            .then(response => {
                const { rows: resources } = response.data.resources;
                const { rows: events } = response.data.events;
                setResources(resources);
                setEvents(events);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    // Called on index change
    useEffect(() => {
        if (index === 5) {
            loadData();
        } else {
            const newResources = data.resources[index] || [];
            const newEvents = data.events[index] || [];

            setResources(newResources);
            setEvents(newEvents);
        }
    }, [index, loadData]);

    // Called when data changes in any of the Scheduler stores
    const onDataChange = useCallback(({ store, action, records }) => {
        if('dataset' !== action && store.changes){
            Toast.show(`
            <h3>${store.storeId} changed</h3>
            Added: <strong>${store.changes.added.length}</strong>
            Modified: <strong>${store.changes.modified.length}</strong>
            Removed: <strong>${store.changes.removed.length}</strong>
            `)
        }
    }, []);

    return (
        <>
            <BryntumDemoHeader {...headerConfig} children={<BryntumThemeCombo />} />
            <div className="demo-toolbar align-right">
                <BryntumCombo
                    label="Select Dataset"
                    value={index}
                    inputWidth="12em"
                    onChange={({ value }) => setIndex(value)}
                    editable={false}
                    items={[
                        { value: 0, text: 'Dataset 0' },
                        { value: 1, text: 'Dataset 1' },
                        { value: 2, text: 'Dataset 2 - empty' },
                        { value: 3, text: 'Dataset 3' },
                        { value: 4, text: 'Dataset 4' },
                        { value: 5, text: 'Load data with Axios' }
                    ]}
                />
            </div>
            <BryntumScheduler
                {...schedulerConfig}
                events={events}
                resources={resources}
                ref={schedulerRef}
                onDataChange={onDataChange}
            />
        </>
    );
};

export default App;
