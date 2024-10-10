import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuthentication = (Component) => {
  return (props) => {
    const token = localStorage.getItem('accesstoken');
    const refreshtoken = localStorage.getItem('refreshtoken');
    const navigate = useNavigate();

    useEffect(() => {
      if (!token && !refreshtoken) {
        navigate('/signin');
      }
    }, [token, refreshtoken, navigate]);
    
    return <Component {...props} />;
  };
};

export default withAuthentication;