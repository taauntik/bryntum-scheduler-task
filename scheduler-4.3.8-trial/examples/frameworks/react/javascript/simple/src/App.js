/**
 * The App contains Header and Scheduler components and makes them to work together
 */
import React, { Fragment, useState, useRef, useCallback } from 'react';
import { PropTypes } from 'prop-types';

import { Toast } from '@bryntum/scheduler/scheduler.umd';
import {
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumButton,
    BryntumNumberField,
    BryntumCheckbox
} from '@bryntum/scheduler-react';
import Scheduler from './components/Scheduler';
import Selected from './components/Selected';
import './App.scss';

const App = props => {
    // State
    const [barMargin, setBarMargin] = useState(props.defaultBarMargin);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [columnLines, setColumnLines] = useState({ disabled: false });
    const [stripe, setStripe] = useState({ disabled: true });

    // Scheduler ref forwarded to Scheduler component
    const schedulerRef = useRef(null);

    /**
     * Show toast and set the selected event name.
     */
    const selectionChangeHandler = useCallback(({ selection }) => {
        const name = selection.length ? selection[0].name : '';
        const msg = name ? `You selected <b>${name}</b>` : 'All events are <b>deselected</b>';

        setSelectedEvent(name);
        Toast.show(msg);
    }, []);

    /**
     * Add an 1hr event for the first resource at the beginning of the scheduler
     */
    const addClickHandler = useCallback(
        event => {
            // Get the scheduler instance
            const scheduler = schedulerRef.current?.instance;

            if (!scheduler) {
                return;
            }

            // Get start and end date of the new event (1h duration)
            const startDate = new Date(scheduler.startDate.getTime()),
                endDate = new Date(startDate.getTime()),
                resource = scheduler.resourceStore.first;

            if (!resource) {
                Toast.show('There is no resource available');
                return;
            }

            endDate.setHours(endDate.getHours() + 1);

            // Gdd the event to the store
            scheduler.eventStore.add({
                resourceId: resource.id,
                startDate: startDate,
                endDate: endDate,
                name: 'New task',
                eventType: 'Meeting'
            });
        },
        [schedulerRef]
    );

    /**
     * Remove the selected event
     */
    const removeClickHandler = useCallback(
        event => {
            console.log('removeClickHandler', event);
            // Get the scheduler instance
            const scheduler = schedulerRef.current?.instance;

            if (!scheduler) {
                console.warn('Could not get Scheduler instance');
                return;
            }

            // Remove the selected event
            if (scheduler.selectedEvents.length) {
                scheduler.selectedEvents[0].remove();
            }

            setSelectedEvent('');
        },
        [schedulerRef]
    );

    // Header configuration
    const headerConfig = {
        href: '../../../../../#example-frameworks-react-javascript-simple'
    };

    // Scheduler configuration
    const schedulerConfig = {
        barMargin,
        onEventSelectionChange: selectionChangeHandler
    };

    return (
        <Fragment>
            <BryntumDemoHeader {...headerConfig} children={<BryntumThemeCombo />} />
            <div className="demo-toolbar align-right">
                <BryntumNumberField
                    label="Bar Margin:"
                    width={160}
                    min={0}
                    max={15}
                    step={1}
                    value={barMargin}
                    onChange={({ value }) => setBarMargin(value)}
                />
                <div className="spacer" />

                <BryntumCheckbox
                    label="Stripe Feature"
                    checked={false}
                    onAction={({ checked }) => setStripe({ disabled: !checked })}
                />
                <BryntumCheckbox
                    label="Column Lines Feature"
                    checked={true}
                    onAction={({ checked }) => setColumnLines({ disabled: !checked })}
                />
                <Selected selectedEvent={selectedEvent} />
                <BryntumButton
                    cls="b-green b-raised"
                    icon="b-fa b-fa-plus"
                    onClick={addClickHandler}
                />
                <BryntumButton
                    cls="b-red b-raised"
                    icon="b-fa b-fa-trash"
                    onClick={removeClickHandler}
                    disabled={!selectedEvent}
                />
            </div>
            <Scheduler
                {...schedulerConfig}
                columnLinesFeature={columnLines}
                stripeFeature={stripe}
                ref={schedulerRef}
            />
        </Fragment>
    );
};

App.propTypes = {
    defaultBarMargin: PropTypes.number
};

App.defaultProps = {
    defaultBarMargin: 5
};

export default App;
