import React, { useState, useEffect } from 'react';
import './Admin.css';

function Modal({ onClose, onSubmit, initialData = {} }) {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    genre: '',
    publishDate: '',
    isbn: '',
    stock: 0,
    ...initialData, // 将initialData作为初始数据
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(bookData); // 提交表单数据
    onClose(); // 关闭Modal
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{initialData ? '更新书籍' : '添加书籍'}</h2>
        <form onSubmit={handleSubmit}>
          <label>书名:</label>
          <input
            type="text"
            name="title"
            value={bookData.title}
            onChange={handleChange}
            required
          />

          <label>作者:</label>
          <input
            type="text"
            name="author"
            value={bookData.author}
            onChange={handleChange}
            required
          />

          <label>类型:</label>
          <input
            type="text"
            name="genre"
            value={bookData.genre}
            onChange={handleChange}
            required
          />

          <label>出版日期:</label>
          <input
            type="date"
            name="publishDate"
            value={bookData.publishDate}
            onChange={handleChange}
            required
          />

          <label>ISBN:</label>
          <input
            type="text"
            name="isbn"
            value={bookData.isbn}
            onChange={handleChange}
            required
          />

          <label>库存:</label>
          <input
            type="number"
            name="stock"
            value={bookData.stock}
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

export default Modal;
