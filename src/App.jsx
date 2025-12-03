import "./App.scss";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import { Container } from "react-bootstrap";
import { FaBell, FaComments } from "react-icons/fa";
import banner from "./assets/hcmut.jpg";

export default function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = "P2P Learning";
  }, []);

  return (
    <div className="d-flex main">
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-3">Dashboard</h2>
            <h4 className="text-secondary">
              Chào mừng trở lại, {user?.username}
            </h4>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>

        <img src={banner} alt="banner" className="banner" />

        <div className="mt-4">
          <h4>Giới thiệu</h4>
          <p style={{ fontSize: "18px" }}>
            Ứng dụng quản lý <strong>Peer-to-Peer Learning</strong> được xây
            dựng với mục tiêu hỗ trợ sinh viên tìm kiếm và kết nối với bạn học
            một cách hiệu quả. Thông qua cơ chế matching đối ứng (môn học giỏi -
            môn học cần cải thiện), sinh viên có thể nhanh chóng tìm được bạn
            học phù hợp, từ đó tạo thành nhóm học tập. Hệ thống còn cung cấp
            công cụ giao tiếp trực tuyến (chatbox) để các thành viên trong nhóm
            trao đổi kiến thức, thảo luận bài tập và hỗ trợ lẫn nhau.
          </p>
        </div>
      </Container>
    </div>
  );
}
