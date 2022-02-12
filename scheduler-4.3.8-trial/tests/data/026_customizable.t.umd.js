"use strict";

//TODO: move it to Core instead of scheduler
StartTest(t => {
  const getByKey = (array, name) => array.find(f => f.name === name);

  const containsKey = (array, name) => !!array.find(f => f.name === name);

  t.ok(Model, 'Model is here');

  class BaseModel extends Model {
    static get fields() {
      return [{
        name: 'id',
        dataSource: 'Usual'
      }, {
        name: 'Field1',
        persist: true
      }, {
        name: 'Field2',
        persist: true
      }, {
        name: 'FieldFoo',
        persist: true
      }];
    }

  }

  t.it('Model.set should return array of modified fields', function (t) {
    const instance = new BaseModel();
    t.isDeeply(instance.set('Field1', instance.get('Field1')), null, 'null returned');
    t.isDeeply(instance.set('Field1', 'foo'), {
      Field1: {
        value: 'foo'
      }
    }, 'Object returned');
  });

  class SubModel extends BaseModel {
    static get fields() {
      return [{
        name: 'subField1',
        dataSource: 'field1',
        persist: false
      }, {
        name: 'subField2',
        dataSource: 'field2'
      }, {
        name: 'Field3',
        type: 'int',
        defaultValue: 53
      }, {
        name: 'FieldFoo',
        persist: false
      }];
    }

    get Field2() {
      return 'yo2';
    }

  } //=========================================================================


  t.it('Testing the base model (the one with customizableFields property)', function (t) {
    const baseModelFields = BaseModel.fields;
    const Field1 = getByKey(baseModelFields, 'Field1');
    t.is(baseModelFields.length, 4, '4 baseModel fields');
    t.ok(Field1 && Field1.persist, '`Field1` was created');
    t.ok(containsKey(baseModelFields, 'Field1'), '`Field1` was created');
    t.ok(containsKey(baseModelFields, 'Field2'), '`Field2` was created');
    t.ok(containsKey(baseModelFields, 'FieldFoo'), '`FieldFoo` was created'); // where would that field come from??
    //        t.ok(containsKey(baseModelFields, 'Usual'), '`Usual` field was also created');

    const baseModel = new BaseModel({
      Field1: 'Field1',
      Field2: 'Field2',
      Usual: 'Usual'
    });
    t.is(baseModel.Field1, 'Field1', 'Getter for customizable field `Field1` uses the correct name');
    t.is(baseModel.Field2, 'Field2', 'Getter for customizable field `Field2` uses the correct name');
    t.notOk(baseModel.Usual, "There's no getter for usual field");
  });
  t.it('Testing the sub model (the one inheriting from base model, and w/o customizableFields)', function (t) {
    // internally fields get reversed...
    const subModelFields = SubModel.fields.reverse(); // TODO: PORT are now adding fields, should replace??

    t.is(subModelFields.length, 4, '4 subModelFields');
    t.is(SubModel.$meta.fields.defs.length, 8, '8 exposed fields');
    t.ok(containsKey(subModelFields, 'subField1'), 'Customizable field `Field1` was inherited as `subField1`');
    t.ok(containsKey(subModelFields, 'subField2'), 'Customizable field `Field2` was inherited as `subField2`');
    t.ok(containsKey(subModelFields, 'Field3'), 'Customizable field `field3` was created');
    t.ok(containsKey(subModelFields, 'FieldFoo'), '`FieldFoo` was created');
    t.notok(getByKey(subModelFields, 'FieldFoo').persist, 'FieldFoo was re-defined');
    const subModel = new SubModel({
      subField1: 'subField1',
      subField2: 'subField2',
      Usual: 'Usual'
    }); //t.is(subModel.Field1, 'subField1', 'Getter for customizable field `Field1` uses the default name');

    t.is(subModel.Field2, 'yo2', 'Custom getter for customizable field `Field2` was not overwritten');
    t.is(subModel.get('subField2'), 'subField2', 'Default getter returns correct data');
    t.notok(subModel.getUsual, "There's no getter for usual field");
    t.notok(subModel.getSubField1, "There's no getter named after overriden field");
  });
});