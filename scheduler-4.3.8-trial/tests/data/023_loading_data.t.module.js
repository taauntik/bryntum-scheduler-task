import { AjaxHelper, DateHelper } from '../../build/scheduler.module.js?456730';

describe('It should support passing start + end date as params', t => {
    t.it('Should support `passStartEndParameters` with autoLoad config', t => {
        let callCount = 0,
            startDate = new Date(2010, 1, 1, 12),
            endDate   = new Date(2010, 1, 2, 12);

        AjaxHelper.get = url => {
            callCount++;
            t.like(url, `foo=${encodeURIComponent(`2010-02-01T12:00:00${DateHelper.getGMTOffset(startDate)}`)}`, 'correct start param name + value');
            t.like(url, `bar=${encodeURIComponent(`2010-02-02T12:00:00${DateHelper.getGMTOffset(endDate)}`)}`, 'correct end param name + value');

            return new Promise(() => {});
        };

        t.getScheduler({
            passStartEndParameters : true,
            viewPreset             : 'hourAndDay',
            startParamName         : 'foo',
            endParamName           : 'bar',
            startDate              : startDate,
            endDate                : endDate,
            eventStore             : {
                readUrl  : 'read.js?456730',
                autoLoad : true
            }
        });

        t.is(callCount, 1);
    });

    t.it('Should support `passStartEndParameters` with autoLoad false', (t) => {
        let callCount = 0,
            startDate = new Date(2010, 1, 1, 12),
            endDate   = new Date(2010, 1, 2, 12);

        AjaxHelper.get = url => {
            callCount++;
            t.like(url, `foo=${encodeURIComponent(`2010-02-01T12:00:00${DateHelper.getGMTOffset(startDate)}`)}`, 'correct start param name + value');
            t.like(url, `bar=${encodeURIComponent(`2010-02-02T12:00:00${DateHelper.getGMTOffset(endDate)}`)}`, 'correct end param name + value');

            return new Promise(() => {
            });
        };

        const scheduler = t.getScheduler({
            passStartEndParameters : true,
            viewPreset             : 'hourAndDay',
            startParamName         : 'foo',
            endParamName           : 'bar',
            startDate              : startDate,
            endDate                : endDate,
            eventStore             : {
                readUrl  : 'read.js?456730',
                autoLoad : false
            }
        });

        scheduler.eventStore.load();

        t.is(callCount, 1);
    });
});
