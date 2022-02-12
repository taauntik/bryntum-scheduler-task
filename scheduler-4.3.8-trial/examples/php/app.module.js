import { Scheduler, Toast } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

// Set random PHP session ID if it doesn't exist
const cookie = 'PHPSESSID=scheduler-php';
if (!(document.cookie.includes(cookie))) {
    document.cookie = `${cookie}-${Math.random().toString(16).substring(2)}`;
}

const processException = event => {
    const
        { action, response } = event,
        serverMessage        = response?.parsedJson?.msg,
        exceptionText        = `Command "${action}" failed.${serverMessage ? ` Server response: ${serverMessage}` : ''}`;

    Toast.show({
        html    : exceptionText,
        cls     : 'php-demo-error-message',
        timeout : 5000
    });

    if (!serverMessage) {
        console.error(`App Exception: ${exceptionText}`, event);
    }
};

const scheduler = new Scheduler({
    appendTo               : 'container',
    startDate              : new Date(2018, 4, 21, 6),
    endDate                : new Date(2018, 4, 21, 18),
    viewPreset             : 'hourAndDay',
    rowHeight              : 50,
    barMargin              : 5,
    eventColor             : 'blue',
    passStartEndParameters : true,

    features : {
        // Configure event editor to display 'brand' as resource name
        eventEdit : {
            resourceFieldConfig : {
                displayField : 'car'
            }
        }
    },

    columns : [
        { text : 'Id', field : 'id', width : 100, editor : false, hidden : true },
        { text : 'Car', field : 'car', width : 150 },
        {
            type   : 'date',
            text   : 'Modified',
            field  : 'dt',
            width  : 90,
            format : 'HH:mm:ss',
            editor : false,
            hidden : true
        }
    ],

    resourceStore : {
        // Add some custom fields
        fields         : ['car', 'dt'],
        // Setup urls
        createUrl      : 'php/resource/create.php',
        readUrl        : 'php/resource/read.php',
        updateUrl      : 'php/resource/update.php',
        deleteUrl      : 'php/resource/delete.php',
        // Load and save automatically
        autoLoad       : true,
        autoCommit     : true,
        // Send as form data and not a JSON payload
        sendAsFormData : true,

        // Make it read only to prevent changes while committing
        listeners : {
            beforeCommit : () => {
                scheduler.readOnly = true;
            },
            commit : () => {
                scheduler.readOnly = false;
            },
            exception : (event) => {
                processException(event);
                scheduler.readOnly = false;
            }
        }
    },

    eventStore : {
        // Add a custom field and redefine durationUnit to default to hours
        fields         : ['dt', { name : 'durationUnit', defaultValue : 'hour' }],
        // Setup urls
        createUrl      : 'php/event/create.php',
        readUrl        : 'php/event/read.php',
        updateUrl      : 'php/event/update.php',
        deleteUrl      : 'php/event/delete.php',
        // Load and save automatically
        autoLoad       : true,
        autoCommit     : true,
        // Send as form data and not a JSON payload
        sendAsFormData : true,

        // Make it read only to prevent changes while committing
        listeners : {
            beforeCommit : () => {
                scheduler.readOnly = true;
            },
            commit : () => {
                scheduler.readOnly = false;
            },
            exception : (event) => {
                processException(event);
                scheduler.readOnly = false;
            }
        }
    },

    tbar : [
        {
            type : 'button',
            ref  : 'reloadButton',
            icon : 'b-fa b-fa-sync',
            text : 'Reload scheduler',
            async onAction() {
                await Promise.all([
                    scheduler.resourceStore.load(),
                    scheduler.eventStore.load()
                ]);
                Toast.show('Data reloaded');
            }
        },
        {
            type  : 'button',
            ref   : 'resetButton',
            color : 'b-red',
            icon  : 'b-fa b-fa-recycle',
            text  : 'Reset database',
            async onAction() {
                await Promise.all([
                    scheduler.resourceStore.load({ reset : true }),
                    scheduler.eventStore.load({ reset : true })
                ]);
                Toast.show('Database was reset');
            }
        }
    ]
});
