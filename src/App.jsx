import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Songs from './Components/Songs';
import Sidebar from './Components/Sidebar';
import Favorities from './Components/Favorities';
import Playlist from './Components/Playlist';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/songs" />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/favorities" element={<Favorities />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="*" element={<div style={{textAlign: 'center', padding: '50px'}}><h2>404 - Page Not Found</h2><p>The page you're looking for doesn't exist.</p></div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
