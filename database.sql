CREATE DATABASE Project;
USE Project;

CREATE TABLE User_Profile (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(15) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (CHAR_LENGTH(Username) >= 6)
);

CREATE TABLE LearningGroup (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Profile_Strength (
    User_ID INT NOT NULL ,
    Strength VARCHAR(100) NOT NULL,

    PRIMARY KEY (User_ID, Strength),

    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Profile_Weakness (
    User_ID INT NOT NULL,
    Weakness VARCHAR(100) NOT NULL,
    
    PRIMARY KEY (User_ID, Weakness),
    
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Membership (
    User_ID INT NOT NULL,
    Group_ID INT NOT NULL,
    Role ENUM('member', 'group_leader') DEFAULT 'member',

    PRIMARY KEY (User_ID, Group_ID),
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Group_ID) REFERENCES LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Message (
    Message_ID INT AUTO_INCREMENT PRIMARY KEY,
    Group_ID INT NOT NULL,
    User_ID INT NOT NULL,
    Content TEXT NOT NULL,
    Create_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (Group_ID) REFERENCES LearningGroup(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User_Profile(User_ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);