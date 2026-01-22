// import { useAuth } from "../../contexts/AuthContext";
// import { request } from "../../http/request";

// export const useAuthApi = () => {
//   const { setUser } = useAuth();

//   const login = async (email, password) => {
//     const res = await request({
//       method: "POST",
//       route: "/auth/login",
//       body: { email, password },
//       withCredentials: true,
//     });
//     console.log("response login",await res.message)
//     if (res?.user) {
//       // setUser(res.user);
//       return { success: true };
//     }

//     return {
//       success: false,
//       message:
//          typeof res?.message === "string"
//           ? res.message
//           : typeof res?.message?.message === "string"
//           ? res.message.message
//           : res?.message?.error === "Unauthorized"
//           ? "Invalid credentials"
//           : "Something went wrong",
//       status: res?.statusCode || 500,
//     };
//   };

//   const register = async (email, password) => {
//     const res = await request({
//       method: "POST",
//       route: "/auth/register",
//       body: { email, password },
//       withCredentials: false,
//     });

//     if (res?.user) {
//       setUser(res.user);
//       return { success: true };
//     }

//     return {
//       success: false,
//       message:
//         typeof res?.message.message === "string"
//           ? res.message.message
//           : Array.isArray(res?.message?.message)
//           ? res.message.message[0]
//           : "Something went wrong",
//       status: res?.statusCode || 500,
//     };
//   };

//   return { login, register };
// };
