import { useState, useEffect } from "react";
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

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      await authApi.signup({ username, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  useEffect(() => {
    document.title = "Đăng ký | P2P Learning";
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
            className="shadow-lg p-4"
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
                  Đăng ký
                </Card.Title>
              </div>

              <Form onSubmit={handleSignup}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Control
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Control
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group
                  className="mb-4"
                  controlId="formBasicConfirmPassword"
                >
                  <Form.Control
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Đăng ký
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
