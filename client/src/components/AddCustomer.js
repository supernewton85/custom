import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCustomer() {
  const [customer, setCustomer] = useState({
    이름: '',
    직책: '',
    회사: '',
    소속: '',
    소속2: '',
    분류: '',
    보조: '',
    Tel: '',
    Mobile: '',
    'E-Mail': '',
    Fax: '',
    직장주소: '',
    납품기계보유현황: '',
    업그레이드일시: '',
    인물메모: '',
    교제기록: '',
    만난날짜: '',
    자료수신여부: false,
    문서발송: '',
    연구전문분류: '',
    고객분류번호: '',
    고객등급: '',
    분야: '',
    집주소: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCustomer({ ...customer, [e.target.name]: value });
    if (e.target.name === '이름') {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.이름.trim()) {
      setError('이름은 필수 입력 항목입니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customers', customer, {
        headers: { 'x-auth-token': token }
      });
      alert('새로운 고객이 추가되었습니다.');
      navigate('/customers');
    } catch (error) {
      console.error('Error adding customer', error);
      alert('고객 추가에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2 className="mb-4">신규 고객 추가</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(customer).map((key) => (
          <div className="mb-3" key={key}>
            <label htmlFor={key} className="form-label">{key}:{key === '이름' && '*'}</label>
            {key === '자료수신여부' ? (
              <input
                type="checkbox"
                className="form-check-input"
                id={key}
                name={key}
                checked={customer[key]}
                onChange={handleChange}
              />
            ) : key === '인물메모' || key === '교제기록' ? (
              <textarea
                className="form-control"
                id={key}
                name={key}
                value={customer[key]}
                onChange={handleChange}
              />
            ) : (
              <input
                type={key === '업그레이드일시' || key === '만난날짜' ? 'date' : 'text'}
                className="form-control"
                id={key}
                name={key}
                value={customer[key]}
                onChange={handleChange}
                required={key === '이름'}
              />
            )}
          </div>
        ))}
        {error && <p className="text-danger">{error}</p>}
        <button type="submit" className="btn btn-primary">고객 추가</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/customers')}>취소</button>
      </form>
    </div>
  );
}

export default AddCustomer;