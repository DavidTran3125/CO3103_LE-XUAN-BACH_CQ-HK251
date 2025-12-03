import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import userApi from "../api/userApi";
import Sidebar from "../components/Sidebar";
import { FaBell, FaComments } from "react-icons/fa";

export default function EditProfile() {
  const { user } = useContext(AuthContext);
  const userId = user?.userID;
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);

  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await userApi.getProfile(userId);
        const strengthsRes = await userApi.getStrengths(userId);
        const weaknessesRes = await userApi.getWeaknesses(userId);

        setBio(profileRes.data.data.about);
        setOriginalBio(profileRes.data.data.about);

        setStrengths(strengthsRes.data.strengths || []);
        setWeaknesses(weaknessesRes.data.weaknesses || []);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const handleAddStrength = async () => {
    if (!newStrength.trim()) return;
    await userApi.addStrength(userId, newStrength.trim());
    setStrengths([...strengths, newStrength.trim()]);
    setNewStrength("");
  };

  const handleAddWeakness = async () => {
    if (!newWeakness.trim()) return;
    await userApi.addWeakness(userId, newWeakness.trim());
    setWeaknesses([...weaknesses, newWeakness.trim()]);
    setNewWeakness("");
  };

  const deleteStrength = async (s) => {
    await userApi.deleteStrength(userId, s);
    setStrengths(strengths.filter((x) => x !== s));
  };

  const deleteWeakness = async (w) => {
    await userApi.deleteWeakness(userId, w);
    setWeaknesses(weaknesses.filter((x) => x !== w));
  };

  const handleSave = async () => {
    await userApi.updateProfile(userId, { about: bio });
    alert("Cập nhật thành công!");
    navigate(`/users/${userId}`);
  };

  const handleReset = () => {
    setBio(originalBio);
    navigate(`/users/${userId}`);
  };

  useEffect(() => {
    document.title = "Chỉnh sửa hồ sơ | P2P Learning";
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="d-flex" style={{ backgroundColor: "#e8f1f2" }}>
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-3">Chỉnh sửa hồ sơ</h2>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>
        <Card className="p-4 shadow">
          <div>
            <h5>Bio</h5>
            <textarea
              className="form-control"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <h5>Điểm mạnh</h5>

            <div className="d-flex flex-wrap">
              {strengths.map((s, i) => (
                <div>
                  <Button
                    key={i}
                    variant="secondary"
                    className="text-white p-2 rounded-pill me-2"
                    onClick={() => deleteStrength(s)}
                  >
                    {s} ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-2 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="Nhập điểm mạnh"
              />
              <button className="btn btn-dark" onClick={handleAddStrength}>
                Thêm
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h5>Điểm yếu</h5>

            <div className="d-flex flex-wrap">
              {weaknesses.map((w, i) => (
                <div>
                  <Button
                    key={i}
                    variant="secondary"
                    className="text-white p-2 rounded-pill me-2"
                    onClick={() => deleteWeakness(s)}
                  >
                    {w} ×
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-2 d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                placeholder="Nhập điểm yếu"
              />
              <button className="btn btn-dark" onClick={handleAddWeakness}>
                Thêm
              </button>
            </div>
          </div>
        </Card>

        <div className="mt-4 d-flex gap-2 justify-content-end">
          <button className="btn btn-success" onClick={handleSave}>
            Lưu thay đổi
          </button>
          <button className="btn btn-danger" onClick={handleReset}>
            Hủy bỏ
          </button>
        </div>
      </Container>
    </div>
  );
}
