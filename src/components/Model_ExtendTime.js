import React, { useState } from 'react';
import './Admin.css';

function Model_ExtendTime({ onClose, onSubmit, initialData = {} }) {
  const [bookData, setBookData] = useState({
    id: 0,
    time: '',

    ...initialData, // 将initialData作为初始数据
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedTime = new Date(bookData.time).toISOString().split('T')[0]; // 格式化时间
    onSubmit(bookData.id, formattedTime); // 提交分解后的 id 和格式化后的时间
    onClose(); // 关闭Modal
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>修改过期时间</h2>
        <form onSubmit={handleSubmit}>
          <label>id:</label>
          <input
            type="number"
            name="id"
            value={bookData.id}
            onChange={handleChange}
            required
          />
          <label>日期:</label>
          <input
            type="date"
            name="time"
            value={bookData.time}
            onChange={handleChange}
            required
          />
          <button type="submit">提交</button>
          <button type="button" onClick={onClose}>
            取消
          </button>
        </form>
      </div>
    </div>
  );
}

export default Model_ExtendTime;
