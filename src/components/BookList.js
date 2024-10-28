import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // 引入 useLocation 钩子
import './BookList.css'; // Importing the CSS file
import apiClient from './ApiClient';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState("");
    const [bookNum, setBookNum] = useState(1);
    const [isReturnDateValid, setIsReturnDateValid] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [searchParams, setSearchParams] = useState({
        title: '',
        author: '',
        genre: ''
    });

    const [showAnimation, setShowAnimation] = useState(false); // 添加一个状态来控制动画显示
    const [hasAnimated, setHasAnimated] = useState(false); // 控制动画只播放一次

    const navigate = useNavigate();
    const location = useLocation(); // 获取当前的 location 对象

    useEffect(() => {
        // 检查如果是从 /user 页面跳转过来的，并且动画还没有显示过，才显示动画
        if (!hasAnimated && location.state && location.state.from === '/user') {
            setShowAnimation(true);
            setHasAnimated(true); // 标记动画已经显示过
            setTimeout(() => {
                setShowAnimation(false); // 动画持续 3 秒后隐藏
            }, 3000);
        }

        fetchBooks();
    }, [currentPage]); // 不再依赖 location.state，避免分页时触发动画

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:7070/book/books', {
                params: {
                    currentpage: currentPage,
                    pagesize: pageSize,
                },
                headers: {
                    Authorization: localStorage.getItem("token")
                },
                withCredentials: true,
            });
            setBooks(response.data.records);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Error fetching books:', error);
            navigate('/user');
        }
    };

    const searchBooks = async () => {
        try {
            const response = await apiClient.get("http://localhost:7070/book/books/search", {
                params: {
                    author: searchParams.author,
                    title: searchParams.title,
                    genre: searchParams.genre
                }
            });
    
            if (Array.isArray(response.data.data)) {
                setBooks(response.data.data);
                setTotalPages(1);
            } else {
                setBooks([]);
            }
    
        } catch (error) {
            console.error('Error fetching search results:', error);
            setBooks([]);
        }
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        await searchBooks();
    };

    const handleInputChange = (e) => {
        setSearchParams({
            ...searchParams,
            [e.target.name]: e.target.value
        });
    };

    const handleButtonClick = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetModalState();
    };

    const resetModalState = () => {
        setSelectedBook(null);
        setBorrowDate(new Date().toISOString().split('T')[0]);
        setReturnDate("");
        setBookNum(1);
        setIsReturnDateValid(true);
    };

    const handleReturnDateChange = (e) => {
        const selectedReturnDate = e.target.value;
        setReturnDate(selectedReturnDate);
        setIsReturnDateValid(new Date(selectedReturnDate) > new Date(borrowDate));
    };

    const handleSubmit = async () => {
        if (!selectedBook || !isReturnDateValid) return;

        const cartDto = {
            bookId: selectedBook.bookId,
            bookNum: bookNum,
            borrowDate: `${borrowDate}T00:00:00`,
            returnDate: `${returnDate}T00:00:00`
        };

        try {
            const response = await apiClient.post('http://localhost:7070/cart/add', cartDto);
            if(response.data.code===500){
                alert(response.data.msg);
            }else{
                alert("success")
                handleCloseModal();
            }

        } catch (error) {
            console.error('Error borrowing book:', error);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 5) return null;
    
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`pagination-button ${i === currentPage ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    const handleClickFW = () => {
        navigate('/cart');
    };

    return (
        <>
            {/* 访问动画，只从 /user 页面过来时才会显示 */}
            {showAnimation && (
                <div className="welcome-animation">
                    <h1>海内存知己，天涯若比邻</h1>
                </div>
            )}

            {/* 动画结束后显示内容 */}
            {!showAnimation && (
                <div className="book-list-container">
                    {/* 你的页面内容 */}
                    <h1>Book List</h1>
                    {/* 其余的代码 */}
                    {isVisible && (
                        <button onClick={handleClickFW} className="view-selected-button">
                            查看已选书本
                        </button>
                    )}

                    <div className="search-form">
                        <input
                            type="text"
                            name="title"
                            placeholder="Search by title"
                            value={searchParams.title}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="author"
                            placeholder="Search by author"
                            value={searchParams.author}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="genre"
                            placeholder="Search by genre"
                            value={searchParams.genre}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleSearch} className="search-button">Search</button>
                    </div>

                    <ul className="book-list">
                        {books.map((book) => (
                            <li key={book.id} className="book-item">
                                <div className="book-title"><strong>Title:</strong> {book.title}</div>
                                <div className="book-author"><strong>Author:</strong> {book.author}</div>
                                <div className="book-genre"><strong>Genre:</strong> {book.genre}</div>
                                <div className="book-isbn"><strong>ISBN:</strong> {book.isbn}</div>
                                <div className="book-publishDate"><strong>Published Date:</strong> {new Date(book.publishDate).toLocaleDateString()}</div>
                                <div className="book-stock"><strong>Stock:</strong> {book.stock}</div>

                                <button
                                    onClick={() => handleButtonClick(book)}
                                    className="borrow-button"
                                >
                                    借书
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="pagination-container">
                        {renderPagination()}
                    </div>

                    {showModal && selectedBook && (
                        <>
                            <div className="modal">
                                <h2>借阅书籍: {selectedBook.title}</h2>
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
                                    <label>到期日期:</label>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        onChange={handleReturnDateChange}
                                    />
                                    {!isReturnDateValid && <p className="error-message">归还日期必须晚于借阅日期</p>}
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    className="confirm-button"
                                    disabled={!isReturnDateValid}
                                >
                                    确认借书
                                </button>
                                <button onClick={handleCloseModal} className="cancel-button">取消</button>
                            </div>
                            <div className="modal-overlay" onClick={handleCloseModal}></div>
                        </>
                    )}

                    {isVisible && selectedBook && (
                        <div className="floating-window">
                            <div className="floating-content">
                                <h3>Selected Book:</h3>
                                <p><strong>Title:</strong> {selectedBook.title}</p>
                                <p><strong>Author:</strong> {selectedBook.author}</p>
                                <p><strong>Genre:</strong> {selectedBook.genre}</p>
                                <p><strong>ISBN:</strong> {selectedBook.isbn}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default BookList;
