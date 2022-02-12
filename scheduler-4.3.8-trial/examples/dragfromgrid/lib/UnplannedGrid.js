import Grid from '../../../lib/Grid/view/Grid.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class UnplannedGrid extends Grid {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    static get $name() {
        return 'UnplannedGrid';
    }

    // Factoryable type name
    static get type() {
        return 'unplannedgrid';
    }

    static get configurable() {
        return {
            features : {
                stripe : true,
                sort   : 'name'
            },

            columns : [{
                text       : 'Unassigned tasks',
                flex       : 1,
                field      : 'name',
                htmlEncode : false,
                renderer   : data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
            }, {
                text     : 'Duration',
                width    : 100,
                align    : 'right',
                editor   : false,
                field    : 'duration',
                renderer : data => StringHelper.xss`${data.record.duration} ${DateHelper.getShortNameOfUnit(data.record.durationUnit)}`
            }],

            rowHeight : 50
        };
    }

    construct(config) {
        super.construct(config);

        this.project.assignmentStore.on({
            // When a task is unassigned move it back to the unplanned tasks grid
            remove({ records }) {
                records.forEach(assignment => {
                    this.project.eventStore.remove(assignment.event);
                    this.store.add(assignment.event);
                });
            },
            thisObj : this
        });
    }
};

// Register this widget type with its Factory
UnplannedGrid.initClass();
