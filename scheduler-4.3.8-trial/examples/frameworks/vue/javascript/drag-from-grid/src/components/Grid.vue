<!--
 * Unplanned grid component
-->
<template>
    <div class="grid-container"></div>
</template>

<script>
    import Grid from '../lib/UnplannedGrid.js';

    // export Grid
    export default {
        props: {
            config : Object
        },

        // runs once when component attached to DOM
        mounted() {
            const config = {
                ...this.config,
                appendTo   : this.$el,
                eventStore : this.$parent.$refs.scheduler.instance.eventStore
            }

            this.grid = new Grid(config);
        }
    }
</script>
