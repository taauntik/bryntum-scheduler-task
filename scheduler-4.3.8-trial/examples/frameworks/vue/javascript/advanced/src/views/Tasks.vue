<!--
 * Tasks component
 -->

<template>
    <div class="home">
        <bryntum-scheduler
            ref="tasks"
            v-bind="tasksConfig"
        />
    </div>
</template>

<script>
    import { tasksConfig } from '@/AppConfig';
    import { BryntumScheduler } from '@bryntum/scheduler-vue';
    import { ResourceModel } from '@bryntum/scheduler';

    // The data for this demo (data/data.json) uses the 'clients' property to hold children of resources
    ResourceModel.childrenField = 'clients';

    export default {
        data() {
            return {
                tasksConfig
            }
        },
        components : {
            BryntumScheduler
        }
    }
</script>
