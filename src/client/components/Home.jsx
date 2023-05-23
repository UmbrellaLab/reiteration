import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import Prompt from './Prompt';

const Home = () => {
  const [codeEditorValue, setCodeEditorValue] = useState('');
  const [promptData, setPromptData] = useState('');
  const [solutions, setSolutions] = useState();

  useEffect(() => {
    // Function to make a request for the latest algorithm and pass it down to the Prompt component
    const fetchLatestAlgorithm = async () => {
      try {
        const response = await fetch('/daily');
        const data = await response.json();
        setPromptData(data);
      } catch (error) {
        console.log('Error retrieving the latest algorithm:', error);
      }
    };

    fetchLatestAlgorithm();
  }, []);

  const handleSubmit = () => {
    fetch('/path', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        codeEditorValue: codeEditorValue
      })
    })
    .then(res => res.json())
    .then((data) => {
      setSolutions(data);
    })
    .catch(err => {
      console.log('Error connecting to server using path \'/path\'');
    })
  };

  const handleClear = () => {
    setCodeEditorValue('');
  };

  return (
    <div className='home-page'>
      <div id='algo-content'>
        <Prompt promptData={promptData} />
        <div id='algo-solutions'>{/* Render the solutions */}</div>
        <CodeMirror
          id='code-mirror'
          value='//Hello World!'
          theme='dark'
          onChange={(newCode) => setCode(newCode)}
          extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
        />
        <button id='submit-code' name='submit-code' type='button' onClick={handleSubmit}>
          Submit
        </button>
        <button id='clr-editor' name='clr-editor' type='button' onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default Home;
