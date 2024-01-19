import { getDateRangeAPI } from '@/apis/clickstream_node'
import { defineStore } from 'pinia'

export const useDateStore = defineStore(
  'date',
  () => {
    const years: Ref<number[]> = ref([])
    const months: Ref<number[]> = ref([])
    const latestDate: Ref<string> = ref('')

    const getDateRange = async (lang = 'zh'): Promise<void> => {
      const res = await getDateRangeAPI(lang)
      const dateRange = res.data
      years.value = dateRange.years
      months.value = dateRange.months
      latestDate.value = dateRange.latestDate
    }
    return {
      years,
      months,
      latestDate,
      getDateRange
    }
  },
  {
    persist: true
  }
)
