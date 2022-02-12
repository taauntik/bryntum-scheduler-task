/**
 * Page header container component
 *
 * It contains also controls (tools).
 * It is implemented as a functional component using React hooks that
 * were introduced in React 16.8.0. If you cannot upgrade to that or
 * later version of React then you must convert this component to class.
 */
// libraries
import React, { Fragment } from 'react';
import { BryntumDemoHeader, BryntumThemeCombo } from '@bryntum/scheduler-react';

// our stuff
import LocaleCombo from './LocaleCombo.js';

const Header = props => {
    const headerConfig = {
        title: props.title || document.title || '',
        href: props.titleHref || '#'
    };
    return (
        <BryntumDemoHeader
            {...headerConfig}
            children={
                <Fragment>
                    <LocaleCombo />
                    <BryntumThemeCombo />
                </Fragment>
            }
        />
    );
};

export default Header;
