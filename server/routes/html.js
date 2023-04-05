const express = require('express');
const request = require('request');
const jsdom = require('jsdom');
const router = express.Router();

const { JSDOM } = jsdom;

const html2md = {
  dom: '',
  qUrl: '',
  lazyAttrs: ['data-src', 'data-original-src', 'data-original', 'src'],
  dealLazyImg (img) {
    /**
     * 处理懒加载路径
     * 简书：data-original-src
     * 掘金：data-src
     * segmentfault：data-src
     * 知乎专栏：data-original
     **/
    for (let i = 0, len = this.lazyAttrs.length; i < len; i++) {
      const src = img.getAttribute(this.lazyAttrs[i])
      if (src) { return src }
    }
    return ''
  },
  getAbsoluteUrl (p) {
    // 获取图片、链接的绝对路径
    const qOrigin = new URL(this.qUrl).origin || ''
    return new URL(p, qOrigin).href
  },
  changeRelativeUrl () {
    // 转换图片、链接的相对路径
    if (!this.dom) { return '<div>内容出错~</div>' }
    const copyDom = this.dom
    const imgs = copyDom.querySelectorAll('img')
    const links = copyDom.querySelectorAll('a')
    imgs.length > 0 && imgs.forEach((v) => {
      const src = this.dealLazyImg(v)
      v.src = this.getAbsoluteUrl(src)
    })
    links.length > 0 && links.forEach((v) => {
      const href = v.href || this.qUrl
      v.href = this.getAbsoluteUrl(href)
    })

    this.dom = copyDom
    return this
  },
  addOriginText () {
    // 底部添加转载来源声明
    const originDom = new JSDOM('').window.document.createElement('div')
    originDom.innerHTML = `<br/><div>本文转自 <a href="${this.qUrl}" target="_blank">${this.qUrl}</a>，如有侵权，请联系删除。</div>`
    this.dom.appendChild(originDom)
    return this
  },
  getInnerHtml () {
    return this.dom.innerHTML
  },
  returnFinalHtml () {
    return this.changeRelativeUrl().addOriginText().getInnerHtml()
  },
  getDom (html, selector) {
    // 获取准确的文章内容
    const dom = new JSDOM(html);
    const htmlContent = dom.window.document.querySelector(selector)
    return htmlContent
  },
  getTitle (content) {
    // 获取文章的 title
    const title = this.getDom(content, 'title');
    if (title) { return title.textContent }
    return '获取标题失败~'
  },
  getBody (content) {
    // 获取不同平台的文章内容
    const getBySelector = selector => this.getDom(content, selector)

    // 掘金
    if (this.qUrl.includes('juejin.cn')) {
      const htmlContent = getBySelector('.markdown-body')
      const extraDom = htmlContent.querySelector('style')
      const extraDomArr = htmlContent.querySelectorAll('.copy-code-btn')
      extraDom && extraDom.remove()
      extraDomArr.length > 0 && extraDomArr.forEach((v) => { v.remove() })
      html2md.dom = htmlContent
      return this.returnFinalHtml()
    }
    // oschina
    if (this.qUrl.includes('oschina.net')) {
      const htmlContent = getBySelector('.article-detail')
      const extraDom = htmlContent.querySelector('.ad-wrap')
      extraDom && extraDom.remove()
      html2md.dom = htmlContent
      return this.returnFinalHtml()
    }
    // cnblogs
    if (this.qUrl.includes('cnblogs.com')) {
      html2md.dom = getBySelector('#cnblogs_post_body')
      return this.returnFinalHtml()
    }
    // weixin
    if (this.qUrl.includes('weixin.qq.com')) {
      html2md.dom = getBySelector('#js_content')
      return this.returnFinalHtml()
    }
    // 知乎专栏
    if (this.qUrl.includes('zhuanlan.zhihu.com')) {
      const htmlContent = getBySelector('.RichText')
      const extraScript = htmlContent.querySelectorAll('noscript')
      extraScript.length > 0 && extraScript.forEach((v) => { v.remove() })
      html2md.dom = htmlContent
      return this.returnFinalHtml()
    }
    // 慕课专栏
    if (this.qUrl.includes('www.imooc.com')) {
      const htmlContent = getBySelector('.article-con')
      html2md.dom = htmlContent
      return this.returnFinalHtml()
    }
    // learnku
    if (this.qUrl.includes('learnku.com')) {
      const htmlContent = getBySelector('.markdown-body')
      const extraScript = htmlContent.querySelectorAll('.toc-wraper')
      extraScript.length > 0 && extraScript.forEach((v) => { v.remove() })
      const extraToc = htmlContent.querySelectorAll('.markdown-toc')
      extraToc.length > 0 && extraToc.forEach((v) => { v.remove() })
      const extraLink = htmlContent.querySelectorAll('.reference-link')
      extraLink.length > 0 && extraLink.forEach((v) => { v.remove() })
      html2md.dom = htmlContent
      return this.returnFinalHtml()
    }

    // 优先适配 article 标签，没有再用 body 标签
    const htmlArticle = getBySelector('article')
    if (htmlArticle) {
      html2md.dom = htmlArticle
      return this.returnFinalHtml()
    }

    const htmlBody = getBySelector('body')
    if (htmlBody) {
      html2md.dom = htmlBody
      return this.returnFinalHtml()
    }

    return content
  }
};

const mockSiteUa = ['juejin.cn'];
router.get('/byurl', async (req, res, next) => {
  const qUrl = req.query.url || 'https://zhuanlan.zhihu.com/p/68527022'
  html2md.qUrl = qUrl;

  const isMock = mockSiteUa.find(item => qUrl.includes(item))
  const headers = isMock ? {
    'User-Agent': 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
  } : {}

  // 通过请求获取链接的 html
  request({
    url: qUrl,
    headers
  }, (error, response, body) => {
    if (error) {
      res.status(404).send('Url Error')
      return
    }
    res.type('text/json');
    try {
      const json = {
        code: 1,
        title: html2md.getTitle(body),
        html: html2md.getBody(body)
      };
      res.status(200).send(json);
    } catch (error) {
      res.status(200).send({
        code: 0,
        msg: error
      })
    }
  })
});

module.exports = router