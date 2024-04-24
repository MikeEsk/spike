import { render } from 'endr';
import App from '../src/App';

const { document } = globalThis;

render(<App />, document.getElementById('root'));

