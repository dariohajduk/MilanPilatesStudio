import React, { useContext } from 'react';
import LogoContext from '../contexts/LogoContext';

const Logo = () => {
  const { logoUrl, loading } = useContext(LogoContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <img src={logoUrl} alt="Logo" />;
};

export default Logo;