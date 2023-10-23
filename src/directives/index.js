const blurFix = e => {
  let target = e.target
  if (target.nodeName == 'SPAN' || target.nodeName == 'I') {
    target = e.target.parentNode
  }
  target.blur()
}

export const blurFixPlugin = {
  install(app) {
    app.directive('blur-fix', {
      mounted(el, binding) {
        el.addEventListener('click', blurFix)
      },
      // 离开一定要销毁卸载
      unmounted(el, binding) {
        el.removeEventListener('click', blurFix)
      }
    })
  }
}
