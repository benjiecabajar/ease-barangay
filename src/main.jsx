import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import SignIn from './pages/sign_in'
import ResidentHome from './pages/resident-home'
import ModeratorHome from './pages/moderator-home' 
import AdminHome from './pages/admin-home'
import OfflineScreen from './components/OfflineScreen'



function useOnlineStatus() {  
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline',handleOffline);
    };
  }, []);

  return isOnline;
}

function AppWrapper() {
  const isOnline = useOnlineStatus();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/resident" element={<ResidentHome />} />
        <Route path="/moderator" element={<ModeratorHome />} />
        <Route path="/admin" element={<AdminHome />} />
      </Routes>
      {!isOnline && <OfflineScreen />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  </StrictMode>,
)
