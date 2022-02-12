StartTest(t => {
    const scheduler = t.getScheduler({
            appendTo : document.body
        }),
        dt        = new Date(2010, 1, 1, 3, 5),
        validValues = {
            'Feb 1, 2010 3:05:00 AM' : true, // !Edge produces this
            'Feb 1, 2010 03:05:00 AM' : true // Edge produces this
        };

    t.it('Max zoomed in, secondAndMinute preset', t => {
        scheduler.zoomInFull();

        t.expect(scheduler.displayDateFormat).toBe('ll LTS');
        t.ok(validValues[scheduler.getFormattedDate(dt)]);
    });

    t.it('Max zoomed out, manyYears preset', t => {
        scheduler.zoomOutFull();

        t.expect(scheduler.displayDateFormat).toBe('ll');
        t.expect(scheduler.getFormattedDate(dt)).toBe('Feb 1, 2010');
    });
});
