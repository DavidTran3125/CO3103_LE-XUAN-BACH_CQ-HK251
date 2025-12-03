const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const config = require('./config');
const cookieParser = require('cookie-parser');

const http = require('http');
const { Server } = require('socket.io');
const { setupSocket } = require('./socket');

const authMiddleware = require('./routes/auth'); // middleware

const { handleRegister } = require('./routes/register');
const { handleLogin } = require('./routes/login');
const { handleProfile } = require('./routes/profile');
const { handleLogout } = require('./routes/logout');
const { handleUpdateAbout } = require('./routes/updateabout');
const { handleUpdateStrengths } = require('./routes/updatestrength');
const { handleUpdateWeakness } = require('./routes/updateweakness');
const { handleGetStrengths } = require('./routes/getstrength');
const { handleGetWeaknesses } = require('./routes/getweakness');
const { handleGetUser } = require('./routes/getuser');
const { handleSearchUser } = require('./routes/searchuser');
const { handleViewProfile } = require('./routes/viewprofile');
const { handleRequestFriend } = require('./routes/requestfriend');
const { handleGetPendingRequests,handleGetAcceptedRequests, handleGetRejectedRequests } = require('./routes/getfrequest');
const { handleViewRequest } = require('./routes/viewrequest');
const { handleAcceptRequest } = require('./routes/afrequest');
const { handleRejectRequest } = require('./routes/rfrequest');
const { handleDeleteRequest } = require('./routes/deletefrequest');
const { handleCreateGroup } = require('./routes/creategroup');
const { handleGetMyGroups } = require('./routes/getmygroup');
const { handleGetAllFriends } = require('./routes/getallfriend');
const { handleGetMessageHistory } = require('./routes/his_message');
const { handleGetAllMember } = require('./routes/getallmember');
const { handleDeleteGroup } = require('./routes/deletegroup');
const { handleLeaveMember } = require('./routes/leavegroup');
const { handleRequestGroup } = require('./routes/requestgroup');
const { handleGetPendingGroupRequests, handleGetAcceptedGroupRequests, handleGetRejectedGroupRequests} = require('./routes/getgrequest');
const { handleUpdateGroupRequest } = require('./routes/updategrequest');
const { handleViewGroupRequest } = require('./routes/viewgrequest');
const { handleDeleteGroupRequest } = require('./routes/deletegrequest');
const { handleGetNotifications, handleDeleteNotification } = require('./routes/notification');
const { handleGetHome } = require('./routes/gethome');
const { handleKickMember } = require('./routes/kick');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
  }
});
setupSocket(io); // Kích hoạt socket

app.use(cors({
   origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

sql.connect(config);

// Register - Login - Logout
app.post('/api/register', handleRegister);
app.post('/api/login', handleLogin);
app.post('/api/logout', handleLogout);

// Home
app.get('/api/home', authMiddleware, handleGetHome); // lấy thông tin cần thiết để hiển thị home

// Profile
app.get('/api/profile', authMiddleware, handleProfile);
app.post('/api/updateabout', authMiddleware, handleUpdateAbout); // cập nhật about
app.get('/api/getstrengths', authMiddleware, handleGetStrengths); // lấy điểm mạnh
app.get('/api/getweaknesses', authMiddleware, handleGetWeaknesses); // lấy điểm yếu
app.post('/api/updatestrengths', authMiddleware, handleUpdateStrengths); // cập nhật điểm mạnh
app.post('/api/updateweakness', authMiddleware, handleUpdateWeakness); // cập nhật điểm yếu
app.post('/api/viewprofile', authMiddleware, handleViewProfile); // xem profile của người khác

// Search
app.post('/api/getuser', authMiddleware, handleGetUser); // lấy dữ liệu người dùng thông qua id
app.post('/api/searchuser', authMiddleware, handleSearchUser); // lấy dữ liệu người dùng thông qua điểm mạnh/yếu

// Friend
app.post('/api/requestfriend', authMiddleware, handleRequestFriend); // gửi yêu cầu kết bạn
app.get('/api/getpfrequest', authMiddleware, handleGetPendingRequests); //xem yêu cầu kết bạn đang chờ
app.get('/api/getafrequest', authMiddleware, handleGetAcceptedRequests); //xem yêu cầu kết bạn đã bị bạn từ chối
app.get('/api/getrfrequest', authMiddleware, handleGetRejectedRequests); //xem yêu cầu kết bạn đã được bạn chấp nhận
app.post('/api/viewrequest', authMiddleware, handleViewRequest); // lấy toàn thông tin tổng quan của yêu cầu kết bạn
app.post('/api/afrequest', authMiddleware, handleAcceptRequest); // đồng ý yêu cầu kết bạn
app.post('/api/rfrequest', authMiddleware, handleRejectRequest); // từ chối yêu cầu kết bạn
app.post('/api/deletefrequest', authMiddleware, handleDeleteRequest); // xóa request yêu cầu kết bạn
app.get('/api/getallfriend', authMiddleware, handleGetAllFriends); // lấy thông tin toàn bộ bạn bè

// Group
app.post('/api/creategroup', authMiddleware, handleCreateGroup); // tạo nhóm
app.get('/api/getmygroup', authMiddleware, handleGetMyGroups); // lấy thông tin nhóm của người dùng
app.post('/api/getallmember', authMiddleware, handleGetAllMember); // lấy toàn bộ thành viên của nhóm
app.post('/api/deletegroup', authMiddleware, handleDeleteGroup); // xóa nhóm
app.post('/api/leavemember', authMiddleware, handleLeaveMember);// rời nhóm
app.post('/api/requestgroup', authMiddleware, handleRequestGroup);// mời gia nhập nhóm
app.get('/api/getpgrequest', authMiddleware, handleGetPendingGroupRequests); // xem yêu cầu gia nhập nhóm đang chờ
app.get('/api/getagrequest', authMiddleware, handleGetAcceptedGroupRequests); // xem yêu cầu gia nhập nhóm đã bị bạn từ chối
app.get('/api/getrgrequest', authMiddleware, handleGetRejectedGroupRequests); // xem yêu cầu gia nhập nhóm đã được bạn chấp nhận
app.post('/api/updategrequest', authMiddleware, handleUpdateGroupRequest); // đồng ý/ từ chối yêu cầu gia nhập nhóm
app.post('/api/viewgrequest', authMiddleware, handleViewGroupRequest); //  lấy toàn thông tin tổng quan của yêu cầu gia nhập nhóm
app.post('/api/deletegrequest', authMiddleware, handleDeleteGroupRequest); // xóa request yêu cầu gia nhập nhóm
app.post('/api/kick', authMiddleware, handleKickMember); // mời ra khỏi nhóm

// Message
app.post('/api/getmessages', authMiddleware, handleGetMessageHistory); // lấy lịch sử tin nhắn

// Notification
app.get('/api/notifications', authMiddleware, handleGetNotifications); // lấy toàn bộ thông báo
app.post('/api/deletenotification', authMiddleware, handleDeleteNotification); // xóa một thông báo


server.listen(3000, () => console.log(' Server + Socket chạy tại http://localhost:3000'));

