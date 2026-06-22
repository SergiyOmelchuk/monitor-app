import { useEffect, useState } from 'react';
import { api } from './api';

function App() {
  const [active, setActive] = useState(false);

  async function loadState() {
    const res = await api.get('/toggle');
    setActive(res.data.active);
  }

  async function toggle() {
    const res = await api.post('/toggle');
    setActive(res.data.active);
  }

  useEffect(() => {
    loadState();
  }, []);

  return (
      <div>
        <h1>
          Status: {active ? 'ON' : 'OFF'}
        </h1>

        <button onClick={toggle}>
          Toggle
        </button>
      </div>
  );
}

export default App;