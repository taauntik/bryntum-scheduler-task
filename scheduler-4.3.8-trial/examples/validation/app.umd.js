"use strict";

var {
  ResourceModel,
  EventModel,
  DateHelper,
  Scheduler,
  Toast,
  MessageDialog,
  StringHelper
} = bryntum.scheduler;

class Employee extends ResourceModel {
  static get fields() {
    return [{
      name: 'available',
      type: 'boolean',
      defaultValue: true
    }, {
      name: 'statusMessage',
      defaultValue: 'Gone fishing'
    }];
  }

  get cls() {
    return this.available ? '' : 'unavailable';
  }

}

class Task extends EventModel {
  static get fields() {
    return ['type'];
  }

  get dragValidationText() {
    const {
      resource,
      type
    } = this;
    let result = '';

    switch (type) {
      case 'Golf':
        result = 'Only C-suite people can play Golf';
        break;

      case 'Meeting':
        result = `Only ${resource.role} can participate in meetings`;
        break;

      case 'Coding':
        result = `Only ${resource.role} can do coding`;
        break;

      case 'Sales':
        result = `Only ${resource.role} can prepare marketing strategies`;
        break;

      case 'Fixed':
        result = 'Fixed time event - may be reassigned, but not rescheduled';
        break;
    }

    return result;
  }

  get resizeValidationText() {
    let result = '';

    switch (this.type) {
      case 'Golf':
        result = 'Golf game has always fixed duration';
        break;

      case 'Coding':
        result = 'Programming task duration cannot be shortened';
        break;
    }

    return result;
  }

}

const scheduler = new Scheduler({
  appendTo: 'container',
  // don't allow tasks to overlap
  allowOverlap: false,
  resourceImagePath: '../_shared/images/users/',
  features: {
    stripe: true,
    timeRanges: true,
    eventTooltip: {
      template: data => {
        const task = data.eventRecord;
        return `
                    ${task.name ? StringHelper.xss`<div class="b-sch-event-title">${task.name}</div>` : ''}
                    ${data.startClockHtml}
                    ${data.endClockHtml}
                    ${task.dragValidationText || task.resizeValidationText ? `<div class="restriction-title"><b>Restrictions:</b></div>
                    <ul class="restriction-list">
                        ${task.dragValidationText ? `<li>${task.dragValidationText}</li>` : ''}
                        ${task.resizeValidationText ? `<li>${task.resizeValidationText}</li>` : ''}
                    </ul>` : ''}
                `;
      }
    },
    eventDrag: {
      validatorFn({
        draggedRecords,
        newResource
      }) {
        const task = draggedRecords[0],
              isValid = task.type === 'Fixed' || // Only C-suite people can play Golf
        task.type === 'Golf' && ['CEO', 'CTO'].includes(newResource.role) || // Tasks that have type defined cannot be assigned to another resource type
        !(task.type && newResource.role !== task.resource.role);
        return {
          valid: newResource.available && isValid,
          message: !newResource.available ? newResource.statusMessage : !isValid ? task.dragValidationText : ''
        };
      }

    },
    eventResize: {
      validatorFn({
        eventRecord: task,
        endDate,
        startDate
      }) {
        const originalDuration = task.endDate - task.startDate,
              isValid = !(task.type === 'Golf' || task.type === 'Coding' && originalDuration > endDate - startDate);
        return {
          valid: isValid,
          message: isValid ? '' : task.resizeValidationText
        };
      }

    },
    eventDragCreate: {
      validatorFn({
        resourceRecord: resource
      }) {
        return {
          valid: resource.available,
          message: resource.available ? '' : resource.statusMessage
        };
      }

    }
  },
  subGridConfigs: {
    locked: {
      width: 350
    }
  },
  columns: [{
    type: 'resourceInfo',
    text: 'Staff'
  }, {
    text: 'Role',
    field: 'role',
    flex: 1,
    editor: {
      type: 'combo',
      items: ['Sales', 'Developer', 'Marketing', 'Product manager'],
      editable: false,
      pickerWidth: 140
    }
  }, {
    text: 'Available',
    type: 'check',
    field: 'available'
  }],
  crudManager: {
    autoLoad: true,
    eventStore: {
      modelClass: Task
    },
    resourceStore: {
      modelClass: Employee
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    },
    // This config enables CrudManager responses validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true
  },
  barMargin: 2,
  rowHeight: 50,
  startDate: new Date(2019, 1, 7, 8),
  endDate: new Date(2019, 1, 7, 22),
  viewPreset: {
    base: 'hourAndDay',
    tickWidth: 100
  },
  multiEventSelect: true,
  // Specialized body template with header and footer
  eventBodyTemplate: data => `${data.iconCls ? `<i class="${data.iconCls}"></i>` : ''}` + StringHelper.xss`<section>
            <div class="b-sch-event-header">${data.headerText}</div>
            <div class="b-sch-event-footer">${data.footerText}</div>
        </section>
    `,

  eventRenderer({
    eventRecord,
    resourceRecord,
    renderData
  }) {
    return {
      headerText: DateHelper.format(eventRecord.startDate, 'LT'),
      footerText: eventRecord.name || '',
      iconCls: eventRecord.iconCls
    };
  },

  listeners: {
    beforeEventAdd({
      resourceRecords
    }) {
      const [resource] = resourceRecords,
            available = resource.available;

      if (!available) {
        Toast.show(`Resource not available: ${resource.statusMessage}`);
      }

      return available;
    },

    beforeEventDrag({
      eventRecord
    }) {
      // Only Henrik can be assigned Marketing tasks.
      // constrainDragToResource prevents dragging up or down.
      scheduler.features.eventDrag.constrainDragToResource = eventRecord.type === 'Marketing' && eventRecord.resource.name === 'Henrik'; // Events with type Fixed must not change time slot.

      scheduler.features.eventDrag.constrainDragToTimeSlot = eventRecord.type === 'Fixed';
    },

    async beforeEventDropFinalize({
      source: scheduler,
      context
    }) {
      if (scheduler.confirmationsEnabled) {
        context.async = true;
        const namesInQuotes = context.draggedRecords.map(eventRecord => `"${StringHelper.encodeHtml(eventRecord.name)}"`),
              result = await MessageDialog.confirm({
          title: 'Please confirm',
          message: `${namesInQuotes.join(', ')} ${namesInQuotes.length > 1 ? 'were' : 'was'} moved. Allow this operation?`
        }); // `true` to accept the changes or `false` to reject them

        context.finalize(result === MessageDialog.yesButton);
      }
    },

    async beforeeventresizefinalize({
      source: scheduler,
      context
    }) {
      if (scheduler.confirmationsEnabled) {
        context.async = true;
        const eventRecord = context.eventRecord,
              result = await MessageDialog.confirm({
          title: 'Please confirm',
          message: StringHelper.xss`"${eventRecord.name}" duration changed. Allow this operation?`
        }); // `true` to accept the changes or `false` to reject them

        context.finalize(result === MessageDialog.yesButton);
      }
    }

  },
  tbar: [{
    type: 'button',
    ref: 'confirmationBtn',
    text: 'Enable confirmations',
    toggleable: true,
    icon: 'b-fa-square',
    pressedIcon: 'b-fa-check-square',
    onAction: ({
      source: button
    }) => scheduler.confirmationsEnabled = button.pressed
  }, {
    type: 'button',
    ref: 'lockBtn',
    text: 'Read only',
    toggleable: true,
    icon: 'b-fa-square',
    pressedIcon: 'b-fa-check-square',
    onAction: ({
      source: button
    }) => scheduler.readOnly = button.pressed
  }]
});