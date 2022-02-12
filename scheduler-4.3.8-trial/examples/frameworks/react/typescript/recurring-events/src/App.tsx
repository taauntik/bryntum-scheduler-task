/**
 * Application
 */
import React, { FunctionComponent, Fragment } from 'react';

// our libraries
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo
} from '@bryntum/scheduler-react';

// application scss
import './App.scss';

// application files
import { schedulerConfig } from './AppConfig';

const App: FunctionComponent = () => {
    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-typescript-recurring-events"
                children={<BryntumThemeCombo />}
            />
            <BryntumScheduler {...schedulerConfig} />
        </Fragment>
    );
};

export default App;
