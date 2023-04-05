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

const THEME_COLOR = {
  green: {
    color1: '#06ad89',
    color2:  '#5feca5',
  },
  dark: {
    color1: 'rgb(31, 34, 39)',
    color2:  'rgb(20, 31, 49)',
  },
  default: {
    color1: '#7832e2',
    color2:  '#c26fdb',
  },
}

function App() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('hello markdown');

  const html2md = (str) => {
    const turndownService = new TurndownService(
      // { codeBlockStyle: 'fenced' }
    )
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

  const setTheme = (key) => {
    const theme = THEME_COLOR[key] || THEME_COLOR.default
    document.documentElement.style.setProperty('--color1', theme.color1);
    document.documentElement.style.setProperty('--color2', theme.color2);
  }

  const handleChange = (event) => {
    setUrl(event.target.value);
  }

  return (
    <div className="App">
      <div className="App-banner">
        <div className="header">
          <div className="text-int">Write Markdown Nice & Easy</div>
          <div className="theme-control">
          <div className="icon-item">
            <a className="icon-link" href="https://github.com/keep-promise/markdown-toolbox" target="_blank">
              <svg width="24" height="24" fill="beige" aria-hidden="true" viewBox="0 0 16 16" version="1.1">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              <div className="icon-text">Github</div>
            </a>
          </div>
          <div 
            className="default-color"
            onClick={() => setTheme('default')}
          >
            默认主题
          </div>
          <div 
            className="green-color"
            onClick={() => setTheme('green')}
          >
            浅绿主题
          </div>
          <div 
            className="green-color"
            onClick={() => setTheme('dark')}
          >
            黑色主题
          </div>
        </div>
        </div>
        <div className="icon-container">
        </div>
      </div>
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

