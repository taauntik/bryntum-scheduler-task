/**
 * The React App file
 */
import React, { Fragment } from 'react';

import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/scheduler-react';
import Scheduler from './components/Scheduler';
import './App.scss';

const App = props => {
    const headerConfig = {
        href: '../../../../../#example-frameworks-react-javascript-vertical'
    };
    return (
        <Fragment>
            <BryntumDemoHeader {...headerConfig} children = {<BryntumThemeCombo />} />
            <Scheduler />
        </Fragment>
    );
};

export default App;
