<!-- Application -->
<template>
    <div id="container">
        <bryntum-demo-header
            link="../../../../../#example-frameworks-vue-javascript-simple"
        />
        <div class="demo-toolbar align-right">
            <bryntum-checkbox
                text="Stripe Feature"
                :checked="false"
                @action="handleToggle($event, 'stripe')"
            />
            <bryntum-checkbox
                text="Column Lines Feature"
                :checked="true"
                @action="handleToggle($event, 'columnLines')"
            />
        </div>
        <bryntum-scheduler
            ref="scheduler"
            v-bind="schedulerConfig"
            :stripeFeature="stripe"
            :columnLinesFeature="columnLines"
        />
    </div>
</template>

<script>
import {
    BryntumScheduler,
    BryntumDemoHeader,
    BryntumCheckbox
} from "@bryntum/scheduler-vue";
import { schedulerConfig } from "./AppConfig.js";

export default {
    name: "App",

    components: {
        BryntumDemoHeader,
        BryntumScheduler,
        BryntumCheckbox
    },

    methods: {
        handleToggle({ checked }, feature) {
            this[feature] = { disabled: !checked };
        }
    },

    data() {
        return {
            schedulerConfig,
            stripe: { disabled: true },
            columnLines: { disabled: false }
        };
    }
};
</script>

<style lang="scss">
@import "./App.scss";
</style>
