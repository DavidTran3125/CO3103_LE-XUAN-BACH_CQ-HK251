CREATE DATABASE Project;
GO
USE Project;
GO

CREATE TABLE User_Profile (
    User_ID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(15) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    Bio NVARCHAR(500) NULL,
    Created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_Username_Length CHECK (LEN(Username) >= 6),
    CONSTRAINT CHK_Bio_Length CHECK (LEN(Bio) <= 500)
);
GO

CREATE TABLE LearningGroup (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Profile_Strength (
    User_ID INT NOT NULL,
    Strength VARCHAR(100) NOT NULL,
    PRIMARY KEY (User_ID, Strength),
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
GO

CREATE TABLE Profile_Weakness (
    User_ID INT NOT NULL,
    Weakness VARCHAR(100) NOT NULL,
    PRIMARY KEY (User_ID, Weakness),
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
GO

CREATE TABLE Membership (
    User_ID INT NOT NULL,
    Group_ID INT NOT NULL,
    Role VARCHAR(20) DEFAULT 'member' 
        CONSTRAINT CHK_Role CHECK (Role IN ('member','group_leader')),
    PRIMARY KEY (User_ID, Group_ID),
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Group_ID) REFERENCES LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
GO

CREATE TABLE Message (
    Message_ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Content TEXT NOT NULL,
    Created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (Group_ID) REFERENCES LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
GO


-- Thêm User_Profile
INSERT INTO User_Profile (Username, Password_hash)
VALUES 
('alice123', 'hash_alice'),
('bob456', 'hash_bob'),
('charlie789', 'hash_charlie');
GO

-- Thêm LearningGroup
INSERT INTO LearningGroup (Created_at)
VALUES
(GETDATE()),
(GETDATE());
GO

-- Thêm Profile_Strength
INSERT INTO Profile_Strength (User_ID, Strength)
VALUES
(1, 'Math'),
(1, 'Physics'),
(2, 'English'),
(3, 'Programming'),
(3, 'Logic');
GO

-- Thêm Profile_Weakness
INSERT INTO Profile_Weakness (User_ID, Weakness)
VALUES
(1, 'Chemistry'),
(2, 'Math'),
(2, 'Physics'),
(3, 'English');
GO

-- Thêm Membership
INSERT INTO Membership (User_ID, Group_ID, Role)
VALUES
(1, 1, 'group_leader'),
(2, 1, 'member'),
(3, 1, 'member'),
(2, 2, 'group_leader'),
(3, 2, 'member');
GO

-- Thêm Message
INSERT INTO Message (Group_ID, User_ID, Content)
VALUES
(1, 1, 'Welcome to group 1!'),
(1, 2, 'Thanks, happy to join.'),
(1, 3, 'Hello everyone!'),
(2, 2, 'Group 2 discussion started.'),
(2, 3, 'Good day for study.');
GO
