import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import chatApi from "../api/chatApi";
import groupApi from "../api/groupApi";
import io from "socket.io-client";
import { FaBell, FaComments } from "react-icons/fa";
import { Container, Button, Modal, Form, Card } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

const socket = io("http://localhost:4000");

export default function Chat() {
  const { groupID } = useParams();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();

    socket.emit("join_room", [groupID]);

    socket.on("server_client", (msg) => {
      if (msg.roomId == groupID) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => socket.off("server_client");
  }, [groupID]);

  const loadMessages = async () => {
    try {
      const res = await chatApi.getMessages(groupID, 1);
      setMessages(res.data.data);
      scrollToBottom();
    } catch (err) {
      console.error("LOAD MESSAGE ERROR", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      roomId: groupID,
      senderId: user.userID,
      username: user.username,
      message: input,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    socket.emit("client_server", msg);
    setInput("");
  };

  useEffect(() => {
    document.title = "Chat | P2P Learning";
  }, []);

  return (
    <div className="d-flex" style={{ backgroundColor: "#e8f1f2" }}>
      <Sidebar />

      <Container fluid className="p-4 flex-grow-1">
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="mb-4">Chat Room #{groupID}</h2>
          </div>

          <div className="d-flex">
            <FaBell className="me-4" size={24} />
            <FaComments size={24} />
          </div>
        </div>

        <Card className="p-4 shadow">
          <div className="d-flex flex-column gap-3">
            <div
              className="border rounded p-3 mb-1"
              style={{ flexGrow: 1, overflowY: "auto", height: "60vh" }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 mb-2 rounded ${
                    m.senderId === user.userID
                      ? "bg-secondary text-white ms-auto"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "60%" }}
                >
                  <div className="d-flex justify-content-between">
                    <strong>{m.username}</strong>
                    <small className="text-muted">
                      {m.Created_at || m.createdAt}
                    </small>
                  </div>
                  <hr />
                  <div>{m.message}</div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>

            <div className="d-flex gap-2">
              <Form.Control
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="dark" onClick={sendMessage}>
                Gửi
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
