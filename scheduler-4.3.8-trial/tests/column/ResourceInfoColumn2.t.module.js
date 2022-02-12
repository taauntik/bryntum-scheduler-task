
StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler?.destroy?.());

    t.it(`Should pass for copying resource row and ignore 404 with test's "failOnResourceLoadError" config`, async t => {
        scheduler = await t.getSchedulerAsync({
            defaultResourceImageName : 'none.png',
            resources                : [
                { name : 'Gloria' }
            ],
            resourceImagePath : '../examples/_shared/images/users/',
            columns           : [
                {
                    type : 'resourceInfo',
                    text : 'Staff'
                }
            ]
        }, 1);

        await t.waitForSelector('img[src*="gloria.jpg"]');
        await t.click('.b-resource-info');
        // Perform Copy/Paste for the resource row
        await t.type(null, 'cv', null, null, { ctrlKey : true });
    });

});
