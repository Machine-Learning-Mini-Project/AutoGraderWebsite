import { api } from "./authApi";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const fetchCreatePost = async (classroomID, inputs) => {
  const result = await api.post(`${BASE_URL}/api/posts/${classroomID}`, inputs);
  return result;
};