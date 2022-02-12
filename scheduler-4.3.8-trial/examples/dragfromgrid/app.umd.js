"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var {
  DateHelper,
  DragHelper,
  DomHelper,
  Rectangle,
  WidgetHelper,
  Tooltip,
  Combo,
  Scheduler,
  EventModel,
  EventStore,
  Grid,
  StringHelper,
  Splitter,
  ResourceModel
} = bryntum.scheduler;

class Drag extends DragHelper {
  static get defaultConfig() {
    return {
      // Don't drag the actual row element, clone it
      cloneTarget: true,
      mode: 'translateXY',
      // Only allow drops on the schedule area
      dropTargetSelector: '.b-timeline-subgrid',
      // Only allow drag of row elements inside on the unplanned grid
      targetSelector: '.b-grid-row:not(.b-group-row)'
    };
  }

  construct(config) {
    const me = this;
    super.construct(config); // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging

    me.scrollManager = me.schedule.scrollManager;
    me.on({
      dragstart: me.onTaskDragStart,
      drag: me.onTaskDrag,
      drop: me.onTaskDrop,
      abort: me.onDragAbort,
      thisObj: me
    });
  }

  onTaskDragStart({
    context
  }) {
    const me = this,
          {
      schedule
    } = me,
          mouseX = context.clientX,
          proxy = context.element,
          task = me.grid.getRecordFromElement(context.grabbed),
          newSize = schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS); // save a reference to the task so we can access it later

    context.task = task; // Mutate dragged element (grid row) to look like an event bar

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
        const proxyRect = Rectangle.from(context.grabbed); // If the mouse is off (nearly or) the end, centre the element on the mouse

        if (mouseX > proxyRect.x + newSize - 20) {
          context.newX = context.elementStartX = context.elementX = mouseX - newSize / 2;
          DomHelper.setTranslateX(proxy, context.newX);
        }
      }

      proxy.style.width = `${newSize}px`;
    } else {
      const width = schedule.resourceColumns.columnWidth; // Always center horizontal under mouse for vertical mode

      context.newX = context.elementStartX = context.elementX = mouseX - width / 2;
      DomHelper.setTranslateX(proxy, context.newX);
      proxy.style.width = `${width}px`;
      proxy.style.height = `${newSize}px`;
    } // Prevent tooltips from showing while dragging


    schedule.element.classList.add('b-dragging-event');

    if (schedule.features.eventDrag.showTooltip) {
      if (!me.tip) {
        me.tip = new Tooltip({
          align: 'b-t',
          clippedBy: [schedule.timeAxisSubGridElement, schedule.bodyContainer],
          forElement: context.element,
          // style : 'pointer-events:none',
          cls: 'b-popup b-sch-event-tooltip'
        });
      }
    }
  }

  onTaskDrag({
    event,
    context
  }) {
    const me = this,
          {
      schedule
    } = me,
          {
      task
    } = context,
          coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
          startDate = schedule.getDateFromCoordinate(coordinate, 'round', false),
          endDate = startDate && DateHelper.add(startDate, task.duration, task.durationUnit),
          // Coordinates required when used in vertical mode, since it does not use actual columns
    resource = context.target && schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]); // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource

    context.valid &= Boolean(startDate && resource) && (schedule.allowOverlap || schedule.isDateRangeAvailable(startDate, endDate, null, resource)); // `cls` field is not persistable in the demo

    if (context.resource) {
      context.resource.cls = '';
    }

    if (startDate && resource) {
      resource.cls = 'target-resource';
    } // Save reference to resource so we can use it in onTaskDrop


    context.resource = resource;

    if (me.tip && context.valid) {
      const dateFormat = schedule.displayDateFormat,
            formattedStartDate = DateHelper.format(startDate, dateFormat),
            formattedEndDate = DateHelper.format(endDate, dateFormat);
      me.tip.html = `
                <div class="b-sch-event-title">${task.name}</div>
                <div class="b-sch-tooltip-startdate">${formattedStartDate}</div>
                <div class="b-sch-tooltip-enddate">${formattedEndDate}</div>
            `;
      me.tip.showBy(context.element);
    } else {
      var _me$tip;

      (_me$tip = me.tip) === null || _me$tip === void 0 ? void 0 : _me$tip.hide();
    }
  } // Drop callback after a mouse up, take action and transfer the unplanned task to the real EventStore (if it's valid)


  onTaskDrop({
    context,
    event
  }) {
    var _me$tip2;

    const me = this,
          {
      schedule
    } = me,
          {
      task,
      target,
      resource,
      valid,
      element
    } = context;
    (_me$tip2 = me.tip) === null || _me$tip2 === void 0 ? void 0 : _me$tip2.hide();
    schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid); // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store

    if (valid && target) {
      const coordinate = DomHelper[`getTranslate${schedule.isHorizontal ? 'X' : 'Y'}`](element),
            date = schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Try resolving event record from target element, to determine if drop was on another event
      targetEventRecord = schedule.resolveEventRecord(target);

      if (date) {
        // Remove from grid first so that the data change
        // below does not fire events into the grid.
        me.grid.store.remove(task);
        task.startDate = date;
        task.assign(resource);
        schedule.eventStore.add(task);
      } // Dropped on a scheduled event, display toast


      if (targetEventRecord) {
        WidgetHelper.toast(`Dropped on ${targetEventRecord.name}`);
      }

      context.finalize();
    } else {
      me.abort();
    }

    if (resource) {
      resource.cls = '';
    }

    schedule.element.classList.remove('b-dragging-event');
  }

  set schedule(schedule) {
    this._schedule = schedule; // Configure DragHelper with schedule's scrollManager to allow scrolling while dragging

    this.scrollManager = schedule.scrollManager;
  }

  get schedule() {
    return this._schedule;
  }

  onDragAbort() {
    var _this$tip;

    (_this$tip = this.tip) === null || _this$tip === void 0 ? void 0 : _this$tip.hide();
  }

}

; // Custom combo containing icons to pick from

class IconCombo extends Combo {
  static get type() {
    return 'iconcombo';
  }

  static get defaultConfig() {
    return {
      items: [{
        value: 'b-fa b-fa-asterisk',
        text: 'Asterisk'
      }, {
        value: 'b-fa b-fa-fw b-fa-beer',
        text: 'Beer'
      }, {
        value: 'b-fa b-fa-fw b-fa-book',
        text: 'Book'
      }, {
        value: 'b-fa b-fa-fw b-fa-bug',
        text: 'Bug'
      }, {
        value: 'b-fa b-fa-building',
        text: 'Building'
      }, {
        value: 'b-fa b-fa-coffee',
        text: 'Coffee'
      }, {
        value: 'b-fa b-fa-fw b-fa-cog',
        text: 'Cog'
      }, {
        value: 'b-fa b-fa-fw b-fa-dumbbell',
        text: 'Dumbbell'
      }, {
        value: 'b-fa b-fa-laptop',
        text: 'Laptop'
      }, {
        value: 'b-fa b-fa-fw b-fa-plane',
        text: 'Plane'
      }, {
        value: 'b-fa b-fa-fw b-fa-phone',
        text: 'Phone'
      }, {
        value: 'b-fa b-fa-fw b-fa-question',
        text: 'Question'
      }, {
        value: 'b-fa b-fa-fw b-fa-life-ring',
        text: 'Ring'
      }, {
        value: 'b-fa b-fa-sync',
        text: 'Sync'
      }, {
        value: 'b-fa b-fa-user',
        text: 'User'
      }, {
        value: 'b-fa b-fa-users',
        text: 'Users'
      }, {
        value: 'b-fa b-fa-video',
        text: 'Video'
      }],
      listItemTpl: item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
    };
  }

  syncInputFieldValue(...args) {
    this.icon.className = this.value;
    super.syncInputFieldValue(...args);
  }

  get innerElements() {
    return [{
      reference: 'icon',
      tag: 'i',
      className: 'b-fa b-fa-cog',
      style: {
        marginLeft: '.8em',
        marginRight: '-.3em'
      }
    }, ...super.innerElements];
  }

} // Register class to be able to create widget by type


IconCombo.initClass();

class Schedule extends Scheduler {
  /**
   * Original class name getter. See Widget.$name docs for the details.
   * @return {string}
   */
  static get $name() {
    return 'Schedule';
  } // Factoryable type name


  static get type() {
    return 'schedule';
  }

  static get defaultConfig() {
    return {
      // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
      autoRescheduleTasks: false,
      features: {
        stripe: true,
        timeRanges: true,
        eventMenu: {
          items: {
            // Custom item with inline handler
            unassign: {
              text: 'Unassign',
              icon: 'b-fa b-fa-user-times',
              weight: 200,
              onItem: ({
                eventRecord
              }) => eventRecord.unassign()
            }
          }
        },
        eventEdit: {
          items: {
            // Custom field for picking icon
            iconCls: {
              type: 'iconcombo',
              // Name should match a record field, to read and write value from that field
              name: 'iconCls',
              label: 'Icon',
              weight: 200
            }
          }
        }
      },
      rowHeight: 50,
      barMargin: 4,
      eventColor: 'indigo',
      columns: [{
        type: 'resourceInfo',
        text: 'Name',
        width: 200,
        showEventCount: false,
        showRole: true
      }, {
        text: 'Nbr tasks',
        editor: false,
        renderer: data => `${data.record.events.length || ''}`,
        align: 'center',
        sortable: (a, b) => a.events.length < b.events.length ? -1 : 1,
        width: 100
      }],
      // Custom view preset with header configuration
      viewPreset: {
        base: 'hourAndDay',
        columnLinesFor: 0,
        headers: [{
          unit: 'd',
          align: 'center',
          dateFormat: 'ddd DD MMM'
        }, {
          unit: 'h',
          align: 'center',
          dateFormat: 'HH'
        }]
      },
      // Only used in vertical mode
      resourceColumns: {
        columnWidth: 120
      },
      // Do not remove event when unassigning, we want to add it to grid instead
      removeUnassignedEvent: false,
      resourceImagePath: '../_shared/images/users/'
    };
  }

  set autoRescheduleTasks(autoRescheduleTasks) {
    this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
  }

}

;
Schedule.initClass();

class Task extends EventModel {
  static get $$name() {
    return 'Task';
  }

  static get defaults() {
    return {
      // In this demo, default duration for tasks will be hours (instead of days)
      durationUnit: 'h',
      // Use a default name, for better look in the grid if unassigning a new event
      name: 'New event',
      // Use a default icon also
      iconCls: 'b-fa b-fa-asterisk'
    };
  }

}

class TaskStore extends EventStore {
  static get defaultConfig() {
    return {
      modelClass: Task
    };
  } // Override add to reschedule any overlapping events caused by the add


  add(records, silent = false) {
    const me = this;

    if (me.autoRescheduleTasks) {
      // Flag to avoid rescheduling during rescheduling
      me.isRescheduling = true;
      me.beginBatch();
    }

    if (!Array.isArray(records)) {
      records = [records];
    }

    super.add(records, silent);

    if (me.autoRescheduleTasks) {
      me.endBatch();
      me.isRescheduling = false;
    }
  } // Auto called when triggering the update event.
  // Reschedule if the update caused the event to overlap any others.


  onUpdate({
    record
  }) {
    if (this.autoRescheduleTasks && !this.isRescheduling) {
      this.rescheduleOverlappingTasks(record);
    }
  }

  rescheduleOverlappingTasks(eventRecord) {
    if (eventRecord.resource) {
      const futureEvents = [],
            earlierEvents = []; // Split tasks into future and earlier tasks

      eventRecord.resource.events.forEach(event => {
        if (event !== eventRecord) {
          if (event.startDate >= eventRecord.startDate) {
            futureEvents.push(event);
          } else {
            earlierEvents.push(event);
          }
        }
      });

      if (futureEvents.length || earlierEvents.length) {
        futureEvents.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
        earlierEvents.sort((a, b) => a.startDate > b.startDate ? -1 : 1);
        futureEvents.forEach((ev, i) => {
          const prev = futureEvents[i - 1] || eventRecord;
          ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
        }); // Walk backwards and remove any overlap

        [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
          const prev = all[i - 1];

          if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
            ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
          }
        });
        this.isRescheduling = false;
      }
    }
  }

}

;

class UnplannedGrid extends Grid {
  /**
   * Original class name getter. See Widget.$name docs for the details.
   * @return {string}
   */
  static get $name() {
    return 'UnplannedGrid';
  } // Factoryable type name


  static get type() {
    return 'unplannedgrid';
  }

  static get configurable() {
    return {
      features: {
        stripe: true,
        sort: 'name'
      },
      columns: [{
        text: 'Unassigned tasks',
        flex: 1,
        field: 'name',
        htmlEncode: false,
        renderer: data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
      }, {
        text: 'Duration',
        width: 100,
        align: 'right',
        editor: false,
        field: 'duration',
        renderer: data => StringHelper.xss`${data.record.duration} ${DateHelper.getShortNameOfUnit(data.record.durationUnit)}`
      }],
      rowHeight: 50
    };
  }

  construct(config) {
    super.construct(config);
    this.project.assignmentStore.on({
      // When a task is unassigned move it back to the unplanned tasks grid
      remove({
        records
      }) {
        records.forEach(assignment => {
          this.project.eventStore.remove(assignment.event);
          this.store.add(assignment.event);
        });
      },

      thisObj: this
    });
  }

}

; // Register this widget type with its Factory

UnplannedGrid.initClass();

class CustomResourceModel extends ResourceModel {
  static get $name() {
    return 'CustomResourceModel';
  }

  static get fields() {
    return [// Do not persist `cls` field because we change its value on dragging unplanned resources to highlight the row
    {
      name: 'cls',
      persist: false
    }];
  }

}

let schedule = new Schedule({
  ref: 'schedule',
  insertFirst: 'main',
  startDate: new Date(2025, 11, 1, 8),
  endDate: new Date(2025, 11, 1, 18),
  flex: 1,
  crudManager: {
    autoLoad: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
    eventStore: {
      storeClass: TaskStore
    },
    resourceStore: {
      modelClass: CustomResourceModel
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    }
  },
  tbar: ['Schedule view', '->', {
    type: 'button',
    toggleable: true,
    icon: 'b-fa-calendar',
    pressedIcon: 'b-fa-calendar-check',
    text: 'Automatic rescheduling',
    tooltip: 'Toggles whether to automatically reschedule overlapping tasks',
    cls: 'reschedule-button',

    onToggle({
      pressed
    }) {
      schedule.autoRescheduleTasks = pressed;
    }

  }, {
    type: 'buttonGroup',
    toggleGroup: true,
    items: [{
      icon: 'b-fa-fw b-fa-arrows-alt-v',
      pressed: 'up.isVertical',
      tooltip: 'Vertical mode',
      schedulerConfig: {
        mode: 'vertical'
      }
    }, {
      icon: 'b-fa-fw b-fa-arrows-alt-h',
      pressed: 'up.isHorizontal',
      tooltip: 'Horizontal mode',
      schedulerConfig: {
        mode: 'horizontal'
      }
    }],

    onAction({
      source: button
    }) {
      const newConfig = _objectSpread(_objectSpread({}, schedule.initialConfig), button.schedulerConfig); // Recreate the scheduler to switch orientation


      schedule.destroy();
      schedule = new Schedule(newConfig); // Provide drag helper a reference to the new instance

      drag.schedule = schedule;
    }

  }]
});
new Splitter({
  appendTo: 'main'
});
const unplannedGrid = new UnplannedGrid({
  ref: 'unplanned',
  appendTo: 'main',
  title: 'Unplanned Tasks',
  collapsible: true,
  flex: '0 0 300px',
  ui: 'toolbar',
  // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
  project: schedule.project,
  store: {
    modelClass: Task,
    readUrl: 'data/unplanned.json',
    autoLoad: true
  }
});
const drag = new Drag({
  grid: unplannedGrid,
  schedule,
  constrain: false,
  outerElement: unplannedGrid.element
});