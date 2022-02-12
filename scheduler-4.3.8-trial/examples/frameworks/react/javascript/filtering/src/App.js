/**
 * Application
 */
import React, { Fragment, useRef, useCallback } from 'react';

import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumTextField
} from '@bryntum/scheduler-react';
import { DomClassList } from '@bryntum/scheduler/scheduler.umd';
import { schedulerConfig, findConfig, highlightConfig } from './AppConfig';
import './App.scss';

const App = () => {
    const scheduler = useRef(null);

    // runs when value in the filter input field changes and filters the eventStore
    const filterChangeHandler = useCallback(({ value }) => {
        const eventStore = scheduler.current.instance.eventStore;
        value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        eventStore.filter({
            filters: event => event.name.match(new RegExp(value, 'i')),
            replace: true
        });
    }, []);

    // runs when value in the highlight input field changes and highlights the matched events
    const highlightChangeHandler = useCallback(({ value }) => {
        const instance = scheduler.current.instance;

        instance.eventStore.forEach(task => {
            const taskClassList = new DomClassList(task.cls);
            const matched = taskClassList.contains('b-match');

            if (task.name.toLowerCase().indexOf(value) >= 0) {
                if (!matched) {
                    taskClassList.add('b-match');
                }
            } else if (matched) {
                taskClassList.remove('b-match');
            }
            task.cls = taskClassList.value;
        });

        instance.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
    }, []);

    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-javascript-filtering"
                children={
                    <Fragment>
                        <BryntumThemeCombo />
                    </Fragment>
                }
            />
            <div className="demo-toolbar align-right">
                <BryntumTextField {...findConfig} onInput={filterChangeHandler} />
                <BryntumTextField {...highlightConfig} onInput={highlightChangeHandler} />
            </div>
            <BryntumScheduler ref={scheduler} {...schedulerConfig}></BryntumScheduler>
        </Fragment>
    );
};

export default App;
