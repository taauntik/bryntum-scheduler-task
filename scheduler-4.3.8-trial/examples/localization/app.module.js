import { Scheduler, LocaleManager, Localizable, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';
// Importing custom locales



// Enable missing localization Error throwing here to show how it can be used in end-user apps
// All non-localized strings which are in `L{foo}` format will throw runtime error
LocaleManager.throwOnMissingLocale = true;

//region Data

const
    resources = [
        { id : 'r1', name : 'Mike', company : 'Big Fish inc' },
        { id : 'r2', name : 'Linda', company : 'Small rocket co' },
        { id : 'r3', name : 'Dan', company : 'Big Fish inc' },
        { id : 'r4', name : 'Celia', company : 'Big Fish inc' },
        { id : 'r5', name : 'Malik', company : 'Small rocket co' },
        { id : 'r6', name : 'Gloria', company : 'Small rocket co' }
    ],
    events    = [
        {
            id          : 1,
            resourceId  : 'r1',
            name        : 'Meeting',
            color       : 'green',
            percentDone : 60,
            startDate   : new Date(2017, 0, 1, 10),
            endDate     : new Date(2017, 0, 1, 12)
        },
        {
            id          : 2,
            resourceId  : 'r2',
            name        : 'Lunch',
            color       : 'blue',
            percentDone : 20,
            startDate   : new Date(2017, 0, 1, 12),
            endDate     : new Date(2017, 0, 1, 14)
        },
        {
            id          : 3,
            resourceId  : 'r3',
            name        : 'Meeting',
            color       : 'green',
            percentDone : 80,
            startDate   : new Date(2017, 0, 1, 14),
            endDate     : new Date(2017, 0, 1, 16)
        },
        {
            id          : 4,
            resourceId  : 'r4',
            name        : 'Meeting',
            color       : 'green',
            percentDone : 90,
            startDate   : new Date(2017, 0, 1, 8),
            endDate     : new Date(2017, 0, 1, 11)
        },
        {
            id          : 5,
            resourceId  : 'r5',
            name        : 'Phone',
            color       : 'red',
            percentDone : 40,
            startDate   : new Date(2017, 0, 1, 15),
            endDate     : new Date(2017, 0, 1, 17)
        },
        {
            id          : 6,
            resourceId  : 'r6',
            name        : 'Workout',
            color       : 'orange',
            percentDone : 70,
            startDate   : new Date(2017, 0, 1, 16),
            endDate     : new Date(2017, 0, 1, 18)
        }
    ];

//endregion

/**
 * Updates localizable properties after locale change
 */
function updateLocalization() {
    const title = Localizable().L('L{App.Localization demo}');
    document.querySelector('#title').innerHTML = `<h1>${title}</h1>`;
    document.title = title;
}

// Add listener to update contents when locale changes
LocaleManager.on('locale', updateLocalization);

new Scheduler({
    appendTo          : 'container',
    resourceImagePath : '../_shared/images/users/',

    features : {
        eventTooltip : true
    },

    columns : [
        { type : 'resourceInfo', text : 'L{Name}', width : 150 },
        { text : 'L{Company}', field : 'company', width : 150 }
    ],

    resources : resources,

    events : events,

    startDate  : new Date(2017, 0, 1, 6),
    endDate    : new Date(2017, 0, 1, 20),
    viewPreset : 'hourAndDay',

    eventRenderer({ resourceRecord, renderData, eventRecord }) {
        Object.assign(renderData, {
            iconCls    : resourceRecord.company.startsWith('Big') ? 'b-fa b-fa-fish' : 'b-fa b-fa-rocket',
            eventColor : eventRecord.color
        });

        return StringHelper.xss`${eventRecord.name}`;
    }
});

updateLocalization();
