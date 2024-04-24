
import { useEffect, useState, Fragment } from 'endr';
import endrLogo from './assets/endr.png'
import viteLogo from '/vite.svg'
import './App.css'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <Fragment>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://github.com/caseywebdev/endr" target="_blank">
          <img src={endrLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + Endr</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
     
    </Fragment>
  )
}

export default App


