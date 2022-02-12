<template>
  <div class="demo-container">
    <div class="demo-container__item">
      <vuestic-simple-palette-picker
        v-model="value"
        :palette="palette"
      />
      <vuestic-simple-palette-picker
        v-model="value"
        :palette="palette"
      />
      {{ value }}
    </div>
  </div>
</template>

<script>
import VuesticSimplePalettePicker from './VuesticSimplePalettePicker.vue'
import { colorArray } from './VuesticTheme.js'
import VuesticPalletCustom from './VuesticPalletCustom.vue'

export default {
  components: {
    VuesticSimplePalettePicker,
    VuesticPalletCustom,
  },
  data () {
    return {
      value: '#AAA',
      palette: colorArray,
    }
  },
}
</script>
