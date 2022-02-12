/**
 * Bryntum Scheduler
 */
import React, { useEffect, useRef } from 'react';
import { BryntumScheduler } from '@bryntum/scheduler-react';
import { schedulerConfig } from '../AppConfig.js';

import { useSelector, useDispatch } from 'react-redux';
import { dataApi } from '../services/data.js';
import { uiActions } from '../store/uiSlice.js';

const SchedulerComponent = props => {
    const schedulerRef = useRef();
    const dispatch = useDispatch();

    // Variables from global Redux state
    const zoomAction = useSelector(state => state.ui.zoomAction);
    const dataset = useSelector(state => state.schedulerData.dataset);

    const [trigger, { data, isLoading, isError, isUninitialized, error }] =
        dataApi.useLazyGetDataByNameQuery();

    // Triggers loading dataset. Dataset change is dispatched in Toolbar.
    useEffect(() => {
        trigger(dataset);
    }, [dataset, trigger]);

    // Handles zoom level change
    useEffect(() => {
        if (zoomAction) {
            const scheduler = schedulerRef.current.instance;

            // Zoom scheduler in or out
            scheduler[zoomAction]();

            // Reset zoomAction back to null in redux
            dispatch(uiActions.zoom(null));
        }
    }, [dispatch, zoomAction]);

    // Render status messages if data is not (yet) available.
    if (isUninitialized) {
        return <h2 style={{ margin: 'auto' }}>Not started.</h2>;
    }
    if (isLoading) {
        return <h2 style={{ margin: 'auto' }}>Loading...</h2>;
    }
    if (isError) {
        return <h2 style={{ margin: 'auto' }}>{`Error: ${error.error}`}</h2>;
    }

    // Extract individual datasets from the combined response
    const { resources, events, timeRanges } = data;

    return (
        <>
            <BryntumScheduler
                ref={schedulerRef}
                {...schedulerConfig}
                resources={resources}
                events={events}
                timeRanges={timeRanges}
            />
        </>
    );
};

export default SchedulerComponent;
