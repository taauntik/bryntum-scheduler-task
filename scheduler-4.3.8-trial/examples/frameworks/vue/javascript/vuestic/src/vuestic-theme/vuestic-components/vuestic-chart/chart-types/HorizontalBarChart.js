import { HorizontalBar } from 'vue-chartjs'
import { chartMixin } from './chartMixin.js'

export default {
  extends: HorizontalBar,
  mixins: [chartMixin],
}
