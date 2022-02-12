import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import WidgetHelper from '../../../lib/Core/helper/WidgetHelper.js';

export default class Drag extends DragHelper {
    static get defaultConfig() {
        return {
            // Don't drag the actual cell element, clone it
            cloneTarget        : true,
            mode               : 'translateXY',
            // Only allow drops on scheduled tasks
            dropTargetSelector : '.b-sch-event',
            // Only allow dragging cell elements inside on the equipment grid
            targetSelector     : '.b-grid-row:not(.b-group-row) .b-grid-cell'
        };
    }

    construct(config) {
        const me = this;

        super.construct(config);

        me.on({
            dragstart : me.onEquipmentDragStart,
            drop      : me.onEquipmentDrop,
            thisObj   : me
        });
    }

    onEquipmentDragStart({ event, context }) {
        // save a reference to the equipment so we can access it later
        context.equipment = this.grid.getRecordFromElement(context.grabbed);

        // Prevent tooltips from showing while dragging
        this.schedule.element.classList.add('b-dragging-event');
    }

    onEquipmentDrop({ context }) {
        const me = this;

        if (context.valid) {
            const
                equipment   = context.equipment,
                eventRecord = me.schedule.resolveEventRecord(context.target);

            eventRecord.equipment = eventRecord.equipment.concat(equipment);

            me.context.finalize();

            // Dropped on a scheduled event, display toast
            WidgetHelper.toast(`Added ${equipment.name} to ${eventRecord.name}`);
        }

        me.schedule.element.classList.remove('b-dragging-event');
    }
};
