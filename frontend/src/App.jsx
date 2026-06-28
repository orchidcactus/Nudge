import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Upload from './pages/Upload';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="queue" element={<Queue />} />
            <Route path="upload" element={<Upload />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

