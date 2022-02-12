<!-- Application -->
<template>
    <bryntum-demo-header
        link="../../../../../#example-frameworks-vue-3-javascript-simple"
    />
    <div class="demo-toolbar align-right">
        <div class="demo-toolbar align-right">
            <bryntum-checkbox
                text="Stripe Feature"
                :checked="false"
                @action="({ checked }) => (stripe = { disabled: !checked })"
            />
            <bryntum-checkbox
                text="Column Lines Feature"
                :checked="true"
                @action="({ checked }) => (columnLines = { disabled: !checked })"
            />
        </div>
        <bryntum-slider
            v-bind="sliderConfig"
            :value="barMargin"
            @input="({ value }) => (barMargin = value)"
        />
    </div>
    <bryntum-scheduler
        ref="scheduler"
        v-bind="schedulerConfig"
        :barMargin="barMargin"
        :stripeFeature="stripe"
        :columnLinesFeature="columnLines"
    />
</template>

<script>
import { ref, reactive } from 'vue';
import {
    BryntumDemoHeader,
    BryntumScheduler,
    BryntumSlider,
    BryntumCheckbox
} from '@bryntum/scheduler-vue-3';
import { useSchedulerConfig, sliderConfig } from '@/AppConfig';

export default {
    name: 'App',

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumSlider,
        BryntumCheckbox
    },

    setup() {
        const barMargin = ref(4);
        const stripe = ref({ disabled: true });
        const columnLines = ref({ disabled: false });
        const schedulerConfig = reactive(useSchedulerConfig());

        return {
            schedulerConfig,
            sliderConfig,
            barMargin,
            stripe,
            columnLines
        };
    }
};
</script>

<style lang="scss">
@import './App.scss';
</style>
