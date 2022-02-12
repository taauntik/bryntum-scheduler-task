/**
 * The App file. It should stay as simple as possible
 */
import React, { Fragment } from 'react';

import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/scheduler-react';
import Content from './components/Content.js';
import './App.scss';

const App = props => {
    return (
        <Fragment>
            <BryntumDemoHeader
                href="../../../../../#example-frameworks-react-javascript-drag-between-schedulers"
                children={<BryntumThemeCombo />}
            />
            <Content />
        </Fragment>
    );
};

export default App;
