import { Doughnut } from 'vue-chartjs'
import { chartMixin } from './chartMixin.js'

export default {
  extends: Doughnut,
  mixins: [chartMixin],
}
