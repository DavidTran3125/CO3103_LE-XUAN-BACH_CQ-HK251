/* =========================
   Project DB - Final (SQL Server)
   - Keep your original core tables
   - Add invites, join requests, match requests, tags, availability, sessions, notifications
   - Avoid multiple cascade paths (SQL Server)
========================= */

IF DB_ID('Project') IS NULL
    CREATE DATABASE Project;
GO
USE Project;
GO

/*
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'appuser')
BEGIN
    EXEC('CREATE LOGIN appuser WITH PASSWORD = ''AppUser@123'';');
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'appuser')
BEGIN
    CREATE USER appuser FOR LOGIN appuser;
    ALTER ROLE db_owner ADD MEMBER appuser;
END
GO
*/
------------------------------------------------------------
-- RESET (drop tables in safe order)
------------------------------------------------------------
IF OBJECT_ID('dbo.Notification','U') IS NOT NULL DROP TABLE dbo.Notification;
IF OBJECT_ID('dbo.Session_Attendee','U') IS NOT NULL DROP TABLE dbo.Session_Attendee;
IF OBJECT_ID('dbo.Study_Session','U') IS NOT NULL DROP TABLE dbo.Study_Session;

IF OBJECT_ID('dbo.Group_Invite','U') IS NOT NULL DROP TABLE dbo.Group_Invite;
IF OBJECT_ID('dbo.Group_Join_Request','U') IS NOT NULL DROP TABLE dbo.Group_Join_Request;
IF OBJECT_ID('dbo.Match_Request','U') IS NOT NULL DROP TABLE dbo.Match_Request;

IF OBJECT_ID('dbo.Message','U') IS NOT NULL DROP TABLE dbo.Message;
IF OBJECT_ID('dbo.Membership','U') IS NOT NULL DROP TABLE dbo.Membership;

IF OBJECT_ID('dbo.Group_Tag','U') IS NOT NULL DROP TABLE dbo.Group_Tag;
IF OBJECT_ID('dbo.Tag','U') IS NOT NULL DROP TABLE dbo.Tag;

IF OBJECT_ID('dbo.User_Availability','U') IS NOT NULL DROP TABLE dbo.User_Availability;

IF OBJECT_ID('dbo.Profile_Weakness','U') IS NOT NULL DROP TABLE dbo.Profile_Weakness;
IF OBJECT_ID('dbo.Profile_Strength','U') IS NOT NULL DROP TABLE dbo.Profile_Strength;

IF OBJECT_ID('dbo.LearningGroup','U') IS NOT NULL DROP TABLE dbo.LearningGroup;
IF OBJECT_ID('dbo.User_Profile','U') IS NOT NULL DROP TABLE dbo.User_Profile;
GO

------------------------------------------------------------
-- CORE TABLES (your original, minimal changes)
------------------------------------------------------------
CREATE TABLE dbo.User_Profile (
    User_ID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(15) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    Bio NVARCHAR(500) NULL,
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CHK_Username_Length CHECK (LEN(Username) >= 6),
    CONSTRAINT CHK_Bio_Length CHECK (Bio IS NULL OR LEN(Bio) <= 500)
);
GO

CREATE TABLE dbo.LearningGroup (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_Name NVARCHAR(100) NOT NULL DEFAULT N'Group',
    Description NVARCHAR(500) NULL,
    Max_Members INT NOT NULL DEFAULT 6,
    Created_by INT NULL, -- do NOT cascade delete from user to group (avoid multi-path)
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CHK_MaxMembers CHECK (Max_Members BETWEEN 2 AND 50),
    CONSTRAINT FK_Group_CreatedBy FOREIGN KEY (Created_by)
        REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Profile_Strength (
    User_ID INT NOT NULL,
    Strength VARCHAR(100) NOT NULL,
    PRIMARY KEY (User_ID, Strength),
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Profile_Weakness (
    User_ID INT NOT NULL,
    Weakness VARCHAR(100) NOT NULL,
    PRIMARY KEY (User_ID, Weakness),
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Membership (
    User_ID INT NOT NULL,
    Group_ID INT NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'member'
        CONSTRAINT CHK_Role CHECK (Role IN ('member','group_leader')),
    Joined_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    PRIMARY KEY (User_ID, Group_ID),
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Message (
    Message_ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

------------------------------------------------------------
-- TAGS (for group topics/subjects)
------------------------------------------------------------
CREATE TABLE dbo.Tag (
    Tag_ID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE dbo.Group_Tag (
    Group_ID INT NOT NULL,
    Tag_ID INT NOT NULL,
    PRIMARY KEY (Group_ID, Tag_ID),
    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (Tag_ID) REFERENCES dbo.Tag(Tag_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

------------------------------------------------------------
-- JOIN REQUESTS & INVITES
------------------------------------------------------------
CREATE TABLE dbo.Group_Join_Request (
    JoinReq_ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Message NVARCHAR(300) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CONSTRAINT CHK_Join_Status CHECK (Status IN ('pending','approved','rejected','cancelled')),
    Reviewed_by INT NULL,
    Reviewed_at DATETIME2(0) NULL,
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (Reviewed_by) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Group_Invite (
    Invite_ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_ID INT NOT NULL,
    From_User_ID INT NOT NULL,
    To_User_ID INT NOT NULL,
    Message NVARCHAR(300) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CONSTRAINT CHK_Invite_Status CHECK (Status IN ('pending','accepted','declined','cancelled')),
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    Responded_at DATETIME2(0) NULL,

    CONSTRAINT CHK_Invite_Not_Self CHECK (From_User_ID <> To_User_ID),

    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    -- 2 FK to User_Profile => NO ACTION to avoid cascade path issues
    FOREIGN KEY (From_User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    FOREIGN KEY (To_User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE UNIQUE INDEX UX_GroupInvite_Pending
ON dbo.Group_Invite(Group_ID, From_User_ID, To_User_ID)
WHERE Status = 'pending';
GO

------------------------------------------------------------
-- MATCH REQUESTS (1-1 matching)
------------------------------------------------------------
CREATE TABLE dbo.Match_Request (
    Request_ID INT IDENTITY(1,1) PRIMARY KEY,
    From_User_ID INT NOT NULL,
    To_User_ID INT NOT NULL,
    Message NVARCHAR(300) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CONSTRAINT CHK_Match_Status CHECK (Status IN ('pending','accepted','declined','cancelled')),
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT CHK_Match_Not_Self CHECK (From_User_ID <> To_User_ID),

    FOREIGN KEY (From_User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    FOREIGN KEY (To_User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE UNIQUE INDEX UX_Match_Pending
ON dbo.Match_Request(From_User_ID, To_User_ID)
WHERE Status = 'pending';
GO

------------------------------------------------------------
-- USER AVAILABILITY (time slots for matching)
------------------------------------------------------------
CREATE TABLE dbo.User_Availability (
    Availability_ID INT IDENTITY(1,1) PRIMARY KEY,
    User_ID INT NOT NULL,
    DayOfWeek TINYINT NOT NULL, -- 0=Sun ... 6=Sat
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    Note NVARCHAR(200) NULL,
    CONSTRAINT CHK_DayOfWeek CHECK (DayOfWeek BETWEEN 0 AND 6),
    CONSTRAINT CHK_TimeRange CHECK (StartTime < EndTime),
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

------------------------------------------------------------
-- STUDY SESSIONS (group meetings)
------------------------------------------------------------
CREATE TABLE dbo.Study_Session (
    Session_ID INT IDENTITY(1,1) PRIMARY KEY,
    Group_ID INT NOT NULL,
    Title NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    Start_at DATETIME2(0) NOT NULL,
    End_at DATETIME2(0) NOT NULL,
    Location NVARCHAR(200) NULL,
    Meeting_Link NVARCHAR(300) NULL,
    Created_by INT NULL,
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CHK_SessionTime CHECK (Start_at < End_at),

    FOREIGN KEY (Group_ID) REFERENCES dbo.LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    FOREIGN KEY (Created_by) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);
GO

CREATE TABLE dbo.Session_Attendee (
    Session_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'going'
        CONSTRAINT CHK_Attendee_Status CHECK (Status IN ('going','maybe','declined')),
    PRIMARY KEY (Session_ID, User_ID),
    FOREIGN KEY (Session_ID) REFERENCES dbo.Study_Session(Session_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

------------------------------------------------------------
-- NOTIFICATIONS
------------------------------------------------------------
CREATE TABLE dbo.Notification (
    Notification_ID INT IDENTITY(1,1) PRIMARY KEY,
    User_ID INT NOT NULL, -- receiver
    Type VARCHAR(30) NOT NULL, -- e.g. MATCH, INVITE, JOIN_REQUEST, SESSION
    Title NVARCHAR(100) NOT NULL,
    Body NVARCHAR(500) NULL,
    RefType VARCHAR(30) NULL, -- e.g. 'Match_Request','Group_Invite'
    RefID INT NULL,
    Is_Read BIT NOT NULL DEFAULT 0,
    Created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (User_ID) REFERENCES dbo.User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
GO

------------------------------------------------------------
-- Indexes for performance
------------------------------------------------------------
CREATE INDEX IX_Membership_Group ON dbo.Membership(Group_ID);
CREATE INDEX IX_Membership_User  ON dbo.Membership(User_ID);

CREATE INDEX IX_Message_GroupTime ON dbo.Message(Group_ID, Created_at);

CREATE INDEX IX_JoinReq_GroupStatus ON dbo.Group_Join_Request(Group_ID, Status);
CREATE INDEX IX_Invite_ToUserStatus ON dbo.Group_Invite(To_User_ID, Status);
CREATE INDEX IX_Match_ToUserStatus  ON dbo.Match_Request(To_User_ID, Status);
GO

------------------------------------------------------------
-- SEED (minimal data)
------------------------------------------------------------
INSERT INTO dbo.User_Profile (Username, Password_hash, Bio)
VALUES
('alice123', 'hash_alice', N'Mạnh Toán, thích học nhóm'),
('bob456', 'hash_bob', N'Thích tiếng Anh'),
('charlie789', 'hash_charlie', N'Programming enjoyer');
GO

INSERT INTO dbo.LearningGroup (Group_Name, Description, Max_Members, Created_by)
VALUES
(N'Group 1', N'Group học Toán/Lý', 6, 1),
(N'Group 2', N'Group học tiếng Anh', 6, 2);
GO

INSERT INTO dbo.Profile_Strength (User_ID, Strength)
VALUES (1,'Math'),(1,'Physics'),(2,'English'),(3,'Programming'),(3,'Logic');
GO

INSERT INTO dbo.Profile_Weakness (User_ID, Weakness)
VALUES (1,'Chemistry'),(2,'Math'),(2,'Physics'),(3,'English');
GO

INSERT INTO dbo.Membership (User_ID, Group_ID, Role)
VALUES (1,1,'group_leader'),(2,1,'member'),(3,1,'member'),
       (2,2,'group_leader'),(3,2,'member');
GO

INSERT INTO dbo.Message (Group_ID, User_ID, Content)
VALUES
(1,1,N'Welcome to group 1!'),
(1,2,N'Thanks, happy to join.'),
(1,3,N'Hello everyone!'),
(2,2,N'Group 2 discussion started.'),
(2,3,N'Good day for study.');
GO

INSERT INTO dbo.Tag (Name) VALUES (N'Math'),(N'Physics'),(N'English'),(N'Programming');
GO
INSERT INTO dbo.Group_Tag (Group_ID, Tag_ID)
SELECT 1, Tag_ID FROM dbo.Tag WHERE Name IN (N'Math',N'Physics');
INSERT INTO dbo.Group_Tag (Group_ID, Tag_ID)
SELECT 2, Tag_ID FROM dbo.Tag WHERE Name IN (N'English');
GO
