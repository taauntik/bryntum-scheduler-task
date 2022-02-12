<!-- Button -->
<template>
    <button class="b-button b-grey" @click="click($event)">
        <span>{{ record.city }}</span>
    </button>
</template>

<script>
import { Toast } from '@bryntum/scheduler';

export default {
    name: 'GreyButton',
    props: ['record'],
    methods: {
        click() {
            Toast.show(`${this.record.city}`);
        }
    }
};
</script>
