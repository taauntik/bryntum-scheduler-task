<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-drag-onto-tasks"
        />
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
    BryntumDemoHeader
} from '@bryntum/scheduler-vue/';
import { schedulerConfig, gridConfig } from './AppConfig.js';
import { Toast } from '@bryntum/scheduler';
import Grid from './components/Grid.vue';
import Drag from './lib/Drag.js';

export default {
    name: 'app',

    // Local components
    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        Grid
    },

    // Function that returns data
    data() {
        // console.log(schedulerConfig);
        return {
            schedulerConfig,
            gridConfig
        };
    },

    mounted() {
        const grid = this.$refs.grid.grid,
            schedule = this.$refs.scheduler.instance,
            outerElement = grid.element,
            equipmentStore = grid.store;
        new Drag({
            grid,
            schedule,
            outerElement
        });

        Toast.show({
            timeout: 3500,
            html:
                'Please note that this example uses the Bryntum Grid, which is licensed separately.'
        });

        schedule.equipmentStore = equipmentStore;
        schedule.onEquipmentStoreLoad =
            schedulerConfig.onEquipmentStoreLoad;

        schedule.equipmentStore.on(
            'load',
            schedule.onEquipmentStoreLoad.bind(schedule)
        );

        equipmentStore.load();
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
