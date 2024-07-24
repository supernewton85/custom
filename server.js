const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');

dotenv.config();

mongoose.set('strictQuery', false);

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch((err) => console.log('MongoDB Atlas connection error:', err));

// 고객 스키마 정의
const CustomerSchema = new mongoose.Schema({
  일련번호: { type: Number },
  이름: { type: String, required: true },
  직책: String,
  회사: String,
  소속: String,
  소속2: String,
  분류: String,
  보조: String,
  Tel: String,
  Mobile: String,
  'E-Mail': String,
  Fax: String,
  직장주소: String,
  납품기계보유현황: String,
  업그레이드일시: String,
  인물메모: { type: String, maxlength: 100000 },
  교제기록: { type: String, maxlength: 100000 },
  만난날짜: String,
  자료수신여부: String,
  문서발송: String,
  연구전문분류: String,
  고객분류번호: String,
  고객등급: String,
  분야: String,
  집주소: String
});

// 일련번호 자동 증가를 위한 함수
CustomerSchema.pre('save', async function(next) {
  if (!this.일련번호) {
    try {
      const lastCustomer = await this.constructor.findOne({}, {}, { sort: { '일련번호': -1 } });
      this.일련번호 = lastCustomer && lastCustomer.일련번호 ? lastCustomer.일련번호 + 1 : 1;
    } catch (error) {
      console.error('Error in 일련번호 generation:', error);
    }
  }
  next();
});

const Customer = mongoose.model('Customer', CustomerSchema);

// 사용자 스키마 정의
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// 업무일지 스키마 정의
const WorkLogSchema = new mongoose.Schema({
  date: { type: String, required: true },
  log: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const WorkLog = mongoose.model('WorkLog', WorkLogSchema);

// 인증 미들웨어
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: '인증 토큰이 없습니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 로그인 라우트
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);

  try {
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// 고객 추가 라우트
app.post('/api/customers', auth, async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 고객 목록 조회 라우트
app.get('/api/customers', auth, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 고객 상세 정보 조회 라우트
app.get('/api/customers/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: '고객을 찾을 수 없습니다.' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 고객 정보 수정 라우트
app.patch('/api/customers/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ message: '고객을 찾을 수 없습니다.' });
    }
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 고객 삭제 라우트
app.delete('/api/customers/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: '고객을 찾을 수 없습니다.' });
    }
    res.json({ message: '고객이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 고객 데이터 전체 교체 라우트
app.post('/api/customers/replace', auth, async (req, res) => {
  try {
    const customers = req.body;
    console.log('Received customers data for replacement:', customers.length);

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: '유효한 고객 데이터가 제공되지 않았습니다.' });
    }

    // 기존 데이터 모두 삭제
    await Customer.deleteMany({});
    console.log('Existing customers deleted');

    // 새 데이터 삽입
    let insertedCount = 0;
    let errorCount = 0;
    const totalCount = customers.length;

    for (let i = 0; i < customers.length; i++) {
      const { 일련번호, ...customerData } = customers[i];
      
      if (!customerData.이름 || customerData.이름.trim() === '') {
        console.log(`Customer at index ${i} skipped: No name provided`);
        errorCount++;
        continue;
      }

      try {
        await Customer.create(customerData);
        insertedCount++;

        if (insertedCount % 10 === 0 || insertedCount === totalCount) {
          console.log(`Progress: ${insertedCount}/${totalCount}`);
        }
      } catch (error) {
        console.error(`Error inserting customer at index ${i}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Insertion complete. ${insertedCount} customers inserted, ${errorCount} errors.`);
    res.status(201).json({ 
      message: '고객 데이터 교체 완료', 
      inserted: insertedCount, 
      errors: errorCount, 
      total: totalCount 
    });
  } catch (err) {
    console.error('Error in customer data replacement:', err);
    res.status(500).json({ message: '고객 데이터 교체 중 오류가 발생했습니다.', error: err.message });
  }
});

// 고객 데이터 추가 라우트
app.post('/api/customers/add', auth, async (req, res) => {
  try {
    const customers = req.body;
    console.log('Received customers data for addition:', customers.length);

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: '유효한 고객 데이터가 제공되지 않았습니다.' });
    }

    let insertedCount = 0;
    let errorCount = 0;
    const totalCount = customers.length;

    for (let i = 0; i < customers.length; i++) {
      const { 일련번호, ...customerData } = customers[i];
      
      if (!customerData.이름 || customerData.이름.trim() === '') {
        console.log(`Customer at index ${i} skipped: No name provided`);
        errorCount++;
        continue;
      }

      try {
        await Customer.create(customerData);
        insertedCount++;

        if (insertedCount % 10 === 0 || insertedCount === totalCount) {
          console.log(`Progress: ${insertedCount}/${totalCount}`);
        }
      } catch (error) {
        console.error(`Error inserting customer at index ${i}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Insertion complete. ${insertedCount} customers inserted, ${errorCount} errors.`);
    res.status(201).json({ 
      message: '고객 데이터 추가 완료', 
      inserted: insertedCount, 
      errors: errorCount, 
      total: totalCount 
    });
  } catch (err) {
    console.error('Error in adding customer data:', err);
    res.status(500).json({ message: '고객 데이터 추가 중 오류가 발생했습니다.', error: err.message });
  }
});

// 모든 업무일지 조회 라우트
app.get('/api/worklog', auth, async (req, res) => {
  try {
    const workLogs = await WorkLog.find({ user: req.user });
    res.json(workLogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 특정 날짜의 업무일지 조회 라우트
app.get('/api/worklog/:date', auth, async (req, res) => {
  try {
    const workLog = await WorkLog.findOne({ date: req.params.date, user: req.user });
    res.json(workLog || { log: '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 업무일지 저장 라우트
app.post('/api/worklog', auth, async (req, res) => {
  try {
    let workLog = await WorkLog.findOne({ date: req.body.date, user: req.user });
    if (workLog) {
      workLog.log = req.body.log;
      await workLog.save();
    } else {
      workLog = new WorkLog({
        date: req.body.date,
        log: req.body.log,
        user: req.user
      });
      await workLog.save();
    }
    res.json(workLog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 업무일지 수정 라우트
app.put('/api/worklog/:date', auth, async (req, res) => {
  try {
    let workLog = await WorkLog.findOne({ date: req.params.date, user: req.user });
    if (workLog) {
      workLog.log = req.body.log;
      await workLog.save();
      res.json(workLog);
    } else {
      res.status(404).json({ message: '해당 날짜의 업무일지를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 업무일지 삭제 라우트
app.delete('/api/worklog/:date', auth, async (req, res) => {
  try {
    const result = await WorkLog.findOneAndDelete({ date: req.params.date, user: req.user });
    if (result) {
      res.json({ message: '업무일지가 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '해당 날짜의 업무일지를 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 공휴일 정보 조회 라우트
app.get('/api/holidays/:year', async (req, res) => {
  const year = req.params.year;
  const apiKey = 'uHo9JOFg37Gh8i%2B45xSHA6ROGLTffYauJPqL%2FrABDLvJ9JmC4wFTkl5uLLfOjSqhhuM2pPX8to2%2BhxxlvKP15A%3D%3D'; // Encoding된 인증키
  const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${apiKey}&solYear=${year}&numOfRows=100&_type=json`;

  try {
    const response = await axios.get(url);
    const items = response.data.response.body.items.item;
    const holidays = Array.isArray(items) ? items : [items]; // 단일 항목인 경우 배열로 
    const formattedHolidays = holidays.map(item => ({
      date: `${item.locdate}`,
      name: item.dateName
    }));
    
    res.json(formattedHolidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
});

// 정적 파일 제공 (React 앱)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/public')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));