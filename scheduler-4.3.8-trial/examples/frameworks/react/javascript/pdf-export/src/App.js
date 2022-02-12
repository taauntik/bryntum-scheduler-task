/**
 * Application
 */
import React, { Fragment, useCallback, useRef } from 'react';

import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo,
    BryntumButton
} from '@bryntum/scheduler-react';
import { schedulerConfig } from './AppConfig';
import './App.scss';

const App = props => {
    const scheduler = useRef(null);

    const headerConfig = {
        href: '../../../../../#example-frameworks-react-javascript-pdf-export'
    };

    const onExportClick = useCallback(() => {
        scheduler.current.instance.features.pdfExport.showExportDialog();
    }, []);

    const eventRenderer = useCallback(({ eventRecord, resourceRecord, renderData }) => {
        const bgColor = resourceRecord.bg || '';

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
        renderData.iconCls = `b-fa b-fa-${resourceRecord.icon}`;

        return eventRecord.name;
    }, []);

    return (
        <Fragment>
            <BryntumDemoHeader {...headerConfig} children={<BryntumThemeCombo />} />
            <div className="demo-toolbar align-right">
                <BryntumButton
                    text="Export"
                    cls="b-deep-orange b-raised"
                    onClick={onExportClick}
                />
            </div>
            <BryntumScheduler
                ref={scheduler}
                {...schedulerConfig}
                eventRenderer={eventRenderer}
            />
        </Fragment>
    );
};

export default App;
