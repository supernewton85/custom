import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/ko';

moment.locale('ko');
const localizer = momentLocalizer(moment);

const WorkLog = () => {
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day').toDate());
  const [workLog, setWorkLog] = useState('');
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const fetchWorkLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/worklog', {
        headers: { 'x-auth-token': token }
      });
      const worklogEvents = response.data.map(log => ({
        start: moment(log.date).startOf('day').toDate(),
        end: moment(log.date).endOf('day').toDate(),
        title: '업무일지',
        allDay: true,
        resource: log,
        hasContent: true
      }));
      console.log('Fetched work logs:', worklogEvents);
      setEvents(worklogEvents);
    } catch (error) {
      console.error('Error fetching work logs', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkLogs();
    fetchHolidays();
  }, [fetchWorkLogs]);

  useEffect(() => {
    fetchWorkLog(selectedDate);
  }, [selectedDate]);

  const fetchWorkLog = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(`http://localhost:5000/api/worklog/${formattedDate}`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Fetched work log for date:', formattedDate, response.data);
      setWorkLog(response.data.log || '');
    } catch (error) {
      console.error('Error fetching work log', error);
      setWorkLog('');
    }
  };

  const saveWorkLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      await axios.post('http://localhost:5000/api/worklog', {
        date: formattedDate,
        log: workLog
      }, {
        headers: { 'x-auth-token': token }
      });
      alert('업무일지가 저장되었습니다.');
      fetchWorkLogs();
    } catch (error) {
      console.error('Error saving work log', error);
      alert('업무일지 저장에 실패했습니다.');
    }
  };

  const updateWorkLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      await axios.put(`http://localhost:5000/api/worklog/${formattedDate}`, {
        log: workLog
      }, {
        headers: { 'x-auth-token': token }
      });
      alert('업무일지가 수정되었습니다.');
      fetchWorkLogs();
    } catch (error) {
      console.error('Error updating work log', error);
      alert('업무일지 수정에 실패했습니다.');
    }
  };

  const deleteWorkLog = async () => {
    if (window.confirm('정말로 이 업무일지를 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
        await axios.delete(`http://localhost:5000/api/worklog/${formattedDate}`, {
          headers: { 'x-auth-token': token }
        });
        alert('업무일지가 삭제되었습니다.');
        setWorkLog('');
        fetchWorkLogs();
      } catch (error) {
        console.error('Error deleting work log', error);
        alert('업무일지 삭제에 실패했습니다.');
      }
    }
  };

  const fetchHolidays = async () => {
    const currentYear = new Date().getFullYear();
    try {
      const response = await axios.get(`http://localhost:5000/api/holidays/${currentYear}`);
      const holidayEvents = response.data.map(holiday => ({
        start: moment(holiday.date, 'YYYYMMDD').startOf('day').toDate(),
        end: moment(holiday.date, 'YYYYMMDD').endOf('day').toDate(),
        title: holiday.name,
        allDay: true,
        isHoliday: true
      }));
      console.log('Fetched holidays:', holidayEvents);
      setHolidays(holidayEvents);
    } catch (error) {
      console.error('Error fetching holidays', error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
    if (!event.isHoliday) {
      setWorkLog(event.resource?.log || '');
    }
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(moment(slotInfo.start).startOf('day').toDate());
    fetchWorkLog(slotInfo.start);
  };

  const eventStyleGetter = (event) => {
    console.log('Event style:', event);
    if (event.isHoliday) {
      return {
        style: {
          backgroundColor: 'red',
          color: 'white'
        }
      };
    }
    if (event.hasContent) {
      return {
        style: {
          backgroundColor: 'yellow',
          color: 'black'
        }
      };
    }
    return {};
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">업무일지</h2>
      <div className="row">
        <div className="col-md-8">
          <h3>{moment(selectedDate).format('YYYY년 MM월 DD일')}</h3>
          <textarea
            className="form-control mb-3"
            rows="10"
            value={workLog}
            onChange={(e) => setWorkLog(e.target.value)}
          />
          <button className="btn btn-primary me-2" onClick={saveWorkLog}>저장</button>
          <button className="btn btn-warning me-2" onClick={updateWorkLog}>수정</button>
          <button className="btn btn-danger" onClick={deleteWorkLog}>삭제</button>
        </div>
        <div className="col-md-4">
          <Calendar
            localizer={localizer}
            events={[...events, ...holidays]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            defaultView="month"
            views={['month']}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkLog;