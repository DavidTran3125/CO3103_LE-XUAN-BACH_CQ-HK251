import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AuthProvider from "./context/AuthContext.jsx";
import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Groups from "./pages/Groups.jsx";
import Chat from "./pages/Chat.jsx";
import Matching from "./pages/Matching.jsx";

const routers = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <App />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/users/:userID",
    element: (
      <ProtectedRoutes>
        <Profile />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/users/:userID/edit",
    element: (
      <ProtectedRoutes>
        <EditProfile />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoutes>
        <Groups />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/chat/:groupID",
    element: (
      <ProtectedRoutes>
        <Chat />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/matching",
    element: (
      <ProtectedRoutes>
        <Matching />
      </ProtectedRoutes>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={routers} />
    </AuthProvider>
  </StrictMode>
);
