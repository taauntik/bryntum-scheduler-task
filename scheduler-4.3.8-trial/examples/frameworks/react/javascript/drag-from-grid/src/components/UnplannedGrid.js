/**
 * Grid with unplanned tasks. This is just a react wrapper.
 */
// libraries
import React, { Component } from 'react';

// our stuff
import UnplannedGrid from '../lib/UnplannedGrid.js';
import Task from '../lib/Task.js';

class UnplannedGridComponent extends Component {

    componentDidMount() {
        this.unplannedGrid = new UnplannedGrid({
            appendTo   : 'unplannedContainer',
            eventStore : this.props.eventStore,
            store      : {
                modelClass : Task,
                readUrl    : 'data/unplanned.json',
                autoLoad   : true
            }
        });
    }

    render() {
        return (<div id="unplannedContainer"></div>);
    }
};

export default UnplannedGridComponent;
