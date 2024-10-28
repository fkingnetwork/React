import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css'; // 导入CSS文件
import ryuImage from './pic/ryu.jpg'; // 导入图片
import { useNavigate } from 'react-router-dom';
import apiClient from './ApiClient';

const OrderDetails = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueBooks, setOverdueBooks] = useState([]); // 用于存储逾期书籍
  const [todayDueBooks, setTodayDueBooks] = useState([]); // 用于存储今天到期的书籍
  const [showModal, setShowModal] = useState(false); // 控制模态窗口的显示
  const [monsy,setMoney] = useState(0.0);
  

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await apiClient.get('http://localhost:7070/trade/details'); // 调用后端 API 获取所有订单详情
        setOrderDetails(response.data.data); // 设置订单数据
        const response1 = await apiClient.get("http://localhost:7070/trade/totalExpiredFee");
    setMoney(response1.data.data);
      } catch (err) {
        setError(err.message);
        if(err.code==="ERR_NETWORK"){
          navigate("/user")
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  const calculateDays = (returnDate) => {
    const now = new Date();
    const returnDateObj = new Date(returnDate);
    const diffTime = returnDateObj - now; // 计算时间差（毫秒）
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 将毫秒转换为天数
    return diffDays;
  };

  // 按 orderId 进行分组
  const groupedOrders = orderDetails.reduce((acc, detail) => {
    const orderId = detail.orderId;
    if (!acc[orderId]) {
      acc[orderId] = [];
    }
    acc[orderId].push(detail);
    return acc;
  }, {});

  useEffect(() => {
    if (!loading && !error) {
      showAlerts(); // 在数据加载后显示警告
    }
  }, [loading, error]);

  const showAlerts = () => {
    let overdue = [];
    let todayDue = [];
    
    orderDetails.forEach(detail => {
      const daysRemaining = calculateDays(detail.returnDate);
      if (daysRemaining < 0) {
        overdue.push(detail.bookName); // 逾期书籍
      } else if (daysRemaining === 0) {
        todayDue.push(detail.bookName); // 今天到期书籍
      }
    });

    if (overdue.length > 0 || todayDue.length > 0) {
      setOverdueBooks(overdue);
      setTodayDueBooks(todayDue);
      setShowModal(true); // 打开模态窗口
    }
  };

  const closeModal = () => {
    setShowModal(false); // 关闭模态窗口
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  if (error) {
    return <p>获取订单详情时出错: {error}</p>;
  }



  return (
    <div className="order-details-container">
      <h1>我的订单</h1>
      <button onClick={()=>navigate("/book/books")}>返回书籍列表</button>
      <button onClick={()=>navigate("/cart")}>返回预定列表</button>
      {/* 模态窗口 */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>注意！</h2>
            {overdueBooks.length > 0 && (
              <div>
                <h3>逾期书籍:</h3>
                <ul>
                  {overdueBooks.map((book, index) => (
                    <li key={index}>{book}</li> // 列出所有逾期书籍
                  ))}
                </ul>
              </div>
            )}
            {monsy>0 &&(
              <div>
                <h3>
                  逾期金额:{monsy}
                </h3>
                
              </div>
            )}
              

            
            {todayDueBooks.length > 0 && (
              <div>
                <h3>今天到期的书籍:</h3>
                <ul>
                  {todayDueBooks.map((book, index) => (
                    <li key={index}>{book}</li> // 列出所有今天到期的书籍
                  ))}
                </ul>
              </div>
            )}
            <button onClick={closeModal}>关闭</button>
            {/* <img src={ryuImage} alt="鬼脸" className="ghost-image" /> */}
          </div>
        </div>
      )}

      {Object.keys(groupedOrders).map((orderId) => (
        <div key={orderId} className="order-group">
          <h2>订单 ID: {orderId}</h2>
          <table className="order-table">
            <thead>
              <tr>
                <th>图书名称</th>
                <th>借书日期</th>
                <th>归还日期</th>
                <th>剩余天数</th>
                <th>逾期费用</th>
                <th>图书数量</th>
              </tr>
            </thead>
            <tbody>
              {groupedOrders[orderId].map((detail) => {
                const daysRemaining = calculateDays(detail.returnDate);
                const colorClass = daysRemaining < 0 ? 'overdue' : daysRemaining === 0 ? 'due-today' : 'upcoming';
                return (
                  <tr key={detail.id} className={colorClass}>
                    <td>{detail.bookName}</td>
                    <td>{new Date(detail.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(detail.returnDate).toLocaleDateString()}</td>
                    <td>
                      {daysRemaining < 0
                        ? `逾期 ${Math.abs(daysRemaining)} 天`
                        : `还有 ${daysRemaining} 天`}
                    </td>
                    <td>{detail.expiredFee}</td>
                    <td>{detail.bookNum}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;
