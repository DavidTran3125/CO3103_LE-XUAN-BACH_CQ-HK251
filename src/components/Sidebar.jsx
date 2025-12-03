import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaSearch,
} from "react-icons/fa";
import "./Sidebar.scss";
import logo from "../assets/p2p_white.png";
import avatar from "../assets/avatar.jpg";

export default function Sidebar() {
  const { logout, user } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [showText, setShowText] = useState(true);

  const handleToggle = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);

    if (!newCollapsedState) {
      setTimeout(() => {
        setShowText(true);
      }, 120);
    } else {
      setShowText(false);
    }
  };

  return (
    <div
      className={`sidebar ${
        collapsed ? "collapsed" : ""
      } d-flex flex-column vh-100`}
    >
      <div className="sidebar-header">
        <img src={logo} alt="logo" style={{ width: "60px", height: "auto" }} />
        <FaBars className="toggle-icon" onClick={handleToggle} />
      </div>

      <div className="sidebar-user p-2 mt-5">
        <img src={avatar} alt="avatar" className="avatar" />
        {!collapsed && showText && (
          <span className="hello">Xin chào, {user?.username}</span>
        )}
      </div>

      <Nav className="flex-column mt-3 flex-grow-1">
        <Nav.Item>
          <Link to="/" className="sidebar-link">
            <FaHome className="menu-icon" />{" "}
            {!collapsed && showText && "Trang chủ"}
          </Link>
        </Nav.Item>

        <hr className="my-1" />

        <Nav.Item>
          <Link to={`/users/${user.userID}`} className="sidebar-link">
            <FaUser className="menu-icon" />{" "}
            {!collapsed && showText && "Hồ sơ cá nhân"}
          </Link>
        </Nav.Item>

        <hr className="my-1" />

        <Nav.Item>
          <Link to="/matching" className="sidebar-link">
            <FaSearch className="menu-icon" />{" "}
            {!collapsed && showText && "Tìm kiếm"}
          </Link>
        </Nav.Item>

        <hr className="my-1" />

        <Nav.Item>
          <Link to="/groups" className="sidebar-link">
            <FaUsers className="menu-icon" /> {!collapsed && showText && "Nhóm"}
          </Link>
        </Nav.Item>

        <Nav.Item className="mt-auto">
          <hr className="my-1" />
          <div
            className="sidebar-link logout"
            onClick={logout}
            style={{ cursor: "pointer" }}
          >
            <FaSignOutAlt className="menu-icon" />{" "}
            {!collapsed && showText && "Đăng xuất"}
          </div>
        </Nav.Item>
      </Nav>
    </div>
  );
}
