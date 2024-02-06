import { getDateRangeAPI } from '@/apis/clickstream_node'
import { defineStore } from 'pinia'

type YearMonthData = {
  [year: number]: number[]
}

export const useDateStore = defineStore(
  'date',
  () => {
    const dates: Ref<string[]> = ref([])
    const years: Ref<number[]> = ref([])
    const months: Ref<YearMonthData> = ref([])
    const latestDate: Ref<string> = ref('')

    const getDateRange = async (lang = 'zh'): Promise<void> => {
      const res = await getDateRangeAPI(lang)
      const dateRange = res.data
      dates.value = dateRange.dates
      years.value = dateRange.years
      months.value = dateRange.months
      latestDate.value = dateRange.latestDate
    }

    const getNearestDate = (currDate: string): string => {
      let index = dates.value.indexOf(currDate)
      let nearestDate = dates.value[index - 1] || dates.value[index + 1]
      return nearestDate
    }

    return {
      dates,
      years,
      months,
      latestDate,
      getDateRange,
      getNearestDate
    }
  },
  {
    persist: true
  }
)
