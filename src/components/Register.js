import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate 钩子
import './Register.css'; // 引入自定义 CSS 文件

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:7071/user/register', {
            username: username,
            password: password,
        });

        // 检查后端返回的代码
        if (response.data.code === 200) {
            alert('Register successful!');
            console.log(response.data); // 在控制台显示登录结果
            navigate('/user'); // 跳转到 /book/books
        } else {
            console.error('Register failed:', response.data.msg);
            alert('Register failed: ' + response.data.msg);
        }
    } catch (error) {
        console.error('Register failed:', error);
        alert('Register failed. Please check your credentials.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form onSubmit={handleSubmit} className="register-form">
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
        <button type="submit" className="register-btn">Register</button>
      </form>
    </div>
  );
}

export default Register;
