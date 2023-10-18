
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

/*
* 简书：data-original-src
* 掘金：data-src
* segmentfault：data-src
* 知乎专栏：data-original
*/
const LAZYATTRS = ['data-src', 'data-original-src', 'data-original', 'src'];

const RuleFnMap = [
  // 掘金
  {
    rule: (url: string) => url.includes('juejin.cn'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('.markdown-body');
      const extraDom = ele.querySelector('style')
      const extraDomArr = ele.querySelectorAll('.copy-code-btn')
      extraDom && extraDom.remove()
      extraDomArr.length > 0 && extraDomArr.forEach((v) => { v.remove() })
      return ele;
    }
  },
  // oschina
  {
    rule: (url: string) => url.includes('oschina.net'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('.article-detail');
      const extraDom = ele.querySelector('.ad-wrap')
      extraDom && extraDom.remove();
      return ele;
    }
  },
  // 微信
  {
    rule: (url: string) => url.includes('weixin.qq.com'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('#js_content');
      return ele;
    }
  },
  {
    rule: (url: string) => url.includes('zhuanlan.zhihu.com'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('.RichText');
      const extraScript = ele.querySelectorAll('noscript');
      extraScript.length > 0 && extraScript.forEach((v) => { v.remove() })
      return ele;
    }
  },
  // 慕课专栏
  {
    rule: (url: string) => url.includes('www.imooc.com'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('.article-con');
      return ele;
    }
  },
  {
    // 慕课专栏  {
    rule: (url: string) => url.includes('learnku.com'),
    exec: (dom) => {
      const ele = dom.window.document.querySelector('.markdown-body');
      const extraScript = ele.querySelectorAll('.toc-wraper')
      extraScript.length > 0 && extraScript.forEach((v) => { v.remove() })
      const extraToc = ele.querySelectorAll('.markdown-toc')
      extraToc.length > 0 && extraToc.forEach((v) => { v.remove() })
      const extraLink = ele.querySelectorAll('.reference-link')
      extraLink.length > 0 && extraLink.forEach((v) => { v.remove() })
      return ele;
    }
  },
  {
    rule: () => true,
    exec: (dom) => {
      // 优先适配 article 标签，没有再用 body 标签
      const ele = dom.window.document.querySelector('article');

      if (ele) {
          return ele;
      }

      const _ele = dom.window.document.querySelector('body');
      if (_ele) {
        return _ele;
      }
      return dom;
    }
  }
];

export class ArticleDom {
  dom: any;
  url: string;

  constructor(url) {
    this.url = url;
  }

  private getInnerHtml () {
    return this.dom.innerHTML;
  }

  /**
   * 懒加载处理
   **/
  getLazyImg = (img) => {
    for (let i = 0, len = LAZYATTRS.length; i < len; i++) {
      const src = img.getAttribute(LAZYATTRS[i])
      if (src) { return src }
    }
    return '';
  }

  // 获取图片、链接的绝对路径
  getOriginUrl = (p) => {
    const qOrigin = new URL(this.url).origin || '';
    return new URL(p, qOrigin).href
  }

  // 图片、链接的相对路径处理
  setRelativePath = () => {
    if (!this.dom) { return this; }
    const _dom = this.dom
    const imgs = _dom.querySelectorAll('img');
    const links = _dom.querySelectorAll('a');
    imgs.length > 0 && imgs.forEach((v) => {
      const src = this.getLazyImg(v);
      v.src = this.getOriginUrl(src);
    })
    links.length > 0 && links.forEach((v) => {
      const href = v.href || this.url;
      v.href = this.getOriginUrl(href)
    })

    this.dom = _dom;
  }

  // 底部添加转载来源声明
  setArticleSource = () => {
    const divEle = new JSDOM('').window.document.createElement('div')
    divEle.innerHTML = `<br/><div>本文转自 <a href="${this.url}" target="_blank">${this.url}</a>，如有侵权，请联系删除。</div>`
    this.dom.appendChild(divEle);
    return this;
  }

  getArticleContent () {
    this.setRelativePath();
    this.setArticleSource();
    return this.getInnerHtml();
  }

  getEleBySelect (html, selector) {
    // 获取准确的文章内容
    const dom = new JSDOM(html);
    const ele = dom.window.document.querySelector(selector);
    return ele;
  }

  // 获取文章标题
  getTitle (html) {
    const title = this.getEleBySelect(html, 'title');
    if (title) { return title.textContent }
    return '暂无文章标题';
  }

  // 获取文章内容
  getArticleHtml (html) {
    const dom = new JSDOM(html);
    const RuleFn = RuleFnMap.find((RuleFn) => RuleFn.rule(this.url));
    return RuleFn.exec(dom);
  }

}

