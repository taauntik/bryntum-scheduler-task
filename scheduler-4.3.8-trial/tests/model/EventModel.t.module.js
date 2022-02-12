import { Store, ResourceStore, VersionHelper, EventStore, EventModel, ProjectModel, DateHelper, BrowserHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let resourceStore, eventStore, project;

    t.beforeEach(() => {
        resourceStore?.destroy?.();
        eventStore?.destroy?.();
        project?.destroy?.();

        resourceStore = new ResourceStore({
            data : [
                { id : 'c1', name : 'Foo' },
                { id : 'c2', name : 'Foo' }
            ]
        });

        eventStore    = new EventStore();

        project = new ProjectModel({
            eventStore,
            resourceStore
        });
    });

    t.it('Validation, isPersistable', async t => {
        const event = new EventModel({
            resourceId : 'c1',
            name       : 'Mike',
            startDate  : '2010-12-09 09:45',
            endDate    : '2010-12-09 11:00'
        });
        eventStore.add(event);

        await eventStore.project.commitAsync();

        t.ok(event.isValid, 'isValid');

        event.startDate = new Date(event.endDate.getTime() + 1);

        await eventStore.project.commitAsync();

        t.ok(event.isValid, 'isValid, normalized by engine');

        t.ok(event.isPersistable, 'isPersistable true');

        const [newResource] = resourceStore.insert(0, {});
        event.resource = newResource;

        // Always considered persistable with assignmentstore according to docs
        t.ok(event.isPersistable, 'isPersistable true');
        //t.notOk(event.isPersistable, 'isPersistable false');
        t.ok(event.resourceId, newResource.id, 'found phantom resource internal id');
        t.is(event.resource, newResource, 'found phantom resource');
    });

    t.it('getters and setters', async t => {
        const event = new EventModel({
            resourceId : 'c1',
            name       : 'Mike',
            startDate  : '2010-12-09 09:45',
            endDate    : '2010-12-09 11:00'
        });
        eventStore.add(event);

        await eventStore.project.commitAsync();

        event.startDate = null;
        event.endDate = null;
        await eventStore.project.commitAsync();

        t.is(event.startDate, null, 'Could set end date to null');
        t.is(event.endDate, null, 'Could set end date to null');
        t.is(event.duration, null, 'Duration also null');

        event.setStartEndDate(new Date(2010, 1, 1), new Date(2010, 1, 2));
        await eventStore.project.commitAsync();
        t.is(event.startDate, new Date(2010, 1, 1), 'Could set startDate to 2010, 1, 1');
        t.is(event.endDate, new Date(2010, 1, 2), 'Could set endDate to 2010, 1, 2');
        t.is(event.duration, 1, 'Duration calculated to 1');

        event.setStartEndDate(null, null);
        await eventStore.project.commitAsync();
        t.is(event.startDate, null, 'Could set start date to null, setStartEndDate');
        t.is(event.endDate, null, 'Could set end date to null, setStartEndDate');
    });

    t.it('Events should support belonging to multiple stores', t => {
        const
            event    = new EventModel({
                resourceId : 'c1',
                name       : 'Mike',
                startDate  : '2010-12-09 09:45',
                endDate    : '2010-12-09 11:00'
            }),
            resource = resourceStore.getById('c1');

        new Store({
            modelClass : EventModel,
            data       : [event]
        });

        eventStore.add(event);

        t.is(event.resource, resource, 'resource works');
        t.isDeeply(event.resources, [resource], 'resources works');
    });

    t.it('Event setter resourceId can be overridden', t => {
        class MyModel extends EventModel {
            static get fields() {
                return super.fields.concat([
                    { name : 'resourceId', dataSource : 'resource' }
                ]);
            }
        }

        const event = new MyModel({
            resource  : 'c1',
            name      : 'Mike',
            startDate : '2016-02-12 14:40',
            endDate   : '2010-02-12 14:45'
        });

        t.is(event.resourceId, 'c1', 'ResourceId is properly set');
        event.resourceId = 'c2';
        t.is(event.resourceId, 'c2', 'ResourceId is properly set');
    });

    t.it('Setting resourceId = null should yield event.resource === null', t => {
        const [event] = eventStore.add({
            resourceId : 'c1'
        });

        t.is(event.resourceId, 'c1', 'ResourceId is properly set');

        event.resourceId = null;

        t.is(event.resource, null, 'resource is properly set');
        t.is(event.resourceId, null, 'resourceId is properly set');
    });

    t.it('should support shift() API without unit and use default durationUnit', async t => {
        const event = new EventModel({
            startDate : new Date(2018, 11, 1),
            endDate   : new Date(2018, 11, 2)
        });
        eventStore.add(event);

        await eventStore.project.commitAsync();

        await event.shift(1);

        t.is(event.startDate, new Date(2018, 11, 2));
        t.is(event.endDate, new Date(2018, 11, 3));
        t.is(event.duration, 1);

        await event.shift(-1);

        t.is(event.startDate, new Date(2018, 11, 1));
        t.is(event.endDate, new Date(2018, 11, 2));
        t.is(event.duration, 1);
    });

    t.it('should support shift() API with unit', async t => {
        const event = new EventModel({
            startDate    : new Date(2018, 11, 1),
            endDate      : new Date(2018, 11, 2),
            durationUnit : 'h'
        });
        eventStore.add(event);

        await eventStore.project.commitAsync();

        await event.shift(1, 'w');

        t.is(event.startDate, new Date(2018, 11, 8));
        t.is(event.endDate, new Date(2018, 11, 9));
        t.is(event.duration, 24);
    });

    t.it('should support split() API', async t => {
        const event = new EventModel({
            startDate    : new Date(2018, 11, 1),
            duration     : 5,
            durationUnit : 'd'
        });
        eventStore.add(event);

        await eventStore.project.commitAsync();

        const clone = event.split();

        await eventStore.project.commitAsync();

        t.is(event.startDate, new Date(2018, 11, 1));
        t.is(event.duration, 2.5);

        t.is(clone.startDate, new Date(2018, 11, 3, 12));
        t.is(clone.duration, 2.5);

        const clone2 = clone.split(0.2);

        await eventStore.project.commitAsync();

        t.is(clone.startDate, new Date(2018, 11, 3, 12));
        t.is(clone.duration, 0.5);

        t.is(clone2.startDate, new Date(2018, 11, 4));
        t.is(clone2.duration, 2);
    });

    t.it('Should support allDay', t => {
        const
            startDate       = new Date(2018, 11, 1, 9),
            endDate         = new Date(2018, 11, 1, 10),
            allDayStartDate = new Date(2018, 11, 1),
            allDayEndDate   = new Date(2018, 11, 2);

        const event = new EventModel({
            startDate,
            endDate
        });

        // It starts off as a 9 to 10am event
        t.is(event.startDate.valueOf(), startDate.valueOf(), 'Non allDay startDate is correct');
        t.is(event.endDate.valueOf(), endDate.valueOf(), 'Non allDay endDate is correct');

        event.allDay = true;

        // Now it should be midnight to midnight
        t.is(event.startDate.valueOf(), allDayStartDate.valueOf(), 'allDay startDate is correct');
        t.is(event.endDate.valueOf(), allDayEndDate.valueOf(), 'allDay endDate is correct');

        event.allDay = false;

        // And back to a 9am to 10am event
        t.is(event.startDate.valueOf(), startDate.valueOf(), 'Non allDay startDate is correct');
        t.is(event.endDate.valueOf(), endDate.valueOf(), 'Non allDay endDate is correct');
    });

    t.it('Should batch start/end date changes', async t => {
        const [event] = eventStore.add({
            id        : 1,
            startDate : '2020-04-01',
            duration  : 1
        });

        await t.waitForProjectReady(project);

        const
            { startDate, endDate } = event,
            newStartDate = new Date(2020, 3, 2),
            newEndDate = new Date(2020, 3, 5);

        event.beginBatch();

        event.startDate = newStartDate;
        event.endDate = newEndDate;

        // Old assertions, changed after discussion with Maxim
        // t.is(event.startDate, startDate, 'Start date is intact during batch');
        // t.is(event.endDate, endDate, 'End date is intact during batch');

        t.is(event.data.startDate, startDate, 'Start date is intact during batch');
        t.is(event.data.endDate, endDate, 'End date is intact during batch');

        event.endBatch();

        await t.waitForProjectReady(project);

        t.is(event.startDate, newStartDate, 'Start date is updated after batch');
        t.is(event.endDate, newEndDate, 'End date is updated after batch');
    });

    t.it('Should be able to set/get `resources`', async t => {
        const [event] = eventStore.add({
            id        : 1,
            startDate : '2020-04-01',
            duration  : 1
        });

        await t.waitForProjectReady(project);

        event.resources = 'c1';

        t.isDeeply(event.resources, [resourceStore.getById('c1')], 'Should be able to set resources as single resource id');

        event.resources = ['c1', 'c2'];

        t.isDeeply(event.resources.map(r => r.id), ['c1', 'c2'], 'Should be able to set resources as single resource id');
    });

    t.it('Should work with nested dates', async t => {
        project.destroy();

        class MyEvent extends EventModel {
            static get fields() {
                return [
                    { name : 'startDate', dataSource : 'nested.start' }
                ];
            }
        }

        project       = new ProjectModel({
            eventModelClass : MyEvent,
            eventsData      : [
                { id : 1, nested : { start : '2020-09-29' }, duration : 1, durationUnit : 'day' }
            ]
        });

        await project.commitAsync();

        t.is(project.eventStore.first.startDate, new Date(2020, 8, 29), 'Correct startDate');
        t.is(project.eventStore.first.endDate, new Date(2020, 8, 30), 'Correct endDate');
    });

    t.describe('iCal', t => {
        t.it('Should provide empty string for unscheduled event', t => {
            const span = new EventModel({
                id   : 2,
                name : 'My task'
            });

            t.is(span.toICSString(), '', 'Serializing unscheduled event should return empty string');
        });

        t.it('Should be possible to get the timespan serialized to the iCal format', t => {
            VersionHelper.setVersion('scheduler', '4.0.0-beta-2');
            const span = new EventModel({
                id        : 1,
                name      : 'My task',
                startDate : new Date(2019, 2, 8),
                endDate   : new Date(2019, 2, 9)
            });

            const
                startAsUTC     = DateHelper.toUTC(span.startDate),
                endAsUTC       = DateHelper.toUTC(span.endDate),
                formattedStart = DateHelper.format(startAsUTC, 'YYYYMMDDTHHmmss') + 'Z',
                formattedEnd   = DateHelper.format(endAsUTC, 'YYYYMMDDTHHmmss') + 'Z';

            t.is(span.toICSString({
                DTSTAMP : 'foo'
            }),
            `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Bryntum AB//Bryntum Scheduler 4.0.0-beta-2 //EN\nBEGIN:VEVENT\nUID:1@bryntum.com\nCLASS:PUBLIC\nSUMMARY:My task\nDTSTAMP:foo\nDTSTART:${formattedStart}\nDTEND:${formattedEnd}\nEND:VEVENT\nEND:VCALENDAR`
            , 'serialized correctly');
        });

        t.it('Should include recurrence rule', t => {
            const span = new EventModel({
                id             : 2,
                name           : 'My task',
                recurrenceRule : 'WEEKLY',
                startDate      : new Date(2019, 2, 8),
                endDate        : new Date(2019, 2, 9)
            });

            const
                startAsUTC     = DateHelper.toUTC(span.startDate),
                endAsUTC       = DateHelper.toUTC(span.endDate),
                formattedStart = DateHelper.format(startAsUTC, 'YYYYMMDDTHHmmss') + 'Z',
                formattedEnd   = DateHelper.format(endAsUTC, 'YYYYMMDDTHHmmss') + 'Z';

            t.is(span.toICSString({
                DTSTAMP : 'foo'
            }),
            `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Bryntum AB//Bryntum Scheduler 4.0.0-beta-2 //EN\nBEGIN:VEVENT\nUID:2@bryntum.com\nCLASS:PUBLIC\nSUMMARY:My task\nDTSTAMP:foo\nDTSTART:${formattedStart}\nDTEND:${formattedEnd}\nRRULE:WEEKLY\nEND:VEVENT\nEND:VCALENDAR`
            , 'serialized correctly');
        });

        t.it('Should use correct date format for all day events', t => {
            const span = new EventModel({
                id        : 2,
                name      : 'My task',
                allDay    : true,
                startDate : new Date(2019, 2, 8),
                endDate   : new Date(2019, 2, 9)
            });

            const
                startAsUTC     = DateHelper.toUTC(span.startDate),
                endAsUTC       = DateHelper.toUTC(span.endDate),
                formattedStart = DateHelper.format(startAsUTC, 'YYYYMMDD'),
                formattedEnd   = DateHelper.format(endAsUTC, 'YYYYMMDD');

            t.is(span.toICSString({
                DTSTAMP : 'foo'
            }),
            `BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:-//Bryntum AB//Bryntum Scheduler 4.0.0-beta-2 //EN\nBEGIN:VEVENT\nUID:2@bryntum.com\nCLASS:PUBLIC\nSUMMARY:My task\nDTSTAMP:foo\nDTSTART;VALUE=DATE:${formattedStart}\nDTEND;VALUE=DATE:${formattedEnd}\nEND:VEVENT\nEND:VCALENDAR`
            , 'serialized correctly');
        });

        t.it('Should trigger download', t => {
            if (BrowserHelper.isIE11) return;

            const span = new EventModel({
                id        : 2,
                name      : 'My task',
                allDay    : true,
                startDate : new Date(2019, 2, 8),
                endDate   : new Date(2019, 2, 9)
            });

            document.documentElement.addEventListener('click', event => {
                t.is(event.target.download, 'My task.ics', 'If no name exists, default to Event');
                t.like(event.target.href, new RegExp(`blob:${location.protocol}`), '`href` attr set correctly');
                event.preventDefault();
            }, { once : true });

            t.firesOnce(document.documentElement, 'click');

            span.exportToICS();
        });

        t.it('Should use some default if no name exists', t => {
            if (BrowserHelper.isIE11) return;

            const span = new EventModel({
                id        : 2,
                startDate : new Date(2019, 2, 8),
                endDate   : new Date(2019, 2, 9)
            });

            document.documentElement.addEventListener('click', event => {
                t.is(event.target.download, 'Event.ics', '`download` attr set correctly');
                t.like(event.target.href, new RegExp(`blob:${location.protocol}`), '`href` attr set correctly');
                event.preventDefault();
            }, { once : true });

            t.firesOnce(document.documentElement, 'click');

            span.exportToICS();
        });
    });

    t.it('Should not persist buckets', async t => {
        eventStore.add({
            resourceId : 'c1',
            name       : 'Mike',
            startDate  : '2010-12-09 09:45',
            endDate    : '2010-12-09 11:00'
        });

        await project.commitAsync();

        const toPersist = eventStore.first.persistableData;

        t.notOk('resources' in toPersist, 'Resources not persisted');
        t.notOk('assigned' in toPersist, 'Assignments not persisted');
    });
});
