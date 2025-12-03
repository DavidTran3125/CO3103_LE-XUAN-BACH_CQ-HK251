import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import authApi from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import classNames from "classnames";
import logo from "../assets/p2p.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await authApi.login({ username, password });
      console.log(res.data);
      login(res.data.user, res.data.token); // lưu vào context
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  useEffect(() => {
    document.title = "Đăng nhập | P2P Learning";
  }, []);

  return (
    <Container
      fluid
      className={classNames(
        "d-flex",
        "align-items-center",
        "justify-content-center",
        "vh-100"
      )}
    >
      <Row>
        <Col className="mx-auto">
          <Card
            className="shadow-lg p-3"
            style={{
              width: "600px",
            }}
          >
            <Card.Body>
              <div className="text-center mb-4">
                <img
                  src={logo}
                  alt="logo"
                  style={{
                    width: "110px",
                    height: "auto",
                  }}
                />
                <Card.Title as="h2" className="mt-3 fw-bold">
                  Đăng nhập
                </Card.Title>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Control
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="mb-4">
                  {error && (
                    <Alert variant="danger" className="p-2">
                      {error}
                    </Alert>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <Button variant="dark" type="submit" size="lg">
                    Đăng nhập
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
