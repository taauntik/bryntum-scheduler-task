StartTest(t => {
    t.it('should not wrap custom rendered events', async t => {
        const londonEl = (await t.waitForSelector('.b-sch-event:contains(London) .b-sch-event-content'))[0];

        t.is(londonEl.childNodes.length, 2, 'Correct child elements');
        t.is(londonEl.childNodes[0].tagName, 'I', 'First child is an icon');
        t.is(londonEl.childNodes[1].data, 'London 895', 'Second child is text node');
    });
});
