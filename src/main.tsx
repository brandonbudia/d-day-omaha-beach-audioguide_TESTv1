import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './components/OfflineManager.css';
import './pages/visit-presentation.css';
import './pages/player-presentation.css';

createRoot(document.getElementById('root')!).render(<App />);
