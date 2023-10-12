/**
 * 添加/移除水印
 * @param  id 仓库名称
 * @param  targetDom 目标dom
 * @param  watermark 水印名称
 */
let Watermark = {}
let fillWatermark = (id, targetDom, watermark) => {
  // 创建一个画布
  let canvas = document.createElement('canvas')
  // 设置画布的长宽
  canvas.width = 728
  canvas.height = 580
  let Wcan = canvas.getContext('2d')
  // 设置倾斜角度
  Wcan.rotate(-15 * Math.PI / 180)
  // 设置字体
  Wcan.font = '18px Vedana'
  // 设置填充颜色
  Wcan.fillStyle = 'rgba(200, 200, 200, 0.50)'
  // 设置文本内容的当前对齐方式
  Wcan.textAlign = 'left'
  // 设置在绘制文本时使用的当前文本基线
  Wcan.textBaseline = 'Middle'
  // 在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  // Wcan.fillText(watermark, canvas.width / 4, canvas.height / 2);
  Wcan.fillText(watermark, 263, 108);
  let div = document.createElement('div')
  div.id = id
  div.style.pointerEvents = 'none'
  div.style.top = '40px'
  div.style.left = '0'
  div.style.position = 'fixed'
  div.style.zIndex = '100000'
  div.style.width = document.documentElement.clientWidth + 'px'
  div.style.height = targetDom.clientHeight + 'px'
  div.style.background = 'url(' + canvas.toDataURL('image/png') + ') left top repeat'
  targetDom.appendChild(div)
  return id
}

Watermark.set = (id, targetDom, watermark) => {
  fillWatermark(id, targetDom, watermark)
}
Watermark.remove = (id, targetDom) => {
  targetDom.removeChild(document.getElementById(id))
}
// # export default Watermark
