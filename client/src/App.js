import React from 'react';
import Vditor from "vditor";
import './App.css';
import "vditor/dist/index.css";
import { get } from './api';

const Veditor = () => {
  // const [vd, setVd] = React.useState<Vditor>({});
  React.useEffect(() => {
    const vditor = new Vditor("vditor", {
      width: '100%',
      minHeight: 400,
      mode: 'sv',
      after: () => {
        vditor.setValue("`Vditor` 最小代码示例");
      }
    });
  }, []);
  return <div id="vditor" />;
};

function App() {

  const gethtml = () => {
    get('/gethtml').then(res => {
      console.log('gethtml', res)
    })
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
              class="form-control" 
              placeholder="请输入url"
            >
            </input>
            <button 
              type="button" 
              class="btn-secondary"
              onClick={gethtml}
            >
              一键转换
            </button>
          </div>
          <Veditor />
        </div>
      </div>
    </div>
  );
}

export default App;

