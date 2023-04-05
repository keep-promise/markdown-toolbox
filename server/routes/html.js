const express = require('express');
const request = require('request');
const router = express.Router();
const { ArticleDom } = require('../util/articleDom');


// const SiteUaList= ['juejin.cn'];
router.get('/byurl', async (req, res, next) => {
  const url = req.query.url || 'https://zhuanlan.zhihu.com/p/68527022';
  const articleDom = new ArticleDom(url);

  // const includes = SiteUaList.find(item => url.includes(item))
  // const headers = includes ? {
  //   'User-Agent': 'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
  // } : {}

  // 通过请求获取链接的 html
  request({
    url: url,
    headers
  }, (error, __response, body) => {
    if (error) {
      res.status(404).send('Url Error')
      return
    }
    res.type('text/json');
    try {

      const data = {
        code: 1,
        title: articleDom.getTitle(body),
        html: articleDom.getArticleHtml(body)
      };
      res.status(200).send(data);
    } catch (error) {
      res.status(200).send({
        code: 0,
        msg: error
      })
    }
  })
});

module.exports = router;
