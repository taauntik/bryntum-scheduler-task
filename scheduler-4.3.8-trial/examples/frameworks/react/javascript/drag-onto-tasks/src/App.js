/**
 * Application
 */
import React, { Fragment, useEffect, useState } from 'react';

import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/scheduler-react';
import { AjaxStore, EventStore, Toast } from '@bryntum/scheduler/scheduler.umd';
import Scheduler from './components/Scheduler.js';
import Task from './lib/Task.js';
import EquipmentGrid from './lib/EquipmentGrid.js';
import './App.scss';

const App = () => {
    // we need to pass these three down to scheduler
    // useState prevents creating new instances on each run
    const [equipmentStore] = useState(
        new AjaxStore({
            modelClass: Task,
            readUrl: 'data/equipment.json',
            sorters: [{ field: 'name', ascending: true }]
        })
    );
    const [eventStore] = useState(
        new EventStore({
            modelClass: Task
        })
    );
    const [equipmentGrid] = useState(
        new EquipmentGrid({
            cls: 'equipment',
            eventStore: eventStore,
            // Use a chained Store to avoid its filtering to interfere with Scheduler's rendering
            store: equipmentStore.makeChained()
        })
    );
    useEffect(() => {
        equipmentGrid.appendTo = 'content';
        equipmentGrid.render();

        Toast.show({
            timeout: 3500,
            html:
                'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });
    }, [equipmentGrid]);

    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-javascript-drag-onto-tasks"
                children={<BryntumThemeCombo />}
            />
            <div id="content">
                <Scheduler extraData={{ equipmentStore, EquipmentGrid, equipmentGrid }} />
            </div>
        </Fragment>
    );
};

export default App;
