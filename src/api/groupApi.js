import axios from "./axios";

const groupApi = {
  createGroup(data) {
    return axios.post("/groups", data);
  },
  getListGroup() {
    return axios.get("/groups");
  },
};

export default groupApi;
