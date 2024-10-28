import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css'; // 引入CSS文件
import Modal from './Model'; // 引入Modal组件
import Model_ExtendTime from './Model_ExtendTime.js'
import apiClient from './ApiClient.js';

function Admin() {
    const [currentView, setCurrentView] = useState('userManagement'); // 初始显示用户管理
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [books, setBooks] = useState([]); // 保存书籍列表
    const [expiredBooks, setExpiredBooks] = useState([]); // 保存过期书籍列表
    const [showExtendModal, setShowExtendModal] = useState(false); // 控制延长还书时间Modal
    const [bookToExtend, setBookToExtend] = useState(null); // 保存要延长时间的书籍信息
    const [showAddModal, setShowAddModal] = useState(false); // 控制添加书籍的Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false); // 控制更新书籍的Modal
    const [bookToUpdate, setBookToUpdate] = useState(null); // 保存要更新的书籍信息


  // 获取过期书籍列表
  const fetchExpiredBooks = async () => {
    setError(''); // 重置错误
    try {
      const response = await axios.get('http://localhost:7074/trade/AdminGETExpiredBooks');
      setExpiredBooks(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch expired books');
      setLoading(false);
    }
  };

  // 删除过期书籍记录
  const deleteExpiredBook = async (id) => {
    setError(''); // 重置错误
    try {
      const response = await axios.delete(`http://localhost:7074/trade/AdminDeleteBook?id=${id}`);
      if (response.data.code === 200) {
        setExpiredBooks(expiredBooks.filter(book => book.id !== id));
      } else {
        setError('Failed to delete expired book');
      }
    } catch (err) {
      setError('Error while deleting expired book');
    }
  };

  // 延长借书时间
  const extendBorrowTime = async (id, newTime) => {
    setError('');
    try {
      const response = await axios.put(`http://localhost:7074/trade/AdminExtendTime?id=${id}&time=${newTime}`);
      if (response.data.code === 200) {
        setExpiredBooks(expiredBooks.map(book => (book.id === id ? { ...book, returnDate: newTime } : book)));
      } else {
        setError('Failed to extend borrow time');
      }
    } catch (err) {
      setError('Error while extending borrow time');
    }
  };



  // 获取用户列表
  const fetchUsers = async () => {
    setError(''); // 重置错误
    try {
      const response = await axios.get('http://localhost:7071/user/adminUser');
      setUsers(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  // 删除用户
  const deleteUser = async (id) => {
    setError(''); // 重置错误
    try {
      const response = await axios.put(`http://localhost:7071/user/deleteUser?id=${id}`);
      if (response.data.code === 200) {
        setUsers(users.filter(user => user.id !== id));
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Error while deleting user');
    }
  };

  // 修改用户状态
  const changeStatus = async (id, status) => {
    setError(''); // 重置错误
    try {
      const response = await axios.put(`http://localhost:7071/user/changeStatus?id=${id}&status=${status}`);
      if (response.data.code === 200) {
        setUsers(users.map(user => (user.id === id ? { ...user, status: status } : user)));
      } else {
        setError('Failed to change status');
      }
    } catch (err) {
      setError('Error while changing status');
    }
  };

  // 获取书籍列表
  const fetchBooks = async () => {
    setError(''); // 重置错误
    try {
      const response = await axios.get('http://localhost:7072/book/listbooks');
      setBooks(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch books');
      setLoading(false);
    }
  };


  // 添加新书
  const addNewBook = async (newBook) => {
    setError('');
    try {
      const response = await axios.put('http://localhost:7072/book/addNewBook', newBook);
      if (response.data.code === 200) {
        setBooks([...books, { ...newBook, id: books.length + 1 }]);
      } else {
        setError('Failed to add new book');
      }
    } catch (err) {
      setError('Error while adding book');
    }
  };


  // 删除书籍
  const deleteBooks = async (ids) => {
    setError(''); // 重置错误
    try {
      const response = await axios.put(`http://localhost:7072/book/deleteBooks?ids=${ids.join(',')}`);
      if (response.data.code === 200) {
        setBooks(books.filter(book => !ids.includes(book.id)));
        renderBookManagement();
      } else {
        setError('Failed to delete books');
      }
    } catch (err) {
      setError('Error while deleting books');
    }
  };

  // 更新书籍
  const updateBook = async (updatedBook) => {
    setError('');
    try {
      const response = await axios.put('http://localhost:7072/book/updateAbook', updatedBook);
      if (response.data.code === 200) {
        setBooks(books.map((book) => (book.bookId === updatedBook.bookId ? updatedBook : book)));
      } else {
        setError('Failed to update book');
      }
    } catch (err) {
      setError('Error while updating book');
    }
  };

  // 初始加载数据
  useEffect(() => {
    setError(''); // 切换视图时重置错误
    setLoading(true);
    if (currentView === 'userManagement') {
      fetchUsers();
    } else if (currentView === 'bookManagement') {
      fetchBooks();
    } else if (currentView === 'expiredBooksManagement') {
      fetchExpiredBooks();
    }
  }, [currentView]);

  // 主菜单
  const renderMenu = () => (
    <div className="sidebar">
      <button onClick={() => setCurrentView('userManagement')}>用户管理</button>
      <button onClick={() => setCurrentView('bookManagement')}>书籍管理</button>
      <button onClick={() => setCurrentView('expiredBooksManagement')}>借阅书籍过期管理</button>
      <button onClick={() => setCurrentView('others')}>其他</button>
    </div>
  );

  // 用户管理页面
  const renderUserManagement = () => (
    <div className="content">
      <h2>用户管理</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => user.id !== 0)
              .map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.status}</td>
                  <td>
                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                    <button onClick={() => changeStatus(user.id, user.status === 1 ? -1 : 1)}>
                      {user.status === 1 ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // 书籍管理页面
  const renderBookManagement = () => (
    <div className="content">
      <h2>书籍管理</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <button onClick={() => setShowAddModal(true)}>添加书籍</button>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>书名</th>
                <th>作者</th>
                <th>类型</th>
                <th>出版日期</th>
                <th>ISBN</th>
                <th>库存</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.bookId}>
                  <td>{book.bookId}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre}</td>
                  <td>{new Date(book.publishDate).toLocaleDateString()}</td>
                  <td>{book.isbn}</td>
                  <td>{book.stock}</td>
                  <td>
                    <button onClick={() => deleteBooks([book.bookId])}>Delete</button>
                    <button
                      onClick={() => {
                        setBookToUpdate(book);
                        setShowUpdateModal(true);
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} onSubmit={addNewBook} />
      )}

      {showUpdateModal && (
        <Modal
          initialData={bookToUpdate}
          onClose={() => setShowUpdateModal(false)}
          onSubmit={updateBook}
        />
      )}
    </div>
  );

  // 过期书籍管理页面
  const renderExpiredBooksManagement = () => (
    <div className="content">
      <h2>借阅书籍过期管理</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户ID</th>
                <th>书名</th>
                <th>借书日期</th>
                <th>应还日期</th>
                <th>过期费</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
            {expiredBooks.map((orderDetail) => (
                <tr key={orderDetail.id}>
                    <td>{orderDetail.id}</td>
                    <td>{orderDetail.userId}</td>
                    <td>{orderDetail.bookName}</td> {/* Use bookName from OrderDetail */}
                    <td>{new Date(orderDetail.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(orderDetail.returnDate).toLocaleDateString()}</td>
                    <td>{orderDetail.expiredFee.toFixed(2)}</td> {/* Expired fee, formatted to two decimals */}
                    <td>
                    <button onClick={() => deleteExpiredBook(orderDetail.id)}>删除</button>
                    <button
                        onClick={() => {
                            setBookToExtend({
                                id: orderDetail.id,
                                time: new Date(orderDetail.returnDate).toLocaleDateString() // 确保字段名称正确
                              });
                        setShowExtendModal(true);
                        }}
                    >
                        延长时间
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showExtendModal && (
        <Model_ExtendTime
          initialData={bookToExtend}
          onClose={() => setShowExtendModal(false)}
          onSubmit={extendBorrowTime}
        />
      )}
    </div>
  );
  // 其他视图和渲染逻辑不变

  // 其他管理页面
  const renderOthers = () => (
    <div className="content">
      <h2>借阅书籍过期管理 (开发中)</h2>
    </div>
  );

  // 根据 currentView 显示不同的页面
  const renderCurrentView = () => {
    switch (currentView) {
      case 'userManagement':
        return renderUserManagement();
      case 'bookManagement':
        return renderBookManagement();
      case 'expiredBooksManagement':
        return renderExpiredBooksManagement();
      case 'others':
        return renderOthers();
      default:
        return renderMenu();
    }
  };

  return (
    <div className="admin-container">
      {renderMenu()}
      {renderCurrentView()}
    </div>
  );
}

export default Admin;
