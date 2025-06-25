import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 and reject all other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("force-logout"));
    }
    return Promise.reject(error);
  }
);

// 🔐 Helper to extract error messages safely
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "object" && data && "message" in data) {
      return (data as { message?: string }).message || "Something went wrong.";
    }
    return error.message;
  }
  return "An unknown error occurred.";
};

// GET
const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Fetch error:", getErrorMessage(error));
    return Promise.reject(error);
  }
};

// POST
const postData = async <T>(path: string, data: unknown): Promise<T> => {
  try {
    const response = await api.post(path, data);
    return response.data;
  } catch (error) {
    console.error("Post error:", getErrorMessage(error));
    return Promise.reject(error);
  }
};

// DELETE
const deleteData = async <T>(path: string): Promise<T> => {
  try {
    const response = await api.delete(path);
    return response.data;
  } catch (error) {
    console.error("Delete error:", getErrorMessage(error));
    return Promise.reject(error);
  }
};

// PUT
const updateData = async <T>(path: string, data: unknown): Promise<T> => {
  try {
    const response = await api.put(path, data);
    return response.data;
  } catch (error) {
    console.error("Update error:", getErrorMessage(error));
    return Promise.reject(error);
  }
};

export { fetchData, postData, deleteData, updateData, getErrorMessage };
