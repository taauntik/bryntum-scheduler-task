({
    jsLoaded : function(component, event, helper) {
        component.set("v.jsLoaded", true);

        helper.createScheduler(component);
    }
})