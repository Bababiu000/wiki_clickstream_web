import FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'

export const exportToExcel = (domId: string, filename: string = 'data') => {
  const xlsxParam = { raw: true } //转化成Excel使用原始格式
  const elTable = XLSX.utils.table_to_book(document.getElementById(domId), xlsxParam)
  const wbout = XLSX.write(elTable, { bookType: 'xlsx', bookSST: true, type: 'array' })
  try {
    FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename + '.xlsx')
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.log(e, wbout)
    }
  }
  return wbout
}

export const exportImg = (title: string = 'image', echartsBox: string): void => {
  let myChart: echarts.EChartsType = echarts.getInstanceByDom(document.getElementById(echartsBox)!)!
  let picInfo: string = myChart.getDataURL({
    pixelRatio: 1,
    backgroundColor: '#fff'
  })
  let elink = document.createElement('a')
  elink.download = title
  elink.style.display = 'none'
  elink.href = picInfo
  document.body.appendChild(elink)
  elink.click()
  URL.revokeObjectURL(elink.href)
  document.body.removeChild(elink)
}
