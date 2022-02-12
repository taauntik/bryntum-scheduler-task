<template>
  <div class="demo-container">
    <div class="demo-container__item">
      <vuestic-slider-color-picker v-model="value"/>
      <vuestic-slider-color-picker v-model="value" style="padding-top: 20px"/>
      {{value}}
    </div>
  </div>
</template>

<script>

import VuesticSliderColorPicker from './VuesticSliderColorPicker.vue'

export default {
  components: {
    VuesticSliderColorPicker,
  },
  data () {
    return {
      value: '#34495e',
    }
  },
}
</script>
