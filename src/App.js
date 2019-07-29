import React from 'react';
import FileExplorer from "./FileExplorer";
import Editor from "./Editor";
import './global.css';

function App() {

    return (
        <div className={'flex'}>
            <FileExplorer/>
            <Editor/>
        </div>
    );
}

export default App;
