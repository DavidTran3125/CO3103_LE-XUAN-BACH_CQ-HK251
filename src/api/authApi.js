import axios from "./axios";

const authApi = {
  login(data) {
    return axios.post("/login", data);
  },
  signup(data) {
    return axios.post("/signup", data);
  },
};

export default authApi;
