
// 参考：https://mp.weixin.qq.com/s?__biz=MjM5MDA2MTI1MA==&mid=2649103879&idx=2&sn=50549c14521a3072453a4f1fbadbea11&chksm=be5839aa892fb0bcddaedcd2635776b5edf55f3706b16a6bb1c40fc57dfa935e56f48239bc0c&scene=27


function imgWatermark (dom, text) {
  let input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  document.getElementsByTagName('body')[0].appendChild(input);
  input.onchange = async () => {
    let img = await blobToImg(input.files[0])
    let canvas = imgToCanvas(img)
    let blob = await watermark(canvas, text)
    // 此处将Blob读取到img标签，并在dom内渲染出来；如果是上传文件，可以将blob添加到FormData中
    let newImage = await blobToImg(blob)
    dom.appendChild(newImage)
  }
  input.click()
}



function blobToImg (blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.addEventListener('load', () => {
      let img = new Image()
      img.src = reader.result
      img.addEventListener('load', () => resolve(img))
    })
    reader.readAsDataURL(blob)
  })
}



function imgToCanvas (img) {
  let canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  let ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return canvas
}


function watermark (canvas, text) {
  return new Promise((resolve, reject) => {
    let ctx = canvas.getContext('2d')
    // 设置填充字号和字体，样式
    ctx.font = "24px 宋体"
    ctx.fillStyle = "#FFC82C"
    // ctx.fillStyle = 'rgba(255, 255, 255, .95)';
    // 设置右对齐
    ctx.textAlign = 'right'
    // 在指定位置绘制文字，这里指定距离右下角20坐标的地方
    ctx.fillText(text, canvas.width - 20, canvas.height - 20)
    canvas.toBlob(blob => resolve(blob))
  })
}



