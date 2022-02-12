import { EventStore, ResourceStore, ProjectModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let assignmentStore, resourceStore, eventStore, project;

    async function setup() {
        resourceStore = new ResourceStore({
            data : [
                { id : 'r1', name : 'Resource 1' },
                { id : 'r2', name : 'Resource 2' },
                { id : 'r3', name : 'Resource 3' },
                { id : 'r4', name : 'Resource 4' },
                { id : 'r5', name : 'Resource 5' },
                { id : 'r6', name : 'Resource 6' },
                { id : 'r7', name : 'Resource 7' },
                { id : 'r8', name : 'Resource 8' }
            ]
        });

        eventStore = new EventStore({
            data : [
                { id : 1, resourceId : 'r1', name : 'Event 1', startDate : '2019-12-19', duration : 1 },
                { id : 2, resourceId : 'r1', name : 'Event 2', startDate : '2019-12-24', duration : 1 },
                { id : 3, resourceId : 'r2', name : 'Event 3', startDate : '2019-12-20', duration : 1 }
            ]
        });

        project = new ProjectModel({
            eventStore,
            resourceStore
        });

        assignmentStore = project.assignmentStore;

        await t.waitForProjectReady(project);
    }

    t.it('should convert resourceId into assignment', async t => {
        await setup();

        const
            [r1, r2]     = resourceStore,
            [e1, e2, e3] = eventStore,
            [a1, a2, a3] = assignmentStore;

        t.ok(eventStore.usesSingleAssignment, 'EventStore uses single assignment mode');

        t.is(assignmentStore.count, 3, 'Correct assignment count');
        t.isDeeply(assignmentStore.map(a => a.event), eventStore.records, 'Correct events for assignments');
        t.isDeeply(assignmentStore.map(a => a.resource), [r1, r1, r2], 'Correct resources for assignments');

        t.is(e1.resourceId, 'r1', 'Correct resourceId for Event 1');
        t.is(e2.resourceId, 'r1', 'Correct resourceId for Event 2');
        t.is(e3.resourceId, 'r2', 'Correct resourceId for Event 3');

        t.is(e1.data.resourceId, 'r1', 'Correct resourceId in data for Event 1');
        t.is(e2.data.resourceId, 'r1', 'Correct resourceId in data for Event 2');
        t.is(e3.data.resourceId, 'r2', 'Correct resourceId in data for Event 3');

        t.isDeeply(e1.assignments, [a1], 'Correct assignments for Event 1');
        t.isDeeply(e2.assignments, [a2], 'Correct assignments for Event 2');
        t.isDeeply(e3.assignments, [a3], 'Correct assignments for Event 3');
    });

    t.it('should update resourceId + assignment on reassignment', async t => {
        await setup();

        async function assertResourceId(resource, assertAssignment = true) {
            await t.waitForProjectReady(project);

            if (assertAssignment) {
                t.is(assignment.resourceId, resource.id, 'Assignments resourceId updated');
                t.is(assignment.resource, resource, 'Assignments resource updated');
            }

            t.is(event.resourceId, resource.id, 'Event returned correct resourceId');
            t.is(event.resource, resource, 'Event returned correct resource');

            t.ok(event.isModified, 'Event modified');
            t.is(event.modifications.resourceId, resource.id, 'Event has correct modification');
        }

        const
            [event]                        = eventStore,
            [assignment]                   = assignmentStore,
            [, r2, r3, r4, r5, r6, r7, r8] = resourceStore;

        t.diag('Changing resourceId');

        event.resourceId = 'r2';

        await assertResourceId(r2);

        t.diag('Changing resource');

        event.resource = r3;

        await assertResourceId(r3);

        t.diag('Calling assign');

        event.assign(r4);

        await assertResourceId(r4);

        t.diag('Calling AssignmentStore#assignEventToResource');

        assignmentStore.assignEventToResource(event, r5);

        await assertResourceId(r5);

        t.diag('Calling EventoStore#reassignEventFromResourceToResource');

        eventStore.reassignEventFromResourceToResource(event, r5, r6);

        await assertResourceId(r6);

        t.diag('Changing assignment record');

        assignment.resourceId = 'r7';

        await assertResourceId(r7);

        t.diag('Adding assignment');

        event.resourceId = null;

        assignmentStore.add({ eventId : event.id, resourceId : 'r8' });

        await assertResourceId(r8, false);
    });

    t.it('should update resourceId + assignment when unassigning', async t => {
        await setup();

        const
            [event] = eventStore,
            [r1]    = resourceStore;

        async function assertUnassigned() {
            await t.waitForProjectReady(project);

            t.is(event.resourceId, null, 'resourceId is null');
            t.is(event.assignments.length, 0, 'event.assignments is empty');
            t.is(event.resource, null, 'event.resource is null');
            t.notOk(event.isAssignedTo(r1), 'Not assigned to resource');
            t.notOk(assignmentStore.isEventAssignedToResource(event, r1, 'Not assigned to resource according to store'));
            t.ok(event.isModified, 'Event modified');
            t.is(event.modifications.resourceId, null, 'Event has correct modifications');

            // reassign before next assertion
            event.resourceId = 'r1';
        }

        t.diag('Clearing resourceId');

        event.resourceId = null;

        await assertUnassigned();

        t.diag('Clearing resource');

        event.resource = null;

        await assertUnassigned();

        t.diag('Calling unassign()');

        event.unassign();

        await assertUnassigned();

        t.diag('Calling unassign(r1)');

        event.unassign(r1);

        await assertUnassigned();
    });
});
