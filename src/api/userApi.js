import axios from "./axios";

const userApi = {
  getProfile(id) {
    return axios.get(`/users/${id}`);
  },
  updateProfile(id, data) {
    return axios.put(`/users/${id}`, data);
  },

  getStrengths(id) {
    return axios.get(`/users/${id}/strengths`);
  },
  getWeaknesses(id) {
    return axios.get(`/users/${id}/weaknesses`);
  },

  addStrength(id, strength) {
    return axios.post(`/users/${id}/strengths`, { strengths: [strength] });
  },
  deleteStrength(id, strength) {
    return axios.delete(`/users/${id}/strengths/${strength}`);
  },

  addWeakness(id, weakness) {
    return axios.post(`/users/${id}/weaknesses`, { weaknesses: [weakness] });
  },
  deleteWeakness(id, weakness) {
    return axios.delete(`/users/${id}/weaknesses/${weakness}`);
  },
};

export default userApi;
