import { useEffect, useState, useContext } from "react";
import groupApi from "../api/groupApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Button, Modal, Form, Card } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { FaBell, FaComments } from "react-icons/fa";
import "./Groups.scss";

export default function Groups() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    group_name: "Group",
    description: "",
    max_member: 10,
    chat_type: "Personal",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await groupApi.getListGroup();
      setGroups(res.data.data);
    } catch (err) {
      console.error("LOAD GROUPS ERROR", err);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    try {
      const res = await groupApi.createGroup(form);
      alert("Tạo nhóm thành công!");
      setShowCreate(false);
      loadGroups();
    } catch (err) {
      console.error("CREATE GROUP ERROR", err);
      console.log(form);
      alert("Lỗi tạo nhóm");
    }
  };

  if (loading) return <p>Loading...</p>;
  console.log(groups);
  return (
    <div className="d-flex" style={{ backgroundColor: "#e8f1f2" }}>
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-5">Nhóm của bạn</h2>
            <Button variant="dark" onClick={() => setShowCreate(true)}>
              + Tạo nhóm mới
            </Button>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>

        <Card className="p-4 shadow d-inline-block">
          <div className="d-flex flex-wrap gap-3">
            {groups.map((group) => (
              <Card
                key={group.Group_ID}
                className="group-card"
                style={{ width: "285px", cursor: "pointer" }}
                onClick={() => navigate(`/chat/${group.Group_ID}`)}
              >
                <Card.Body>
                  <Card.Title>{group.Group_Name}</Card.Title>
                  <Card.Text>{group.Description}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Card>

        <Modal show={showCreate} onHide={() => setShowCreate(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo nhóm mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Tên nhóm</Form.Label>
                <Form.Control
                  value={form.group_name}
                  onChange={(e) =>
                    setForm({ ...form, group_name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Số thành viên tối đa</Form.Label>
                <Form.Control
                  type="number"
                  value={form.max_member}
                  onChange={(e) =>
                    setForm({ ...form, max_member: +e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Loại chat</Form.Label>
                <Form.Select
                  value={form.chat_type}
                  onChange={(e) =>
                    setForm({ ...form, chat_type: e.target.value })
                  }
                >
                  <option value="Personal">Personal</option>
                  <option value="Group">Group</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="success" onClick={handleCreate}>
              Tạo nhóm
            </Button>
            <Button variant="danger" onClick={() => setShowCreate(false)}>
              Hủy bỏ
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
