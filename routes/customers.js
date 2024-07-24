const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// 모든 고객 조회
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 고객 추가
router.post('/', async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 고객 상세 조회
router.get('/:id', getCustomer, (req, res) => {
  res.json(res.customer);
});

// 고객 정보 업데이트
router.patch('/:id', getCustomer, async (req, res) => {
  Object.assign(res.customer, req.body);
  try {
    const updatedCustomer = await res.customer.save();
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 고객 삭제
router.delete('/:id', getCustomer, async (req, res) => {
  try {
    await res.customer.remove();
    res.json({ message: '고객이 삭제되었습니다' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ 일련번호: req.params.id });
    if (customer == null) {
      return res.status(404).json({ message: '고객을 찾을 수 없습니다' });
    }
    res.customer = customer;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = router;