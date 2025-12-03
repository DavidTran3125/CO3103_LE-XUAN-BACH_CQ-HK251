CREATE DATABASE DACNPM;
GO
USE DACNPM;
GO
-- ========================
-- 1. USERS TABLE
-- ========================
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name NVARCHAR(30) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    Dob DATE NOT NULL,
    about NVARCHAR(MAX) DEFAULT NULL,
    created_at DATE DEFAULT GETDATE()
);
GO

-- ========================
-- 2. GROUP TABLE
-- ========================
CREATE TABLE Groups (
    group_id INT IDENTITY(1,1) PRIMARY KEY,
    groupname NVARCHAR(30) NOT NULL UNIQUE,
    groupcode VARCHAR(30) NOT NULL,
    created_at DATE DEFAULT GETDATE()
);
GO

-- ========================
-- 3. MEMBER TABLE
-- ========================
CREATE TABLE Member (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'leader')),
    join_at DATE DEFAULT GETDATE(),
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT FK_Member_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Member_Group FOREIGN KEY (group_id) REFERENCES Groups(group_id)
);
GO

-- ========================
-- 4. MESSAGE TABLE
-- ========================
CREATE TABLE Message (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NULL,
    group_id INT NULL,
    content NVARCHAR(500),
    sent_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Message_Sender FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Message_Receiver FOREIGN KEY (receiver_id) REFERENCES Users(user_id),   
    CONSTRAINT FK_Message_Group FOREIGN KEY (group_id) REFERENCES Groups(group_id)
);

-- ========================
-- 5. REQUEST TABLE
-- ========================
CREATE TABLE Request (
    request_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NULL,
    content NVARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'rejected', 'accepted')), 
    sent_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Request_Sender FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Request_Receiver FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
);

-- ========================
-- 6. PERMISSION TABLE
-- ========================
CREATE TABLE Permission (
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    can_invite BIT DEFAULT 1,
    can_send BIT DEFAULT 1,
    can_edit_permissions BIT DEFAULT 0,
    can_remove_member BIT DEFAULT 0,
    PRIMARY KEY (group_id, user_id),
    CONSTRAINT FK_Permission_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),   
    CONSTRAINT FK_Permission_Group FOREIGN KEY (group_id) REFERENCES Groups(group_id)   
);

-- ========================
-- 7. NOTIFICATION TABLE
-- ========================
CREATE TABLE Notification (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_Notification_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)    
);

-- ========================
-- 8. STRENGTH TABLE
-- ========================
CREATE TABLE StrengthTypes (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE StrengthOptions (
    option_id INT IDENTITY(1,1) PRIMARY KEY,
    type_id INT NOT NULL,
    option_name NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_StrengthOptions_Types FOREIGN KEY (type_id) REFERENCES StrengthTypes(type_id)
);

CREATE TABLE UserStrengths (
    user_id INT NOT NULL,
    option_id INT NOT NULL,
    PRIMARY KEY (user_id, option_id),
    CONSTRAINT FK_UserStrengths_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_UserStrengths_Options FOREIGN KEY (option_id) REFERENCES StrengthOptions(option_id)
);

-- ========================
-- 9. WEAKNESS TABLE
-- ========================
CREATE TABLE WeaknessTypes (
    type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE WeaknessOptions (
    option_id INT IDENTITY(1,1) PRIMARY KEY,
    type_id INT NOT NULL,
    option_name NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_WeaknessOptions_Types FOREIGN KEY (type_id) REFERENCES WeaknessTypes(type_id)
);

CREATE TABLE UserWeaknesses (
    user_id INT NOT NULL,
    option_id INT NOT NULL,
    PRIMARY KEY (user_id, option_id),
    CONSTRAINT FK_UserWeaknesses_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_UserWeaknesses_Options FOREIGN KEY (option_id) REFERENCES WeaknessOptions(option_id)
);

-- ========================
-- 10. FRIEND TABLE
-- ========================
CREATE TABLE Friend (
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    PRIMARY KEY (user1_id, user2_id),
    CONSTRAINT FK_User1_Users FOREIGN KEY (user1_id) REFERENCES Users(user_id),
    CONSTRAINT FK_User2_Users FOREIGN KEY (user2_id) REFERENCES Users(user_id)
);

-- ========================
-- 11. GROUPREQUEST TABLE
-- ========================
CREATE TABLE Grequest (
    request_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NULL,
    group_id INT NOT NULL,
    content NVARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'rejected', 'accepted')), 
    sent_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_GRequest_Sender FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    CONSTRAINT FK_GRequest_Receiver FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    CONSTRAINT FK_GRequest_Group FOREIGN KEY (group_id) REFERENCES Groups(group_id)
);

-- Chèn dữ liệu

-- Thêm loại Strength
INSERT INTO StrengthTypes (type_name) VALUES ('general'), ('skill'), ('subject');

-- Thêm các lựa chọn Strength
INSERT INTO StrengthOptions (type_id, option_name) VALUES
(1, N'Chăm chỉ'),
(1, N'Kiên nhẫn'),
(1, N'Có trách nhiệm'),
(1, N'Tự tin'),
(2, N'Giao tiếp tốt'),
(2, N'Tư duy sáng tạo'),
(2, N'Làm việc nhóm'),
(2, N'Giải quyết vấn đề'),
(3, N'Toán'),
(3, N'Vật lý'),
(3, N'Hóa học'),
(3, N'Ngữ văn'),
(3, N'Tiếng Anh');
GO

-- Thêm loại Weakness
INSERT INTO WeaknessTypes (type_name) VALUES ('general'), ('skill'), ('subject');

-- Thêm các lựa chọn Weakness
INSERT INTO WeaknessOptions (type_id, option_name) VALUES
(1, N'Hay trì hoãn'),
(1, N'Thiếu kiên nhẫn'),
(1, N'Thiếu tự tin'),
(1, N'Dễ mất tập trung'),
(2, N'Ngại giao tiếp'),
(2, N'Khó làm việc nhóm'),
(2, N'Thiếu sáng tạo'),
(2, N'Khó giải quyết vấn đề'),
(3, N'Toán'),
(3, N'Vật lý'),
(3, N'Hóa học'),
(3, N'Ngữ văn'),
(3, N'Tiếng Anh');
GO

-- Thêm 15 người dùng mẫu
INSERT INTO Users (username, password_hash, first_name, last_name, email, Dob, about)
VALUES
('khoa123', 'hash1', N'Khoa', N'Đỗ Bách', 'khoa2@gmail.com', '2003-12-05', N'Sinh viên CNTT, thích học Toán'),
('thao456', 'hash2', N'Thảo', N'Trần Thị', 'thao@gmail.com', '2002-11-12', N'Giao tiếp tốt, thích học Văn'),
('minh789', 'hash3', N'Minh', N'Nguyễn Văn', 'minh@gmail.com', '2001-05-20', N'Chăm chỉ, kiên nhẫn'),
('lan111', 'hash4', N'Lan', N'Phạm Thị', 'lan@gmail.com', '2004-07-15', N'Tư duy sáng tạo, yêu thích Hóa'),
('tuan222', 'hash5', N'Tuấn', N'Lê Văn', 'tuan@gmail.com', '2000-09-09', N'Tự tin, thích Vật lý'),
('huy333', 'hash6', N'Huy', N'Nguyễn Hoàng', 'huy@gmail.com', '2003-01-01', N'Có trách nhiệm, thích Tiếng Anh'),
('nga444', 'hash7', N'Nga', N'Hoàng Thị', 'nga@gmail.com', '2002-03-03', N'Làm việc nhóm tốt'),
('phuc555', 'hash8', N'Phúc', N'Đặng Văn', 'phuc@gmail.com', '2001-06-06', N'Giải quyết vấn đề tốt'),
('anh666', 'hash9', N'Anh', N'Nguyễn Thị', 'anh@gmail.com', '2004-08-08', N'Ngại giao tiếp, thích Văn'),
('bao777', 'hash10', N'Bảo', N'Phan Văn', 'bao@gmail.com', '2003-10-10', N'Thiếu kiên nhẫn, thích Toán'),
('quynh888', 'hash11', N'Quỳnh', N'Đỗ Thị', 'quynh@gmail.com', '2002-12-12', N'Thiếu tự tin, thích Tiếng Anh'),
('son999', 'hash12', N'Sơn', N'Nguyễn Văn', 'son@gmail.com', '2001-02-02', N'Dễ mất tập trung'),
('mai101', 'hash13', N'Mai', N'Phạm Thị', 'mai@gmail.com', '2000-04-04', N'Thiếu sáng tạo'),
('long202', 'hash14', N'Long', N'Lê Văn', 'long@gmail.com', '2003-05-05', N'Khó làm việc nhóm'),
('thanh303', 'hash15', N'Thanh', N'Nguyễn Văn', 'thanh@gmail.com', '2002-07-07', N'Khó giải quyết vấn đề');
GO

-- Strengths
INSERT INTO UserStrengths (user_id, option_id) VALUES
(1, 1), (1, 9),   -- Khoa: Chăm chỉ, Toán
(2, 5), (2, 12),  -- Thảo: Giao tiếp tốt, Ngữ văn
(3, 2), (3, 3),   -- Minh: Kiên nhẫn, Có trách nhiệm
(4, 6), (4, 11),  -- Lan: Tư duy sáng tạo, Hóa học
(5, 4), (5, 10),  -- Tuấn: Tự tin, Vật lý
(6, 3), (6, 13),  -- Huy: Có trách nhiệm, Tiếng Anh
(7, 7),           -- Nga: Làm việc nhóm
(8, 8),           -- Phúc: Giải quyết vấn đề
(9, 12),          -- Anh: Ngữ văn
(10, 9),          -- Bảo: Toán
(11, 13),         -- Quỳnh: Tiếng Anh
(12, 1),          -- Sơn: Chăm chỉ
(13, 5),          -- Mai: Giao tiếp tốt
(14, 10),         -- Long: Vật lý
(15, 11);         -- Thanh: Hóa học
GO

-- Weaknesses
INSERT INTO UserWeaknesses (user_id, option_id) VALUES
(1, 1),   -- Khoa: Hay trì hoãn
(2, 2),   -- Thảo: Thiếu kiên nhẫn
(3, 3),   -- Minh: Thiếu tự tin
(4, 4),   -- Lan: Dễ mất tập trung
(5, 5),   -- Tuấn: Ngại giao tiếp
(6, 6),   -- Huy: Khó làm việc nhóm
(7, 7),   -- Nga: Thiếu sáng tạo
(8, 8),   -- Phúc: Khó giải quyết vấn đề
(9, 5),   -- Anh: Ngại giao tiếp
(10, 9),  -- Bảo: Toán yếu
(11, 13), -- Quỳnh: Tiếng Anh yếu
(12, 10), -- Sơn: Vật lý yếu
(13, 11), -- Mai: Hóa học yếu
(14, 12), -- Long: Ngữ văn yếu
(15, 2);  -- Thanh: Thiếu kiên nhẫn
GO

INSERT INTO StrengthOptions (type_id, option_name) VALUES
-- type_id = 1 (phẩm chất cá nhân)
(1, N'Tham vọng'),
(1, N'Tỉ mỉ'),
(1, N'Đáng tin cậy'),
(1, N'Chủ động'),
(1, N'Kiên định'),

-- type_id = 2 (kỹ năng mềm)
(2, N'Khả năng lãnh đạo'),
(2, N'Tư duy phản biện'),
(2, N'Quản lý thời gian'),
(2, N'Khả năng thuyết trình'),
(2, N'Đàm phán hiệu quả'),

-- type_id = 3 (học thuật/kỹ năng chuyên môn)
(3, N'Tin học văn phòng'),
(3, N'Lập trình'),
(3, N'Thiết kế đồ họa'),
(3, N'Phân tích dữ liệu'),
(3, N'Nghiên cứu khoa học');
GO

-- Thêm Weakness mới (5 cho mỗi type_id)
INSERT INTO WeaknessOptions (type_id, option_name) VALUES
-- type_id = 1 (phẩm chất cá nhân)
(1, N'Dễ nản lòng'),
(1, N'Quá cầu toàn'),
(1, N'Khó kiểm soát cảm xúc'),
(1, N'Thiếu quyết đoán'),
(1, N'Ngại thử thách'),

-- type_id = 2 (kỹ năng mềm)
(2, N'Khó quản lý thời gian'),
(2, N'Thiếu kỹ năng lãnh đạo'),
(2, N'Ngại thuyết trình'),
(2, N'Khả năng đàm phán kém'),
(2, N'Thiếu tư duy phản biện'),

-- type_id = 3 (học thuật/kỹ năng chuyên môn)
(3, N'Thiếu kỹ năng tin học'),
(3, N'Khó lập trình'),
(3, N'Khả năng thiết kế yếu'),
(3, N'Khó phân tích dữ liệu'),
(3, N'Thiếu kỹ năng nghiên cứu');
GO


