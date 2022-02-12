/**
 * Selected event display in header
 */
import React from 'react';
import { PropTypes } from 'prop-types';

const Selected = props => {
    let selectedEvent = null;

    if (props.selectedEvent) {
        selectedEvent = (
            <label className="selected-event">
                Selected event: <span>{props.selectedEvent}</span>
            </label>
        );
    }

    return selectedEvent;
};

Selected.propTypes = {
    selectedEvent: PropTypes.string
};

export default Selected;
