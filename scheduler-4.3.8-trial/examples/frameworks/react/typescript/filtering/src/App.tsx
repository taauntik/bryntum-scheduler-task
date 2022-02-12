/**
 * Main App file
 */
import React, { Fragment, FunctionComponent, useCallback, useRef } from 'react';

// our libraries
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumTextField
} from '@bryntum/scheduler-react';
import { DomClassList, EventModel } from '@bryntum/scheduler/scheduler.umd.js';

// application scss
import './App.scss';

// application files
import { schedulerConfig, findConfig, highlightConfig } from './AppConfig';

const App: FunctionComponent = () => {
    const schedulerRef = useRef<typeof BryntumScheduler | null>(null);

    // runs when value in the filter input field changes and filters the eventStore
    const filterChangeHandler = useCallback(({ value }: { value: string }) => {
        const eventStore = schedulerRef.current.instance.eventStore;

        // Replace previous filtering fn with a new filter
        eventStore.filter({
            filters: (event: EventModel) => event.name.match(new RegExp(value, 'i')),
            replace: true
        });
    }, []);

    // runs when value in the highlight input field changes and highlights the matched events
    const highlightChangeHandler = useCallback(({ value }: { value: string }) => {
        const engine = schedulerRef.current.instance;

        engine.eventStore.forEach((task: any) => {
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
        engine.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
    }, []);

    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-typescript-filtering"
                children={<BryntumThemeCombo />}
            />
            <div className="demo-toolbar align-right">
                <BryntumTextField {...findConfig} onInput={filterChangeHandler} />
                <BryntumTextField {...highlightConfig} onInput={highlightChangeHandler} />
            </div>
            <BryntumScheduler ref={schedulerRef} {...schedulerConfig} />
        </Fragment>
    );
};

export default App;
