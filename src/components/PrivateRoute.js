import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ isAuthenticated }) => {
  // 如果用户已经认证，显示组件，否则重定向到登录页面
  return isAuthenticated ? <Outlet /> : <Navigate to="/user" />;
};

export default PrivateRoute;
