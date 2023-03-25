// import React from 'react';
// import Vditor from "vditor";
// import './App.css';
// import "vditor/dist/index.css";

// const Veditor = () => {
//   const [vd, setVd] = React.useState<Vditor>({});
//   React.useEffect(() => {
//     const vditor = new Vditor("vditor", {
//       width: '100%',
//       minHeight: 400,
//       mode: 'sv',
//       after: () => {
//         vditor.setValue("`Vditor` 最小代码示例");
//         setVd(vditor);
//       }
//     });
//   }, []);
//   return <div id="vditor" className="vditor" />;
// };

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <Veditor />
//       </header>
//     </div>
//   );
// }

// export default App;

import "vditor/dist/index.css";
import React, { useEffect } from "react";
import Vditor from "vditor";

const App = () => {
  // const [vd, setVd] = React.useState<Vditor>({});
  useEffect(() => {
    const vditor = new Vditor("vditor", {
      after: () => {
        vditor.setValue("`Vditor` 最小代码示例");
        // setVd(vditor);
      }
    });
  }, []);
  return <div id="vditor" className="vditor" />;
};

export default App;
