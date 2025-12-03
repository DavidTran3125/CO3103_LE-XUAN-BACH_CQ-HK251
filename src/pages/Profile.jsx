import { useEffect, useState, useContext } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import userApi from "../api/userApi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaBell, FaComments } from "react-icons/fa";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const userId = user?.userID;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);

  useEffect(() => {
    if (!userId) return;

    userApi.getProfile(userId).then((res) => setProfile(res.data.data));
    userApi
      .getStrengths(userId)
      .then((res) => setStrengths(res.data.strengths));
    userApi
      .getWeaknesses(userId)
      .then((res) => setWeaknesses(res.data.weaknesses));
  }, [userId]);

  useEffect(() => {
    document.title = "Hồ sơ cá nhân | P2P Learning";
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="d-flex" style={{ backgroundColor: "#e8f1f2" }}>
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-3">Hồ sơ cá nhân</h2>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>

        <Card className="p-4 shadow">
          <div className="d-flex justify-content-between mb-1">
            <div>
              <strong>Mã số người dùng:</strong> {profile.userID}
            </div>
            <div>
              <strong>Tên người dùng:</strong> {profile.username}
            </div>
            <div>
              <strong>Ngày tạo:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>

          <hr />

          <div>
            <strong>Bio:</strong> {profile.about || "Chưa có mô tả."}
          </div>

          <hr />

          <div className="mb-2">
            <strong>Điểm mạnh:</strong>
          </div>
          {strengths.length === 0 && <p>Không có.</p>}
          <div className="d-flex flex-wrap">
            {strengths.map((s) => (
              <span
                key={s}
                className="bg-success text-white p-2 rounded-pill me-2"
                style={{ fontSize: "16px" }}
              >
                {s}
              </span>
            ))}
          </div>

          <hr />

          <div className="mb-2">
            <strong>Điểm yếu:</strong>
          </div>
          {weaknesses.length === 0 && <p>Không có.</p>}
          <div className="d-flex flex-wrap">
            {weaknesses.map((w) => (
              <span
                key={w}
                className="bg-danger text-white p-2 rounded-pill me-2 mb-2"
                style={{ fontSize: "16px" }}
              >
                {w}
              </span>
            ))}
          </div>
        </Card>

        <div className="text-end">
          <Button
            variant="dark"
            className="mt-4"
            onClick={() => navigate(`/users/${userId}/edit`)}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </Container>
    </div>
  );
}
