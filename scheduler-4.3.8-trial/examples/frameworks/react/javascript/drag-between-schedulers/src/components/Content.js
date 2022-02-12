/**
 * Contains scheduler and equipment grid
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { BryntumScheduler, BryntumSplitter, BryntumButton } from '@bryntum/scheduler-react';
import { scheduler1Config, scheduler2Config } from '../AppConfig';

const Content = props => {
    const scheduler1Ref = useRef();
    const scheduler2Ref = useRef();

    const onZoom = useCallback(({ source }) => {
        const { action } = source.dataset;
        scheduler1Ref.current.instance[action]();
    }, []);

    useEffect(() => {
        scheduler2Ref.current.instance.addPartner(scheduler1Ref.current.instance);
    }, []);

    return (
        <div id="content">
            <div className="demo-toolbar align-right">
                <BryntumButton
                    dataset={{ action: 'zoomIn' }}
                    icon="b-icon-search-plus"
                    tooltip="Zoom in"
                    onClick={onZoom}
                />
                <BryntumButton
                    dataset={{ action: 'zoomOut' }}
                    icon="b-icon-search-minus"
                    tooltip="Zoom out"
                    onClick={onZoom}
                />
            </div>
            <BryntumScheduler {...scheduler1Config} ref={scheduler1Ref} />
            <BryntumSplitter />
            <BryntumScheduler {...scheduler2Config} ref={scheduler2Ref} />
        </div>
    );
};

export default Content;
