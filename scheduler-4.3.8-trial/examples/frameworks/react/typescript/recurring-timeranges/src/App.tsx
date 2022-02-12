/**
 * Application
 */
import React, { Fragment, FunctionComponent, useCallback, useRef } from 'react';

// our libraries
import { BryntumButton, BryntumDemoHeader, BryntumScheduler, BryntumThemeCombo } from '@bryntum/scheduler-react';

// application scss
import './App.scss';

// application files
import { schedulerConfig } from './AppConfig';
import { DateHelper } from "@bryntum/scheduler/scheduler.umd.js"
import { MyTimeRange } from "./lib/MyTimeRange"

const App: FunctionComponent = () => {
    const schedulerRef = useRef<typeof BryntumScheduler | null>(null);
    const coffeeButtonRef = useRef<typeof BryntumButton | null>(null);
    const scheduler = () => schedulerRef.current.instance;
    const coffeeButton = () => coffeeButtonRef.current.instance;

    const coffeeClickHandler = useCallback(() => {
        const coffee = scheduler().features.timeRanges.store.getById(1) as MyTimeRange;
        coffee.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TH;';
        coffeeButton().disabled = true;
    }, []);

    const prevClickHandler = useCallback(() => {
        scheduler().shiftPrevious();
    }, []);

    const nextClickHandler = useCallback(() => {
        scheduler().shiftNext();
    }, []);

    const todayClickHandler = useCallback(() => {
        const today = DateHelper.clearTime(new Date());
        today.setHours(5);
        scheduler().setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
    }, []);

    const startClickHandler = useCallback(() => {
        scheduler().setTimeSpan(new Date(2019, 1, 7, 8), new Date(2019, 1, 29, 18));
    }, []);

    return (
        <Fragment>
            <BryntumDemoHeader
                href = "../../../../../#example-frameworks-react-typescript-recurring-timeranges"
                children = {<BryntumThemeCombo />}
            />
            <div className = "demo-toolbar">
                <BryntumButton
                    ref = {coffeeButtonRef}
                    text = "More coffee"
                    icon = 'b-fa-coffee'
                    tooltip = 'Click to add morning coffee to Thursdays too'
                    onClick = {coffeeClickHandler}
                />
                <div className = "spacer"></div>
                <BryntumButton
                    icon = 'b-fa-angle-left'
                    tooltip = 'View previous day'
                    onClick = {prevClickHandler}
                />
                <BryntumButton
                    text = 'Today'
                    tooltip = 'View today, to see the current time line'
                    onClick = {todayClickHandler}
                />
                <BryntumButton
                    icon = 'b-fa-angle-right'
                    tooltip = 'View next day'
                    onClick = {nextClickHandler}
                />
                <BryntumButton
                    text = 'Start'
                    tooltip = 'Return to initial view'
                    onClick = {startClickHandler}
                />
            </div>
            <BryntumScheduler ref = {schedulerRef} {...schedulerConfig} />
        </Fragment>
    );
};

export default App;
