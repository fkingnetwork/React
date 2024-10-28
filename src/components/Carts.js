import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import "./ApiClient";
import apiClient from './ApiClient';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [list, setList] = useState([]);  // 删除列表
    const [selectBook, setSelectBook] = useState([]);  // 选择列表

    // 弹窗相关状态
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowDate, setBorrowDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [bookNum, setBookNum] = useState(1);
    const [isReturnDateValid, setIsReturnDateValid] = useState(true);
    const [isAllSelected, setIsAllSelected] = useState(false);  // 全选状态

    // 刷新页面
    const refreshPage = () => {
        window.location.reload();
    };

    // 获取购物车数据
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await apiClient.get('http://localhost:7070/cart');
                setCartItems(response.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                navigate('/user');
            }
        };

        fetchCartItems();
    }, [navigate]);

    useEffect(() => {
        console.log('Updated List:', list);
    }, [list]);

    useEffect(() => {
        console.log('Selected books:', selectBook);
    }, [selectBook]);

    // 如果正在加载，显示加载提示
    if (loading) {
        return <p>加载中...</p>;
    }

    // 如果有错误，显示错误信息
    if (error) {
        return <p>获取数据时出错: {error.message}</p>;
    }

    // 向后端发送删除请求
    const deleteByIds = async (updateList) => {
        try {
            const response = await apiClient.delete('http://localhost:7070/cart', {
                params: { ids: updateList },
                paramsSerializer: (params) => {
                    return qs.stringify(params, { arrayFormat: 'comma' });
                }
            });

            console.log('Delete successful', response.data);
            alert('删除成功');
            setList([]);  // 清空删除列表
            refreshPage();
        } catch (error) {
            console.error('Delete failed', error.response ? error.response.data : error.message);
        }
    };

    // 单项删除
    const handleDelete = (bookId) => {
        setList((prevList) => {
            const updateList = [...prevList, bookId];
            deleteByIds(updateList);
            return updateList;
        });
    };

    // 显示修改弹窗
    const handleButtonClick = (book) => {
        setSelectedBook(book);
        setBorrowDate(book.borrowDate);
        setReturnDate(book.returnDate);
        setBookNum(book.bookNum);
        setShowModal(true);
    };

    // 关闭弹窗
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBook(null);
        setBorrowDate('');
        setReturnDate('');
        setBookNum(1);
        setIsReturnDateValid(true);
    };

    // 验证归还日期是否合法
    const handleReturnDateChange = (e) => {
        const selectedReturnDate = e.target.value;
        setReturnDate(selectedReturnDate);

        if (new Date(selectedReturnDate) > new Date(borrowDate)) {
            setIsReturnDateValid(true);
        } else {
            setIsReturnDateValid(false);
        }
    };

    // 提交修改请求
    const handleSubmit = async () => {
        if (!selectedBook || !isReturnDateValid) return;

        const updatedBook = {
            bookId: selectedBook.bookId,
            bookNum: bookNum,
            borrowDate: `${borrowDate}T00:00:00`,
            returnDate: `${returnDate}T00:00:00`,
        };

        try {
            const response = await apiClient.put('http://localhost:7070/cart', updatedBook);
            console.log('Update successful:', response.data);
            if(response.data.code===200){
                handleCloseModal();
                alert("success to update")
                refreshPage();
            }else{
                alert("check the the number of inventory of the book you select");
            }

        } catch (error) {
            console.error('Error updating book:', error);
        }
    };

    // 批量选择书籍逻辑
    const handleChange = (bookId) => {
        setSelectBook((prevSelected) => {
            if (prevSelected.includes(bookId)) {
                return prevSelected.filter((id) => id !== bookId);
            } else {
                return [...prevSelected, bookId];
            }
        });
    };

    // 全选逻辑
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectBook([]);
        } else {
            const allBookIds = cartItems.map((item) => item.bookId);
            setSelectBook(allBookIds);
        }
        setIsAllSelected(!isAllSelected);
    };

    //结算
    const handleOrder=async()=>{
        try{
            const response = await apiClient.post("http://localhost:7070/trade",selectBook);
            console.log(response.data)
            if(response.data.code===200){
                alert("已提交");
                setList([]);  // 清空删除列表
                refreshPage();
            }else{
                alert(response.data.msg)
            }
        }catch(error){
            console.error("Error when submit:",error)
        }
    }

    const handleBacktoBooks = ()=>{
        navigate("/book/books")
    }
    const handletoMyPage= ()=>{
        navigate("/home")
    }

    return (
        <div className="container">

            <h1>我的预订</h1>
            <button onClick={handleBacktoBooks}>返回书籍列表</button>            
            <button onClick={handletoMyPage}>查看已借阅借阅书籍</button>
            {cartItems.length === 0 ? (
                <p>预购为空</p>
            ) : (
                <div>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>书本名称</th>
                                <th>数量</th>
                                <th>借阅时间</th>
                                <th>归还时间</th>
                                <th>操作</th>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                    全选
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.bookName}</td>
                                    <td>{item.bookNum}</td>
                                    <td>{item.borrowDate}</td>
                                    <td>{item.returnDate}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => handleButtonClick(item)}>
                                            修改
                                        </button>
                                        <button className="action-btn" onClick={() => handleDelete(item.bookId)}>
                                            删除
                                        </button>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectBook.includes(item.bookId)}
                                            onChange={() => handleChange(item.bookId)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-actions">
                        <button onClick={() => deleteByIds(selectBook)}>批量删除</button>
                        <button onClick={handleOrder}>提交</button>
                    </div>
                </div>
            )}

            {showModal && selectedBook && (
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>修改书籍: {selectedBook.bookId}</h2>
                    <div>
                        <label>借阅数量:</label>
                        <input
                            type="number"
                            value={bookNum}
                            min={1}
                            onChange={(e) => setBookNum(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>借阅日期:</label>
                        <input
                            type="date"
                            value={borrowDate}
                            onChange={(e) => setBorrowDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>归还日期:</label>
                        <input
                            type="date"
                            value={returnDate}
                            onChange={handleReturnDateChange}
                        />
                        {!isReturnDateValid && (
                            <p style={{ color: 'red' }}>归还日期必须晚于借阅日期</p>
                        )}
                    </div>
                    <button className="action-btn" onClick={handleSubmit} disabled={!isReturnDateValid}>
                        确认修改
                    </button>
                    <button className="action-btn cancel-btn" onClick={handleCloseModal}>
                        取消
                    </button>
                </div>
            )}

        </div>
    );
};

export default CartPage;
