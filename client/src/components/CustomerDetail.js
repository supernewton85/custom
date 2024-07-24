import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function CustomerDetail() {
  const [customer, setCustomer] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/customers/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer', error);
        if (error.response && error.response.status === 401) {
          navigate('/');
        }
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/customers/${id}`, customer, {
        headers: { 'x-auth-token': token }
      });
      alert('고객 정보가 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating customer', error);
      alert('고객 정보 업데이트에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/customers/${id}`, {
          headers: { 'x-auth-token': token }
        });
        alert('고객이 삭제되었습니다.');
        navigate('/customers');
      } catch (error) {
        console.error('Error deleting customer', error);
        alert('고객 삭제에 실패했습니다.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">고객 상세 정보</h2>
      <form onSubmit={handleUpdate}>
        {[
          '일련번호', '이름', '직책', '회사', '소속', '소속2', '분류', '보조', 'Tel', 'Mobile',
          'E-Mail', 'Fax', '직장주소', '납품기계보유현황', '업그레이드일시', '인물메모', '교제기록',
          '만난날짜', '자료수신여부', '문서발송', '연구전문분류', '고객분류번호', '고객등급', '분야', '집주소'
        ].map(field => (
          <div className="mb-3" key={field}>
            <label htmlFor={field} className="form-label">{field}</label>
            <input
              type="text"
              className="form-control"
              id={field}
              name={field}
              value={customer[field] || ''}
              onChange={handleInputChange}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary me-2">업데이트</button>
        <button type="button" className="btn btn-danger" onClick={handleDelete}>삭제</button>
      </form>
    </div>
  );
}

export default CustomerDetail;