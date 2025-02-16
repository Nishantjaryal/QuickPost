const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { accessChat, fetchChat, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require('../controllers/chatControles');

const Router = express.Router();

Router.route('/').post(protect,accessChat);
Router.route('/').get(protect,fetchChat);
Router.route('/group').post(protect,createGroupChat );
Router.route('/rename').put(protect,renameGroup);
Router.route('/groupremove').put(protect,removeFromGroup);
Router.route('/groupadd').put(protect,addToGroup);


module.exports = Router