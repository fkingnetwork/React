import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Login from './components/Login';
import BookList from './components/BookList';
import Carts from './components/Carts';
import Register from './components/Register';
import Home from './components/Home';
import Admin_user from './components/Admin_user';
import axios from 'axios';
import PrivateRoute from './components/PrivateRoute';
import styles from './App.css'; // or './App.module.css' if using CSS Modules

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 是否已登录
    const [showButton, setShowButton] = useState(false); // 控制按钮显示状态
    const location = useLocation();  // 获取当前路径

    const handleLogin = (status) => {
        setIsAuthenticated(status); // 登录时更新状态
    };

    const handleButtonClick = async () => {
        try {
            // 发送请求退出登录
            const response = await axios.post("http://localhost:7071/user/quit");
            console.log("Response:", response);
            localStorage.removeItem("token");
            // 请求成功后刷新页面，跳转到登录页面
            window.location.href = 'http://localhost:3000/user';
        } catch (error) {
            console.error("Error in quitting:", error);
        }
    };

    // 判断当前路径是否以 "/user" 开头
    const isUserPath = location.pathname.startsWith('/user');

    // 页面路径变化时，设置按钮显示逻辑
    useEffect(() => {
        let timer;

        if (!isUserPath) {
            // 当离开 /user 页面时，5秒后显示按钮
            timer = setTimeout(() => {
                setShowButton(true);
            }, 5000);
        } else {
            // 回到 /user 页面时，立即隐藏按钮
            setShowButton(false);
        }

        return () => {
            clearTimeout(timer); // 清除定时器，防止内存泄漏
        };
    }, [isUserPath]); // 依赖路径变化

    return (
        <div className="App">
            {/* 如果当前路径不是 /user 或其子路径，并且 5 秒后显示按钮 */}
            {!isUserPath && showButton && (
                <button onClick={handleButtonClick} className="floating-button">
                    退出登录
                </button>
            )}

            <Routes>
                <Route path="/" element={<Navigate to="/user" />} />
                <Route path='/user/register' element={<Register />} />
                <Route path="/book/books" element={<BookList />} />
                <Route path="/user" element={<Login handleLogin={handleLogin} />} />
                <Route path="/cart" element={<Carts />} />
                <Route path='/home' element={<Home />} />
                <Route path="/user/admin/*" element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
                    <Route path="" element={<Admin_user />} />
                </Route>
                {/* Add more routes here if needed */}
            </Routes>
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;
