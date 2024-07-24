const mongoose = require('mongoose');

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

module.exports = mongoose.model('Customer', CustomerSchema);