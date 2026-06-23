import { useEffect, useState } from 'react';
import { api } from './api';

function App() {
  const [active, setActive] = useState(false);
  const [name, setName] = useState(false);
  const [inputName, setInputName] = useState('');

  async function loadState() {
    const res = await api.get('/toggle');
    setActive(res.data.active);
      setName(res.data.name || '');
  }

  async function toggle() {
    const res = await api.post('/toggle', { name: inputName });
    setActive(res.data.active);
    setName(res.data.name || '');
    setInputName('');
  }

  useEffect(() => {
    void loadState();
  }, []);

  return (
      <div>
        <h1>
            {`Status of ${name}: `}{active ? 'ON' : 'OFF'}
        </h1>
          <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter name"
          />

        <button onClick={toggle}>
            Toggle
        </button>
      </div>
  );
}

export default App;