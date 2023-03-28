import React, { useState } from 'react';
import './App.css';
import { get } from './api';
import TurndownService from 'turndown'
import { gfm, tables, strikethrough } from 'turndown-plugin-gfm'
// import MarkdownEdit from 'markdown-editor-reactjs'
import Editor from 'wrap-md-editor';



function MdEditor(props) {
    const { content } = props;
    // const config = {
    //   markdown: content,
    //   onload: (editor, func) => {
    //     let md = editor.getMarkdown();
    //     let html = editor.getHTML();
    //   }
    // }
    console.log('mardown', content)
    return (
      <Editor
        config={{
          markdown: content,
          onload: (editor, func) => {
            // let md = editor.getMarkdown();
            // let html = editor.getHTML();
          }
        }}
      />
    )
}

function App() {
  
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
        return '```\n' + result + '\n```\n'
      }
    })
    const markdown = turndownService.turndown(str)
    return markdown
  };

  const gethtml = () => {
    get('/gethtml/byurl').then(res => {
      if (res.code === 1) {
        setContent(html2md(res.html));
      }
    }).catch((err) => {

    });
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
              className="form-control" 
              placeholder="请输入url"
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
          <MdEditor content={content} />
        </div>
      </div>
    </div>
  );
}

export default App;

