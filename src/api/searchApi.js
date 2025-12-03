import axios from "./axios";

const searchApi = {
  search(params) {
    return axios.get("/matching", { params });
  },
};

export default searchApi;
