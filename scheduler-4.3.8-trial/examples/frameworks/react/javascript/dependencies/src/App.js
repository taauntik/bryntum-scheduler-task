/**
 * The App file. It should stay as simple as possible
 */
import React, { Fragment } from 'react';
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumThemeCombo
} from '@bryntum/scheduler-react';
import { schedulerConfig } from './AppConfig';
import './App.scss';

const App = () => {
    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-javascript-dependencies"
                children={<BryntumThemeCombo />}
            />
            <BryntumScheduler {...schedulerConfig} />
        </Fragment>
    );
};

export default App;
