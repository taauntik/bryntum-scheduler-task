
StartTest({ defaultTimeout : 90000 }, t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    const getScheduler = config =>
        t.getScheduler(Object.assign({
            appendTo : document.body,
            features : {
                eventDrag    : true,
                eventTooltip : false
            },
            enableEventAnimations : false
        }, config));

    t.it('Should drag drop assignments with allowOverlap: false', t => {
        scheduler = getScheduler({
            allowOverlap : false,
            assignments  : [
                { resourceId : 'r1', eventId : 1 },
                { resourceId : 'r2', eventId : 1 },
                { resourceId : 'r3', eventId : 1 },
                { resourceId : 'r3', eventId : 2 },
                { resourceId : 'r4', eventId : 2 },
                { resourceId : 'r5', eventId : 3 }
            ],
            events : [
                {
                    id        : 1,
                    startDate : new Date(2011, 0, 6),
                    endDate   : new Date(2011, 0, 8)
                },
                {
                    id        : 2,
                    startDate : new Date(2011, 0, 3),
                    endDate   : new Date(2011, 0, 5)
                },
                {
                    id        : 3,
                    startDate : new Date(2011, 0, 5),
                    endDate   : new Date(2011, 0, 6)
                }
            ]
        });

        t.chain(
            { drag : '.b-sch-event', by : [scheduler.tickSize, 0], desc : 'Drag assignment to overlap with itself' },
            next => {
                t.is(scheduler.events[0].startDate, new Date(2011, 0, 7), 'Start date is ok');
                next();
            },
            { drag : '.b-sch-event', by : [-scheduler.tickSize, 0] },
            next => {
                t.is(scheduler.events[0].startDate, new Date(2011, 0, 6), 'Start date is ok');
                next();
            },
            {
                drag : '.b-sch-event',
                by   : [-scheduler.tickSize * 2, 0],
                desc : 'Drag assignment to overlap with another assignment'
            },
            next => {
                t.is(scheduler.events[0].startDate, new Date(2011, 0, 6), 'Start date is ok');
                next();
            },
            {
                drag : '.b-sch-event',
                by   : [-scheduler.tickSize, scheduler.rowHeight * 4],
                desc : 'Drag assignment to overlap with another assignment in a future new resource'
            },
            next => {
                t.is(scheduler.events[0].startDate, new Date(2011, 0, 6), 'Start date is ok');
                next();
            },
            {
                drag : '.b-sch-event',
                by   : [-scheduler.tickSize, 0],
                desc : 'Drag assignment to the dates where another assignment exists but on different resource'
            },
            next => {
                t.is(scheduler.events[0].startDate, new Date(2011, 0, 5), 'Start date is ok');
                next();
            }
        );
    });

    // https://github.com/bryntum/support/issues/2036
    t.it('Should support drag drop after selecting multiple assignments for same event', t => {
        scheduler = getScheduler({
            features : {
                // Just having this enabled triggers the issue
                eventDragSelect : true
            },
            assignments : [
                { resourceId : 'r1', eventId : 1 },
                { resourceId : 'r2', eventId : 1 }
            ],
            events      : [
                {
                    id        : 1,
                    startDate : new Date(2011, 0, 6),
                    duration  : 1
                }
            ]
        });

        const event = scheduler.eventStore.first;

        scheduler.selectAssignments(scheduler.assignmentStore.getRange());

        t.chain(
            { drag : '.b-sch-event', by : [scheduler.tickSize, 0] },
            () => {
                t.is(event.startDate, new Date(2011, 0, 7), 'Event moved one day');
            }
        );
    });
});
