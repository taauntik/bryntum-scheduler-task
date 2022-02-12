/**
 *   Defines a simple React button
 */

import React from 'react';
import { PropTypes } from 'prop-types';

const DemoButton = props => {
    return <button {...props}>{props.text}</button>;
};

DemoButton.propTypes = {
    onClick   : PropTypes.func.isRequired,
    text      : PropTypes.string,
    className : PropTypes.string,
    style     : PropTypes.object
};

DemoButton.defaultProps = {
    text      : 'Demo Button',
    className : 'b-button b-deep-orange',
    style     : { width: '100%' }
};

export default DemoButton;
