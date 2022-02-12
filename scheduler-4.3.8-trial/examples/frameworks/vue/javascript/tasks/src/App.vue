<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-tasks"
        />
        <bryntum-scheduler ref="scheduler" v-bind="schedulerConfig" />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader
} from '@bryntum/scheduler-vue';
import {
    AjaxHelper,
    DateHelper,
    DateField,
    ResourceModel,
    EventHelper
} from '@bryntum/scheduler';
import { schedulerConfig, colors } from './AppConfig.js';

// The data for this demo (data/data.json) uses the 'clients' property to hold children of resources
ResourceModel.childrenField = 'clients';

export default {
    name: 'App',

    components: {
        BryntumScheduler,
        BryntumDemoHeader
    },

    data() {
        return {
            schedulerConfig
        };
    },

    mounted() {
        const scheduler = this.$refs.scheduler.instance;

        // This listener is specific to the Tasks demo and can be removed if not needed
        // Handle click on those add divs
        EventHelper.addListener({
            element: scheduler.element,
            delegate: '.add',
            click(event) {
                const employee = scheduler.getRecordFromElement(
                    event.target
                );
                if (employee) {
                    // Add a new client with random color
                    employee.appendChild({
                        name: 'New client',
                        color: colors[
                            Math.floor(Math.random() * colors.length)
                        ].toLowerCase()
                    });
                }
            }
        });
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
