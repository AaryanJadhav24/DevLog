import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@components/Navbar';
import Sidebar from '@components/Sidebar';
import Dashboard from '@pages/Dashboard';
import LogEntry from '@pages/LogEntry';
import LogList from '@pages/LogList';
import Stats from '@pages/Stats';
import Footer from '@components/Footer';


// Simple layout component for the main content
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Wrap each route with the Layout component */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/logs" element={
            <Layout>
              <LogList />
            </Layout>
          } />
          <Route path="/logs/new" element={
            <Layout>
              <LogEntry />
            </Layout>
          } />
          <Route path="/logs/:id" element={
            <Layout>
              <LogEntry />
            </Layout>
          } />
          <Route path="/stats" element={
            <Layout>
              <Stats />
            </Layout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
