import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function ImportCustomers() {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('replace'); // 'replace' or 'add'
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImportTypeChange = (e) => {
    setImportType(e.target.value);
  };

  const handleImport = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        // 날짜 필드 처리
        jsonData = jsonData.map(customer => ({
          ...customer,
          업그레이드일시: customer.업그레이드일시 || '',
          만난날짜: customer.만난날짜 || ''
        }));

        console.log('Parsed Data:', jsonData);

        const token = localStorage.getItem('token');
        let response;

        const apiUrl = `http://localhost:5000/api/customers/${importType}`;
        console.log('API URL:', apiUrl);

        response = await axios.post(apiUrl, jsonData, {
          headers: { 'x-auth-token': token }
        });

        console.log('Server response:', response.data);
        
        alert(`${importType === 'replace' ? '데이터 교체' : '데이터 추가'} 완료: ${response.data.count}개의 레코드가 처리되었습니다.`);
        navigate('/customers');
      } catch (error) {
        console.error('Error importing customers', error);
        let errorMessage = '고객 데이터 임포트에 실패했습니다.';
        if (error.response) {
          errorMessage += ' 서버 응답: ' + (error.response.data.message || error.response.data.error || error.message);
          console.log('Error response:', error.response);
        } else if (error.request) {
          errorMessage += ' 서버에서 응답이 없습니다.';
          console.log('Error request:', error.request);
        } else {
          errorMessage += ' 오류 메시지: ' + error.message;
        }
        alert(errorMessage);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2 className="mb-4">고객 데이터 임포트</h2>
      <div className="mb-3">
        <label className="form-label">임포트 타입:</label>
        <select className="form-select" value={importType} onChange={handleImportTypeChange}>
          <option value="replace">전체 교체</option>
          <option value="add">데이터 추가</option>
        </select>
      </div>
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept=".xlsx, .xls, .csv" 
        className="form-control mb-3" 
      />
      <button onClick={handleImport} className="btn btn-primary">임포트</button>
    </div>
  );
}

export default ImportCustomers;