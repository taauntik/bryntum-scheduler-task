"use strict";

var {
  DragHelper,
  WidgetHelper,
  Grid,
  StringHelper,
  Scheduler,
  DateHelper,
  EventModel,
  AjaxStore
} = bryntum.scheduler;

class Drag extends DragHelper {
  static get defaultConfig() {
    return {
      // Don't drag the actual cell element, clone it
      cloneTarget: true,
      mode: 'translateXY',
      // Only allow drops on scheduled tasks
      dropTargetSelector: '.b-sch-event',
      // Only allow dragging cell elements inside on the equipment grid
      targetSelector: '.b-grid-row:not(.b-group-row) .b-grid-cell'
    };
  }

  construct(config) {
    const me = this;
    super.construct(config);
    me.on({
      dragstart: me.onEquipmentDragStart,
      drop: me.onEquipmentDrop,
      thisObj: me
    });
  }

  onEquipmentDragStart({
    event,
    context
  }) {
    // save a reference to the equipment so we can access it later
    context.equipment = this.grid.getRecordFromElement(context.grabbed); // Prevent tooltips from showing while dragging

    this.schedule.element.classList.add('b-dragging-event');
  }

  onEquipmentDrop({
    context
  }) {
    const me = this;

    if (context.valid) {
      const equipment = context.equipment,
            eventRecord = me.schedule.resolveEventRecord(context.target);
      eventRecord.equipment = eventRecord.equipment.concat(equipment);
      me.context.finalize(); // Dropped on a scheduled event, display toast

      WidgetHelper.toast(`Added ${equipment.name} to ${eventRecord.name}`);
    }

    me.schedule.element.classList.remove('b-dragging-event');
  }

}

;

class EquipmentGrid extends Grid {
  /**
   * Original class name getter. See Widget.$name docs for the details.
   * @return {string}
   */
  static get $name() {
    return 'EquipmentGrid';
  } // Factoryable type name


  static get type() {
    return 'equipmentgrid';
  }

  static get defaultConfig() {
    return {
      features: {
        filterBar: true,
        cellEdit: false
      },
      rowHeight: 100,
      columns: [{
        text: '',
        field: 'name',
        htmlEncode: false,
        cellCls: 'b-equipment',
        renderer: data => StringHelper.xss`<i class="${data.record.iconCls}"></i>${data.record.name}`
      }]
    };
  }

}

; // Register this widget type with its Factory

EquipmentGrid.initClass();

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
      features: {
        eventMenu: {
          items: [// custom item with inline handler
          {
            text: 'Remove all equipment',
            icon: 'b-fa b-fa-times',
            weight: 200,
            onItem: ({
              eventRecord
            }) => eventRecord.equipment = []
          }]
        },
        eventEdit: {
          // Add an extra combo box to the editor to select equipment
          items: {
            equipment: {
              type: 'combo',
              weight: 900,
              // At end
              editable: false,
              multiSelect: true,
              valueField: 'id',
              displayField: 'name',
              ref: 'equipment',
              name: 'equipment',
              label: 'Equipment',
              // Will be populated with items on first show
              items: []
            }
          }
        }
      },
      rowHeight: 100,
      barMargin: 4,
      eventColor: 'indigo',
      resourceImagePath: '../_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Name',
        width: 200,
        showEventCount: false,
        showRole: true
      }],
      // The crud manager will load all its data (resource + events) in one ajax request
      crudManager: {
        autoLoad: true,
        transport: {
          load: {
            url: 'data/data.json'
          }
        }
      },
      // Custom view preset with header configuration
      viewPreset: {
        base: 'hourAndDay',
        columnLinesFor: 0,
        mainHeaderLevel: 1,
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
      // Render some extra elements for the assignment equipment items
      eventBodyTemplate: data => `
                <div class="b-sch-event-header">${data.date} - ${StringHelper.encodeHtml(data.name)}</div>
                <ul class="b-sch-event-footer">
                    ${data.equipment.map(item => `<li title="${StringHelper.encodeHtml(item.name)}" class="${item.iconCls}"></li>`).join('')}
                </ul>
            `,

      eventRenderer({
        eventRecord
      }) {
        return {
          date: DateHelper.format(eventRecord.startDate, 'LT'),
          name: eventRecord.name || '',
          equipment: eventRecord.equipment.map(itemId => this.equipmentStore.getById(itemId) || {})
        };
      }

    };
  }

  construct(config) {
    const me = this;
    super.construct(config);
    me.on({
      eventEditBeforeSetRecord: me.onBeforeRecordLoaded,
      thisObj: me,
      once: true
    });
    me.equipmentStore.on('load', me.onEquipmentStoreLoad, me);
  } // Populate the equipment combo first time editor is shown


  onBeforeRecordLoaded({
    source: editor
  }) {
    const equipmentCombo = editor.widgetMap.equipment;

    if (!equipmentCombo.items.length) {
      equipmentCombo.items = this.equipmentStore.getRange();
    }
  }

  onEquipmentStoreLoad() {
    // Setup the data for the equipment combo inside the event editor
    // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
    this.refreshRows();
  }

}

; // Register this widget type with its Factory

Schedule.initClass();

class Task extends EventModel {
  static get fields() {
    return ['equipment'];
  }

  static get defaults() {
    return {
      // in this demo, default duration for tasks will be hours (instead of days)
      durationUnit: 'h',
      equipment: []
    };
  }

}

const equipmentStore = new AjaxStore({
  modelClass: Task,
  readUrl: 'data/equipment.json',
  sorters: [{
    field: 'name',
    ascending: true
  }]
});
const schedule = new Schedule({
  ref: 'schedule',
  appendTo: 'bodycontainer',
  startDate: new Date(2017, 11, 1, 8),
  endDate: new Date(2017, 11, 1, 18),
  equipmentStore,
  crudManager: {
    autoLoad: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
    eventStore: {
      modelClass: Task
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    }
  }
});
equipmentStore.load(); // Create our list of equipment

const equipmentGrid = new EquipmentGrid({
  ref: 'equipment',
  appendTo: 'bodycontainer',
  eventStore: schedule.eventStore,
  // Use a chained Store to avoid its filtering to interfere with Scheduler's rendering
  store: equipmentStore.chain()
});
const drag = new Drag({
  grid: equipmentGrid,
  schedule,
  outerElement: equipmentGrid.element
});