import { ProjectModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let project;

    t.beforeEach(() => {
        project?.destroy();
    });

    // Resource store has similar issue to one reported here:
    // https://github.com/bryntum/support/issues/3131
    t.it('Should add resources to the store', async t => {
        project = new ProjectModel({
            destroyStores : true,
            resourcesData : [
                { id : 1, name : 'Resource' }
            ],
            eventsData : [
                { id : 1, resourceId : 1, startDate : '2021-07-13', endDate : '2021-07-14' }
            ]
        });

        await project.commitAsync();

        const resourcesData = [], eventsData = [];

        for (let i = 1; i < 1000; i++) {
            resourcesData.push({
                id   : i,
                name : i
            });

            eventsData.push({
                id         : i,
                resourceId : i,
                startDate  : new Date(2021, 6, 5),
                endDate    : new Date(2021, 6, 6)
            });
        }

        project.eventStore.add(eventsData);

        await project.commitAsync();

        const assignmentIndicesSpy = t.spyOn(project.assignmentStore.storage, 'rebuildIndices');
        const resourceIndicesSpy = t.spyOn(project.resourceStore.storage, 'rebuildIndices');
        const eventIndicesSpy = t.spyOn(project.eventStore.storage, 'rebuildIndices');

        project.resourceStore.add(resourcesData);

        await project.commitAsync();

        t.expect(assignmentIndicesSpy).toHaveBeenCalled('<10');
        t.expect(resourceIndicesSpy).toHaveBeenCalled('<10');
        t.expect(eventIndicesSpy).toHaveBeenCalled('<10');
    });

    t.it('Should load resources to the store', async t => {
        project = new ProjectModel({
            destroyStores : true,
            resourcesData : []
        });

        await project.commitAsync();

        const resourcesData = [];

        for (let i = 1; i < 1000; i++) {
            resourcesData.push({
                id   : i,
                name : i
            });
        }

        const assignmentIndicesSpy = t.spyOn(project.assignmentStore.storage, 'rebuildIndices');

        await project.resourceStore.loadDataAsync(resourcesData);

        t.expect(assignmentIndicesSpy).toHaveBeenCalled('<10');
    });

    t.it('Load and add take comparable time to finish', async t => {
        project = new ProjectModel({
            destroyStores : true,
            resourcesData : []
        });

        await project.commitAsync();

        const resourcesData = [];

        for (let i = 1; i < 1000; i++) {
            resourcesData.push({
                id   : i,
                name : i
            });
        }

        const set1 = resourcesData.slice(), set2 = resourcesData.slice();

        let now = performance.now();

        project.resourceStore.add(set1);

        await project.commitAsync();

        const addTime = performance.now() - now;

        project.destroy();

        project = new ProjectModel({
            destroyStores : true,
            resourcesData : []
        });

        await project.commitAsync();

        now = performance.now();

        await project.resourceStore.loadDataAsync(set2);

        const loadTime = performance.now() - now;

        t.isApprox(addTime, loadTime, loadTime * 10, 'store.add is within 1 order of magnitude of store.loadDataAsync');
    });
});
