import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/customers', {
        headers: { 'x-auth-token': token }
      });
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers', error);
      if (error.response && error.response.status === 401) {
        navigate('/');
      }
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(customer =>
    (customer.이름?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.회사?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.소속?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.소속2?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.Mobile?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const exportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'customer_list';
    
    const ws = XLSX.utils.json_to_sheet(customers);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, fileName + fileExtension);
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return <div className="text-center mt-5">고객 정보를 불러오는 중...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">상우상사 고객관리프로그램</h1>
      <h2 className="mb-4 text-primary">고객 목록</h2>
      <div className="row mb-3">
        <div className="col">
          <button onClick={() => navigate('/add-customer')} className="btn btn-primary">
            <i className="fas fa-user-plus me-2"></i>신규 고객 추가
          </button>
        </div>
        <div className="col">
          <button onClick={exportToExcel} className="btn btn-success">
            <i className="fas fa-file-excel me-2"></i>엑셀로 내보내기
          </button>
        </div>
        <div className="col">
          <button onClick={() => navigate('/import-customers')} className="btn btn-info">
            <i className="fas fa-file-import me-2"></i>엑셀에서 가져오기
          </button>
        </div>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="고객 이름, 회사, 소속, 소속2, 또는 Mobile로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('일련번호')}>일련번호 {sortColumn === '일련번호' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('이름')}>이름 {sortColumn === '이름' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('직책')}>직책 {sortColumn === '직책' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('회사')}>회사 {sortColumn === '회사' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('소속')}>소속 {sortColumn === '소속' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('소속2')}>소속2 {sortColumn === '소속2' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
              <th onClick={() => handleSort('Mobile')}>Mobile {sortColumn === 'Mobile' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map((customer) => (
              <tr 
                key={customer.일련번호}
                onClick={() => handleCustomerClick(customer._id)}
                style={{ cursor: 'pointer' }}
              >
                <td>{customer.일련번호}</td>
                <td>{customer.이름}</td>
                <td>{customer.직책}</td>
                <td>{customer.회사}</td>
                <td>{customer.소속}</td>
                <td>{customer.소속2}</td>
                <td>{customer.Mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerList;