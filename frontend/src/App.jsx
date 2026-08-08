import React, { useState } from 'react';
import Landing from './pages/Landing';
import Library from './pages/Library';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
    setShowAdmin(false);
  };

  const handleAdminToggle = () => {
    setShowAdmin(!showAdmin);
  };

  if (!user) {
    return <Landing onSignIn={handleSignIn} />;
  }

  if (showAdmin) {
    return <Admin onBack={handleAdminToggle} />;
  }

  return <Library user={user} onSignOut={handleSignOut} onAdminClick={handleAdminToggle} />;
}
