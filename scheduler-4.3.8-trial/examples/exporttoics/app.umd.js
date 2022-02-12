"use strict";

var {
  Scheduler
} = bryntum.scheduler;
const scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'border',
  resourceImagePath: '../_shared/images/users/',
  enableRecurringEvents: true,
  fillTicks: true,
  features: {
    eventEdit: {
      items: {
        locationField: {
          type: 'text',
          name: 'location',
          label: 'Location',
          weight: 120
        },
        // Add a button to export the event in the editor window
        exportButton: {
          type: 'button',
          icon: 'b-fa b-fa-calendar-alt',
          text: 'Add to Outlook (.ics)',
          weight: 700,

          onClick() {
            const eventRecord = scheduler.features.eventEdit.eventRecord; // Add some custom ICS values (See https://tools.ietf.org/html/rfc5545 for more information)

            eventRecord.exportToICS({
              LOCATION: eventRecord.location
            });
          }

        }
      }
    },
    eventMenu: {
      items: {
        // Add export option
        exportToIcs: {
          text: 'Export to iCal',
          icon: 'b-fa b-fa-calendar-alt',

          onItem({
            eventRecord
          }) {
            // Add some custom ICS values (See https://tools.ietf.org/html/rfc5545 for more information)
            eventRecord.exportToICS({
              LOCATION: eventRecord.location
            });
          }

        }
      }
    }
  },
  columns: [{
    type: 'resourceInfo',
    text: 'Staff'
  }],
  crudManager: {
    autoLoad: true,
    transport: {
      load: {
        url: 'data/data.json'
      }
    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true
  },
  barMargin: 2,
  rowHeight: 50,
  startDate: new Date(2020, 10, 9),
  endDate: new Date(2020, 10, 19),
  viewPreset: {
    base: 'dayAndWeek',
    tickWidth: 100
  }
});