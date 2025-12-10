import React from 'react';
import ChatPage from './pages/chats';
import RegisterPage from './pages/register';
import LoginPage from './pages/Login';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  );
};

export default App;