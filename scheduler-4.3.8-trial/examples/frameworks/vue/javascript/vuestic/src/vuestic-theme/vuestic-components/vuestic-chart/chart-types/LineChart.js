import { Line } from 'vue-chartjs'
import { chartMixin } from './chartMixin.js'

export default {
  extends: Line,
  mixins: [chartMixin],
}
