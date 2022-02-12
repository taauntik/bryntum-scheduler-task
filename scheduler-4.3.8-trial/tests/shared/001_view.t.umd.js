"use strict";

StartTest(t => {
  let v = new Scheduler({
    appendTo: document.body,
    eventPrefix: 'pre'
  }); // TODO: PORT

  t.xit('elements & id', t => {
    document.body.innerHTML = '<div id="pre-1-1-x"></div>';
    var div = document.getElementById('pre-1-1-x'); // Using a 'mock' record, only need its internalId

    var record = {
      internalId: '1'
    };
    t.is(v.getElementsFromEventRecord(record)[0], div, 'getElementsFromEventRecord ok');
    t.is(v.getEventIdFromDomNodeId('pre-1'), '1', 'getEventIdFromDomNodeId ok');
  });
  t.it('getFormattedDate', t => {
    v.displayDateFormat = 'YYYY-MM-DD';
    t.is(v.getFormattedDate(new Date(2010, 1, 2), new Date(2010, 1, 1)), '2010-02-02');
    v.displayDateFormat = 'YYYY-MM-DD HH:mm';
    t.is(v.getFormattedDate(new Date(2010, 1, 2), new Date(2010, 1, 1)), '2010-02-02 00:00');
  });
  t.it('getFormattedEndDate', t => {
    // Remove 1 day to render 'inclusive' end date if display doesn't care about hour resolution
    v.displayDateFormat = 'YYYY-MM-DD';
    t.is(v.getFormattedEndDate(new Date(2010, 1, 2), new Date(2010, 1, 1)), '2010-02-01'); // Keep as it and render 'exact' end date if display cares about hour resolution

    v.displayDateFormat = 'YYYY-MM-DD HH:mm';
    t.is(v.getFormattedEndDate(new Date(2010, 1, 2), new Date(2010, 1, 1)), '2010-02-02 00:00');
  });
});