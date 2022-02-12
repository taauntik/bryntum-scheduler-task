import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import DragHelper from '../../../lib/Core/helper/DragHelper.js';
import DomHelper from '../../../lib/Core/helper/DomHelper.js';
import Rectangle from '../../../lib/Core/helper/util/Rectangle.js';
import WidgetHelper from '../../../lib/Core/helper/WidgetHelper.js';
import Tooltip from '../../../lib/Core/widget/Tooltip.js';

export default class Drag extends DragHelper {
    static get defaultConfig() {
        return {
            // Don't drag the actual row element, clone it
            cloneTarget        : true,
            mode               : 'translateXY',
            // Only allow drops on the schedule area
            dropTargetSelector : '.b-timeline-subgrid',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector     : '.b-grid-row:not(.b-group-row)'
        };
    }

    construct(config) {
        const me = this;

        super.construct(config);

        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        me.scrollManager = me.schedule.scrollManager;

        me.on({
            dragstart : me.onTaskDragStart,
            drag      : me.onTaskDrag,
            drop      : me.onTaskDrop,
            abort     : me.onDragAbort,
            thisObj   : me
        });
    }

    onTaskDragStart({ context }) {
        const
            me           = this,
            { schedule } = me,
            mouseX       = context.clientX,
            proxy        = context.element,
            task         = me.grid.getRecordFromElement(context.grabbed),
            newSize      = schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS);

        // save a reference to the task so we can access it later
        context.task = task;

        // Mutate dragged element (grid row) to look like an event bar
        proxy.classList.remove('b-grid-row');
        proxy.classList.add('b-sch-event-wrap');
        proxy.classList.add('b-sch-event');
        proxy.classList.add('b-unassigned-class');
        proxy.classList.add(`b-${schedule.mode}`);
        proxy.innerHTML = `<i class="${task.iconCls}"></i> ${task.name}`;

        schedule.enableScrollingCloseToEdges(schedule.timeAxisSubGrid);

        if (schedule.isHorizontal) {
            // If the new width is narrower than the grabbed element...
            if (context.grabbed.offsetWidth > newSize) {
                const proxyRect = Rectangle.from(context.grabbed);

                // If the mouse is off (nearly or) the end, centre the element on the mouse
                if (mouseX > proxyRect.x + newSize - 20) {
                    context.newX = context.elementStartX = context.elementX = mouseX - newSize / 2;
                    DomHelper.setTranslateX(proxy, context.newX);
                }
            }

            proxy.style.width = `${newSize}px`;
        }
        else {
            const width = schedule.resourceColumns.columnWidth;

            // Always center horizontal under mouse for vertical mode
            context.newX = context.elementStartX = context.elementX = mouseX - width / 2;
            DomHelper.setTranslateX(proxy, context.newX);

            proxy.style.width = `${width}px`;
            proxy.style.height = `${newSize}px`;
        }

        // Prevent tooltips from showing while dragging
        schedule.element.classList.add('b-dragging-event');

        if (schedule.features.eventDrag.showTooltip) {
            if (!me.tip) {
                me.tip = new Tooltip({
                    align      : 'b-t',
                    clippedBy  : [schedule.timeAxisSubGridElement, schedule.bodyContainer],
                    forElement : context.element,

                    // style : 'pointer-events:none',
                    cls : 'b-popup b-sch-event-tooltip'
                });
            }
        }
    }

    onTaskDrag({ event, context }) {
        const
            me           = this,
            { schedule } = me,
            { task }     = context,
            coordinate   = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            startDate    = schedule.getDateFromCoordinate(coordinate, 'round', false),
            endDate      = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resource     = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
        context.valid &= Boolean(startDate && resource) &&
            (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource));

        // `cls` field is not persistable in the demo
        if (context.resource) {
            context.resource.cls = '';
        }

        if (startDate && resource) {
            resource.cls = 'target-resource';
        }
        // Save reference to resource so we can use it in onTaskDrop
        context.resource = resource;

        if (me.tip && context.valid) {
            const
                dateFormat = schedule.displayDateFormat,
                formattedStartDate = DateHelper.format(startDate, dateFormat),
                formattedEndDate = DateHelper.format(endDate, dateFormat);

            me.tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-startdate">${formattedStartDate}</div>
                <div class="b-sch-tooltip-enddate">${formattedEndDate}</div>
            `;
            me.tip.showBy(context.element);
        }
        else {
            me.tip?.hide();
        }
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)
    onTaskDrop({ context, event }) {
        const
            me                         = this,
            { schedule }               = me,
            { task, target, resource, valid, element } = context;

        me.tip?.hide();

        schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (valid && target) {
            const
                coordinate        = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
                date              = schedule.getDateFromCoordinate(coordinate, 'round', false),
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = schedule.resolveEventRecord(target);

            if (date) {
                // Remove from grid first so that the data change
                // below does not fire events into the grid.
                me.grid.store.remove(task);

                task.startDate = date;

                task.assign(resource);
                schedule.eventStore.add(task);
            }

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                WidgetHelper.toast(`Dropped on ${targetEventRecord.name}`);
            }

            context.finalize();
        }
        else {
            me.abort();
        }

        if (resource) {
            resource.cls = '';
        }

        schedule.element.classList.remove('b-dragging-event');
    }

    set schedule(schedule) {
        this._schedule = schedule;

        // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging
        this.scrollManager = schedule.scrollManager;
    }

    get schedule() {
        return this._schedule;
    }

    onDragAbort() {
        this.tip?.hide();
    }
};
