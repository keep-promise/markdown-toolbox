import React, { useState, memo } from 'react';
import { get } from './api';
import TurndownService from 'turndown'
import { gfm, tables, strikethrough } from 'turndown-plugin-gfm';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './App.css';

// Register plugins if required
// MdEditor.use(YOUR_PLUGINS_HERE);

// Initialize a markdown parser
const mdParser = new MarkdownIt();

const MarkdownEditor = memo((props) => {
  const { content } = props;

  function handleEditorChange({ html, text }) {
    const { onChange } = props;
    console.log('handleEditorChange', html, text);
    onChange && onChange(text);
  }

  return (
    <MdEditor
      value={content}
      style={{ height: '440px' }}
      renderHTML={text => mdParser.render(text)} 
      onChange={handleEditorChange}
    />
  );
}, (props, nextProps) =>{
  console.log(props, nextProps)
  return props.content === nextProps.content;
});



function App() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('hello markdown');

  const html2md = (str) => {
    const turndownService = new TurndownService({ codeBlockStyle: 'fenced' })
    // Use the gfm plugin
    turndownService.use(gfm)

    // Use the table and strikethrough plugins only
    turndownService.use([tables, strikethrough])
    // 自定义配置
    turndownService.addRule('pre2Code', {
      filter: ['pre'],
      replacement (content) {
        const len = content.length
        // 除了pre标签，里面是否还有code标签包裹，有的话去掉首尾的`（针对微信文章）
        const isCode = content[0] === '`' && content[len - 1] === '`'
        const result = isCode ? content.substr(1, len - 2) : content
        return '```\n' + result + '\n```\n';
      }
    })
    const markdown = turndownService.turndown(str)
    return markdown
  };

  const gethtml = () => {
    if (!url) return;
    get('/gethtml/byurl', { url: url }).then(res => {
      if (res.code === 1) {
        setContent(html2md(res.html));
      } else {
        throw { message: '获取失败' }
      }
    }).catch((err) => {

    });
  }

  const handleChange = (event) => {
    setUrl(event.target.value);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="text-int">Write markdown nice & easy</div>
      </header>
      <div className="App-content">
        <div className="veditor-container">
          <div className="url-submit">
            <input 
              type="text"
              value={url}
              className="form-control" 
              placeholder="请输入url"
              onChange={handleChange}
            >
            </input>
            <button 
              type="button"
              className="btn-secondary"
              onClick={gethtml}
            >
              一键转换
            </button>
          </div>
          <MarkdownEditor 
            content={content}
            onChange={(value) => setContent(value)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

