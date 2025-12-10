import api from "./api"; 

export const request = async ({
  method,
  route,
  body,
  auth = false,
  optimistic,
  rollback,
}) => {
  const headers = {};

  // if json body -> set content type
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    headers.Authorization = `Bearer ${localStorage.token}`;
  }

  try {
    if (optimistic) optimistic(body);

    const response = await api.request({
      method,
      url: route,
      headers,
      data: body,
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    if (rollback) rollback();

    return {
      error: true,
      message: error.response?.data || "Something went wrong",
      status: error.response?.status || 500,
    };
  }
};
