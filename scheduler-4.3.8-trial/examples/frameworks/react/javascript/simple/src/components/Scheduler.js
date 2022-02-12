/**
 * Scheduler Component
 */

// React libraries
import React, { forwardRef } from 'react';
import { PropTypes } from 'prop-types';

// Bryntum libraries
import { BryntumScheduler } from '@bryntum/scheduler-react';

// Application components
import DemoButton from './DemoButton';
import DemoEditor from './DemoEditor';

// Scheduler component
const Scheduler = forwardRef((props, schedulerRef) => {
    // Turn events for important resources red + prefix with "Important"
    const eventRenderer = ({ eventRecord, resourceRecord, renderData }) => {
        let prefix = '';

        if (resourceRecord.important) {
            renderData.eventColor = 'red';
            prefix = 'Important ';
        }

        return prefix + eventRecord.name;
    };

    // Handlers
    /**
     * User clicked the "+1 hour" button on a resource
     */
    const handleDelayClick = record => {
        record.events.forEach(event => {
            // Move 1h forward in time
            event.startDate = new Date(event.startDate.getTime() + 1000 * 60 * 60);
        });
    };

    // Scheduler config
    const schedulerConfig = {
        startDate         : new Date(2017, 1, 7, 8),
        endDate           : new Date(2017, 1, 7, 18),
        resourceImagePath : 'users/',
        viewPreset        : 'hourAndDay',
        eventRenderer,

        crudManager: {
            autoLoad  : true,
            transport : {
                load: {
                    url : 'data/data.json'
                }
            },
            // This config enables response validation and dumping of found errors to the browser console.
            // It's meant to be used as a development stage helper only so please set it to false for production systems.
            validateResponse : true
        },

        columns: [
            {
                text                 : 'Staff<div class="small-text">(React JSX)</div>',
                field                : 'name',
                htmlEncodeHeaderText : false,
                width                : 130,
                // JSX as renderer
                renderer: ({ value }) => (
                    <div>
                        <b>{value}</b>
                    </div>
                )
            },
            {
                text  : 'Type',
                field : 'role',
                width : 130
            },
            {
                text                 : 'Delay<div class="small-text">(React component)</div>',
                htmlEncodeHeaderText : false,
                width                : 120,
                align                : 'center',
                editor               : false,
                // Using custom React component
                renderer: ({ record }) => (
                    <DemoButton
                        text    = {'+1 hour'}
                        onClick = {() => handleDelayClick(record)}
                    />
                )
            },
            {
                text                 : 'Important<div class="small-text">(React editor)</div>',
                htmlEncodeHeaderText : false,
                field                : 'important',
                width                : 120,
                align                : 'center',
                editor               : reactRef => <DemoEditor ref={reactRef} />,
                renderer             : ({ value }) => (value ? 'Yes' : 'No')
            }
        ]
    };

    return <BryntumScheduler {...schedulerConfig} {...props} ref={schedulerRef} />;
});

Scheduler.propTypes = {
    barMargin: PropTypes.number,
    onEventSelectionChange: PropTypes.func.isRequired
};

Scheduler.defaultProps = {
    barMargin: 5
};

export default Scheduler;
