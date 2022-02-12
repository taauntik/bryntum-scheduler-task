<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-drag-from-grid"
        />
        <div class="demo-toolbar align-right">
            <bryntum-button
                tooltip="Toggles whether to automatically reschedule overlapping tasks"
                icon="b-fa b-fa-calendar"
                :toggleable="true"
                text="Auto reschedule"
                @click="onAutoReschedule"
            />
        </div>
        <div class="content-container">
            <bryntum-scheduler
                ref="scheduler"
                v-bind="schedulerConfig"
            />
            <grid ref="grid" :config="gridConfig"></grid>
        </div>
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumButton
} from '@bryntum/scheduler-vue';
import { schedulerConfig, gridConfig } from './AppConfig';
import Grid from './components/Grid.vue';
import Drag from './lib/Drag.js';
import { Toast } from '@bryntum/scheduler';

export default {
    name: 'App',

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumButton,
        Grid
    },

    data() {
        return {
            schedulerConfig,
            gridConfig
        };
    },

    mounted() {
        const scheduler = this.$refs.scheduler.instance;

        scheduler.eventStore.on({
            update: this.onEventStoreUpdate,
            add: this.onEventStoreAdd,
            thisObj: scheduler
        });

        new Drag({
            grid: this.$refs.grid.grid,
            schedule: this.$refs.scheduler.instance,
            constrain: false,
            outerElement: this.$refs.grid.grid.element
        });

        Toast.show({
            timeout: 3500,
            html:
                'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });
    },

    methods: {
        // specific to this example - reschedules the tasks
        onEventStoreUpdate({ record }) {
            const scheduler = this.$refs.scheduler.instance;
            if (scheduler.autoRescheduleTasks) {
                scheduler.eventStore.rescheduleOverlappingTasks(
                    record
                );
            }
        },

        // specific to this example - reschedules the tasks
        onEventStoreAdd({ records }) {
            const scheduler = this.$refs.scheduler.instance;
            if (scheduler.autoRescheduleTasks) {
                records.forEach(eventRecord =>
                    scheduler.eventStore.rescheduleOverlappingTasks(
                        eventRecord
                    )
                );
            }
        },
        // specific to this example - toggles auto-rescheuling
        onAutoReschedule({ source: button }) {
            this.$refs.scheduler.instance.autoRescheduleTasks =
                button.pressed;
        }
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
