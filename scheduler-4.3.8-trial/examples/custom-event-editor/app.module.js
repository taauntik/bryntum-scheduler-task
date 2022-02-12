import { Toast, ArrayHelper, DateHelper, Scheduler, EventModel } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';
/* eslint-disable no-unused-vars,no-undef */

// Will hold record currently being edited
let editingRecord = null;

class Match extends EventModel {
    static get fields() {
        return [
            { name : 'duration', defaultValue : 3 },
            { name : 'durationUnit', defaultValue : 'h' }
        ];
    }
}

const scheduler = new Scheduler({
    appendTo              : 'container',
    startDate             : new Date(2020, 8, 18),
    endDate               : new Date(2020, 8, 29),
    viewPreset            : 'dayAndWeek',
    rowHeight             : 85,
    barMargin             : 0,
    fillTicks             : true,
    tickSize              : 215,
    createEventOnDblClick : false,
    // These are set to null to have less default styling from Scheduler interfering with custom CSS.
    // Makes life easier when you are creating a custom look
    eventColor            : null,
    eventStyle            : null,

    // CrudManager is used to load data to all stores in one go (Events, Resources and Assignments)
    crudManager : {
        autoLoad : true,

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true,

        eventStore : {
            // Provide our custom event model representing a single match
            modelClass : Match
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },

    features : {
        // Features disabled to give a better demo experience
        eventDragCreate : false,
        eventResize     : false,
        columnLines     : false,
        // Initial sort
        sort            : 'name'
    },

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    // A custom eventRenderer, used to generate the contents of the events
    eventRenderer({ eventRecord, assignmentRecord, renderData }) {
        const
            { resources } = eventRecord,
            // 19:00
            startTime     = DateHelper.format(eventRecord.startDate, 'HH:mm'),
            // First resource is the home team, second the away
            [home, away]  = resources,
            // If the assignment being rendered is the home team, this is a home game
            homeGame      = assignmentRecord.resource === home;

        // Different icons depending on if the game is at home or away
        renderData.iconCls = homeGame ? 'b-fa b-fa-hockey-puck' : 'b-fa b-fa-shuttle-van';

        // HTML config:
        // <div class="time">19:00</div>
        // Home - Away
        // <div class="arena">Arena name</div>
        return {
            children : [
                {
                    className : 'time',
                    text      : startTime
                },
                {
                    text : `${home.name} - ${away?.name || 'TBD'}`
                },
                {
                    className : 'arena',
                    text      : home.arena
                }
            ]
        };
    },

    listeners : {
        // Listener called before the built in editor is shown
        beforeEventEdit({ eventRecord, resourceRecord }) {
            const teams = eventRecord.resources;
            // Show custom editor
            $('#customEditor').modal('show');

            // Fill its fields
            if (teams.length === 0) {
                // New match being created
                $('#home').val(resourceRecord.id);
            }
            else {
                $('#home').val(teams[0].id);
                $('#away').val(teams[1]?.id || '');
            }
            $('#startDate').val(DateHelper.format(eventRecord.startDate, 'YYYY-MM-DD'));
            $('#startTime').val(DateHelper.format(eventRecord.startDate, 'HH:mm'));

            // Store record being edited, to be able to write changes back to it later
            editingRecord = eventRecord;

            // Prevent built in editor
            return false;
        }
    }
});

// If they exit *not* via the save click, remove any provisional record added via context menu
$('#customEditor').on('focusout', e => {
    // Focus has exited the modal popup
    if (!e.currentTarget.contains(e.relatedTarget)) {
        if (editingRecord.isCreating) {
            editingRecord.remove();
        }
    }
});

// When clicking save in the custom editor
$('#save').on('click', () => {
    const
        {
            assignmentStore,
            eventStore,
            resourceStore
        } = scheduler,
        // Extract teams
        home = $('#home').val(),
        away = $('#away').val(),
        // Extract date & time
        date = $('#startDate').val(),
        time = $('#startTime').val(),
        oldTeams = editingRecord.resources,
        newTeams = [resourceStore.getById(away), resourceStore.getById(home)],
        teamChanges = ArrayHelper.delta(newTeams, oldTeams, true);

    if (home === away) {
        Toast.show('A team cannot play itself');
        return false;
    }
    if (!home || !away) {
        Toast.show('Both teams must be selected');
        return false;
    }

    // Prevent multiple commits from this flow
    assignmentStore.suspendAutoCommit();

    // Avoid multiple redraws, from event changes + assignment changes
    scheduler.suspendRefresh();

    editingRecord.beginBatch();

    // Update record
    editingRecord.set({
        startDate : DateHelper.parse(date + ' ' + time, 'YYYY-MM-DD HH:mm')
    });

    // Update the two teams involved
    eventStore.unassignEventFromResource(editingRecord, teamChanges.toRemove);
    eventStore.assignEventToResource(editingRecord, teamChanges.toAdd);

    editingRecord.endBatch();

    // If it was a provisional event, passed in here from drag-create or dblclick or contextmenu,
    // it's now it's no longer a provisional event and will not be removed in the focusout handler
    // Also, when promoted to be permanent, auto syncing will kick in if configured.
    editingRecord.isCreating = false;

    assignmentStore.resumeAutoCommit();

    // Redraw once
    scheduler.resumeRefresh(true);
});

if (navigator.userAgent.match(/Firefox/) || navigator.userAgent.match(/Safari/)) {
    $('#cancel').on('click', e => {
        $('#customEditor').blur();
    });
}
