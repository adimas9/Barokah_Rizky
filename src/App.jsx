import React, { useState } from 'react';
import Login from './components/Login';
import OwnerDashboard from './components/OwnerDashboard';
import CustomerDashboard from './components/CustomerDashboard';

function App() {
  const [user, setUser] = useState(null); // { username, role }

  const handleLogin = (username) => {
    if (username === 'owner') {
      setUser({ username, role: 'owner' });
    } else if (username === 'customer') {
      setUser({ username, role: 'customer' });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === 'owner') {
    return <OwnerDashboard onLogout={handleLogout} />;
  }

  // Fallback to Customer
  return <CustomerDashboard onLogout={handleLogout} />;
}

export default App;
