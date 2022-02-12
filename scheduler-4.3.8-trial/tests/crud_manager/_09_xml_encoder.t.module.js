/* eslint-disable */
//TODO: PORT xml encoder

StartTest(function(t) {
    // Here we test Sch.crud.encoder.Xml class

    t.expectGlobal('TestCrudManager1');

    Ext.define('TestCrudManager1', {
        extend : 'Sch.crud.AbstractManager',
        mixins : ['Sch.crud.encoder.Xml']
    });

    var someStore1, someStore2, crud, response, added1, added2;

    var initTestData = function() {
        someStore1  = new Ext.data.JsonStore({
            storeId : 'so&me"St<or>e1',
            fields  : ['id', 'ff1', 'ff2'],
            data    : [
                { id : 11, ff1 : '11', ff2 : '111' },
                { id : 12, ff1 : '22', ff2 : '222' },
                { id : 13, ff1 : '33', ff2 : '333' }
            ]
        });

        someStore2  = new Ext.data.TreeStore({
            storeId : 'so&me"St<or>e2',
            fields  : ['id', 'f1', 'f2'],
            root    : {
                expanded : true,
                children : [
                    { id : 1, f1 : '11', f2 : '111' },
                    { id : 2, f1 : '22', f2 : '222' },
                    { id : 3, f1 : '33', f2 : '333' },
                    { id : 4, f1 : '44', f2 : '444' }
                ]
            }
        });

        crud    = Ext.create('TestCrudManager1', {
            stores : [someStore1, someStore2]
        });

        // init stores changes
        // someStore1
        someStore1.remove(someStore1.getById(11));
        someStore1.getById(12).set('ff1', '-<22> & " qwe');
        added1  = someStore1.add({ 'ff1' : 'n<e>w" & ', 'ff2' : '<>&"new' });
        // someStore2
        someStore2.getNodeById(4).remove();
        someStore2.getNodeById(3).set('f1', '-33');
        added2  = someStore2.getNodeById(3).appendChild({ f1 : '<>&"55', f2 : '5<>&"55' });
    };

    var getDocument = function(text) {
        var document;

        if (window.DOMParser) {
            document    = (new DOMParser()).parseFromString(text, 'text/xml');
        }
        else if (window.ActiveXObject) {
            document        = new ActiveXObject('Microsoft.XMLDOM');
            document.async  = false;
            document.loadXML(text);
        }

        return document;
    };

    var checkField = function(t, node, record) {
        var name = node.getAttribute('id');
        t.is(node.firstChild && node.firstChild.nodeValue || '', String(name == '$PhantomId' ? record.getId() : record.get(name)), 'has correct ' + name + ' field value');
    };

    t.it('Correctly encodes load package', function(t) {
        initTestData();

        var pack    = crud.getLoadPackage();
        var encoded = crud.encode(pack);

        t.ok(typeof encoded === 'string', 'Encoded data is a string');

        var doc     = getDocument(encoded),
            root    = doc.documentElement;

        t.is(root.tagName, 'load', 'Has correct root element');
        t.is(root.getAttribute('requestId'), pack.requestId, 'Root element has correct requestId');

        t.is(root.childNodes[0].tagName, 'store', '0th child element is correct');
        t.is(root.childNodes[0].getAttribute('id'), someStore1.storeId, '0th child element has correct id');
        t.is(root.childNodes[0].getAttribute('page'), 1, '0th child element has correct page');
        t.is(root.childNodes[0].getAttribute('pageSize'), 25, '0th child element has correct pageSize');

        t.is(root.childNodes[1].tagName, 'store', '1st child element is correct');
        t.is(root.childNodes[1].getAttribute('id'), someStore2.storeId, '1st child element has correct id');
    });

    t.it('Correctly encodes sync package', function(t) {
        initTestData();

        var pack    = crud.getChangeSetPackage();
        var encoded = crud.encode(pack);

        t.ok(typeof encoded === 'string', 'Encoded data is a string');

        var doc     = getDocument(encoded),
            root    = doc.documentElement;

        t.is(root.tagName, 'sync', 'Has correct root element');
        t.is(root.getAttribute('requestId'), pack.requestId, 'Root element has correct requestId');

        t.it('someStore1 container is correct', function(t) {
            var holder = root.childNodes[0];
            t.is(holder.tagName, 'store', 'tag name is correct');
            t.is(holder.getAttribute('id'), someStore1.storeId, 'element has correct id');

            var added = holder.getElementsByTagName('added');
            t.is(added.length, 1, 'has added records container');

            var records = added[0].getElementsByTagName('record');
            var fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], added1[0]);
            }

            var updated = holder.getElementsByTagName('updated');
            t.is(updated.length, 1, 'has updated records container');

            records = updated[0].getElementsByTagName('record');
            fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], someStore1.getById(12));
            }

            var removed = holder.getElementsByTagName('removed');
            t.is(removed.length, 1, 'has removed records container');

            records = removed[0].getElementsByTagName('record');
            fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], someStore1.getRemovedRecords()[0]);
            }
        });

        t.it('someStore2 container is correct', function(t) {
            var holder = root.childNodes[1];

            t.is(holder.tagName, 'store', 'tag name is correct');
            t.is(holder.getAttribute('id'), someStore2.storeId, 'element has correct id');

            var added = holder.getElementsByTagName('added');
            t.is(added.length, 1, 'has added records container');

            var records = added[0].getElementsByTagName('record');
            var fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], added2);
            }

            var updated = holder.getElementsByTagName('updated');
            t.is(updated.length, 1, 'has updated records container');

            records = updated[0].getElementsByTagName('record');
            fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], someStore2.getById(3));
            }

            var removed = holder.getElementsByTagName('removed');
            t.is(removed.length, 1, 'has removed records container');

            records = removed[0].getElementsByTagName('record');
            fields = records[0].getElementsByTagName('field');
            for (var i = 0, l = fields.length; i < l; i++) {
                checkField(t, fields[i], someStore2.getRemovedRecords()[0]);
            }
        });
    });

    t.it('Correctly decodes load response', function(t) {
        initTestData();

        response = '<data requestId="1234" revision="999" success="true">\
            <store id="so&amp;me&quot;St&lt;or&gt;e1">\
                <rows total="5">\
                    <record>\
                        <field id="id">77</field>\
                        <field id="ff1">777</field>\
                        <field id="ff2">7777</field>\
                    </record>\
                    <record>\
                        <field id="id">88</field>\
                        <field id="ff1">888</field>\
                        <field id="ff2">8888</field>\
                        <field id="nested">\
                            <store id="nested">\
                                <rows total="4">\
                                    <record>\
                                        <field id="id">33</field>\
                                        <field id="sub1">333</field>\
                                        <field id="sub2">3333</field>\
                                    </record>\
                                </rows>\
                            </store>\
                        </field>\
                    </record>\
                </rows>\
            </store>\
            <store id="so&amp;me&quot;St&lt;or&gt;e2">\
                <rows total="2">\
                    <record>\
                        <field id="id">77</field>\
                        <field id="f1">777</field>\
                        <field id="f2">7777</field>\
                    </record>\
                    <record>\
                        <field id="id">88</field>\
                        <field id="f1">888</field>\
                        <field id="f2">8888</field>\
                    </record>\
                </rows>\
            </store>\
        </data>';

        var pack = crud.decode(response);

        var checkPackage = function(t) {
            t.is(pack.requestId, 1234, 'correct requestId');
            t.is(pack.revision, 999, 'correct revision');

            t.it('someStore1 content is correct', function(t) {
                var holder = pack[someStore1.storeId];

                t.ok(holder, 'There is a holder for the store');
                t.is(holder.rows.length, 2, 'correct number of records');
                t.is(holder.rows[0].id, 77, '0th record has correct id');
                t.is(holder.rows[0].ff1, 777, '0th record has correct ff1');
                t.is(holder.rows[0].ff2, 7777, '0th record has correct ff2');

                t.is(holder.rows[1].id, 88, '1st record has correct id');
                t.is(holder.rows[1].ff1, 888, '1st record has correct ff1');
                t.is(holder.rows[1].ff2, 8888, '1st record has correct ff2');

                t.isDeeply(holder.rows[1].nested, {
                    rows  : [{ id : 33, sub1 : 333, sub2 : 3333 }],
                    total : 4
                }, '1st record has correct nested store data');
            });

            t.it('someStore2 content is correct', function(t) {
                var holder = pack[someStore2.storeId];

                t.ok(holder, 'There is a holder for the store');
                t.is(holder.rows.length, 2, 'correct number of records');
                t.is(holder.rows[0].id, 77, '0th record has correct id');
                t.is(holder.rows[0].f1, 777, '0th record has correct f1');
                t.is(holder.rows[0].f2, 7777, '0th record has correct f2');

                t.is(holder.rows[1].id, 88, '1st record has correct id');
                t.is(holder.rows[1].f1, 888, '1st record has correct f1');
                t.is(holder.rows[1].f2, 8888, '1st record has correct f2');
            });
        };

        t.it('Decodes XML document specified as string', function(t) {
            checkPackage(t);
        });

        pack = crud.decode(getDocument(response));

        t.it('Decodes XML document specified as object', function(t) {
            checkPackage(t);
        });
    });
});
