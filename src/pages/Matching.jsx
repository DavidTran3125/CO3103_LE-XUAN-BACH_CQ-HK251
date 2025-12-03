import { useEffect, useState } from "react";
import searchApi from "../api/searchApi";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { FaBell, FaComments } from "react-icons/fa";

export default function Matching() {
  const [query, setQuery] = useState("");
  const [strength, setStrength] = useState("");
  const [weakness, setWeakness] = useState("");
  const [users, setUsers] = useState([]);

  const handleSearch = async () => {
    let params = {};

    if (query.trim() !== "") {
      if (/^\d+$/.test(query.trim())) {
        params.userid = query.trim();
      } else {
        params.username = query.trim();
      }
    }

    if (strength) params.strength = strength;
    if (weakness) params.weak = weakness;

    try {
      const res = await searchApi.search(params);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("SEARCH ERROR: ", err);
    }
  };

  useEffect(() => {
    document.title = "Tìm kiếm | P2P Learning";
  }, []);

  return (
    <div className="d-flex" style={{ backgroundColor: "#e8f1f2" }}>
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-3">Tìm kiếm</h2>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>

        <Card className="p-4 shadow">
          <Row className="g-3">
            <Col md={4}>
              <Form.Control
                placeholder="Nhập ID hoặc tên người dùng"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Col>

            <Col md={3}>
              <Form.Select
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              >
                <option value=""> -- Điểm mạnh -- </option>
                <option value="Math">Math</option>
                <option value="English">English</option>
                <option value="IT">IT</option>
                <option value="Physics">Physics</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
              >
                <option value=""> -- Điểm yếu -- </option>
                <option value="Math">Math</option>
                <option value="English">English</option>
                <option value="IT">IT</option>
                <option value="Physics">Physics</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Button className="w-100" variant="dark" onClick={handleSearch}>
                Tìm kiếm
              </Button>
            </Col>
          </Row>

          <h4 className="mt-4 mb-2">Kết quả tìm kiếm</h4>

          {users.length === 0 ? (
            <p style={{ color: "gray" }}>Không có.</p>
          ) : (
            <Row className="g-3">
              {users.map((user) => (
                <Col md={4} key={user.User_ID}>
                  <Card className="p-3 shadow-sm">
                    <h5>{user.Username}</h5>
                    <p className="mb-1">
                      <strong>ID:</strong> {user.User_ID}
                    </p>
                    <p className="mb-1">
                      <strong>Bio:</strong> {user.Bio || "Không có"}
                    </p>
                    <p className="mb-1">
                      <strong>Created:</strong>{" "}
                      {new Date(user.Created_at).toLocaleString("vi-VN")}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </Container>
    </div>
  );
}
