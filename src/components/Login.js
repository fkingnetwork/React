import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 引入自定义 CSS 文件
import apiClient from './ApiClient';

function Login({handleLogin}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState(''); // 新增验证码的状态
  const [captchaImageUrl, setCaptchaImageUrl] = useState('http://localhost:7071/captcha'); // 验证码图片的 URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 发送 POST 请求，将验证码作为 URL 查询参数
      const response = await axios.post(`http://localhost:7071/user/login?captcha=${captcha}`, {
        username: username,
        password: password,
      });

      // 检查后端返回的代码
      if (response.data.code === 200) {
        localStorage.setItem('token', response.data.data);
        navigate('/book/books',{state:{from:'/user'}});
        alert('Login successful!');
        console.log(response.data); // 在控制台显示登录结果

        // 登录成功后跳转到其他页面
        
      } else {
        console.error('Login failed:', response.data.msg);
        //如果是管理员
        if(response.data.code===666){
          // localStorage.setItem('token', response.data.data);
          handleLogin(true);  // 调用从 App.js 传递过来的函数，更新登录状态
          navigate("/user/admin");
        }else{
        alert('admin Login failed: ' + response.data.msg);
        // 刷新验证码
        refreshCaptcha();
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
      // 刷新验证码
      refreshCaptcha();
    }
  };

  const handleRegister = () => {
    navigate("/user/register");
  };

  // 刷新验证码图片
  const refreshCaptcha = () => {
    setCaptchaImageUrl('http://localhost:7071/captcha?' + new Date().getTime()); // 刷新时加时间戳
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Enter your password"
          />
        </div>
        {/* 验证码部分 */}
        <div className="form-group">
          <label>Captcha:</label>
          <input
            type="text"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            className="form-input"
            placeholder="Enter the captcha"
          />
        </div>
        <div className="form-group">
          <img
            src={captchaImageUrl}
            alt="Captcha"
            onClick={refreshCaptcha} // 点击验证码刷新
            className="captcha-image"
          />
          <span className="captcha-refresh-text">Click image to refresh</span>
        </div>
        <button type="submit" className="login-btn">Login</button>
        <button type="button" className="register-btn" onClick={handleRegister}>Register</button>
      </form>
      <div class='yune'>©2024 yune all rights reserved</div>
      
    </div>
  );
}

export default Login;
