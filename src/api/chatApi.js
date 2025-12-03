import axios from "./axios";

const chatApi = {
  getMessages(groupId, page) {
    return axios.get(`/groups/${groupId}/messages/${page}`);
  },
};

export default chatApi;
