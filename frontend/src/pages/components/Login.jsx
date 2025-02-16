import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useHistory } from "react-router-dom";
const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setloading] = useState(false);
  const history = useHistory();

  const submitHandle = async () => {
    setloading(true);
    // Validate fields
    if (!email || !password) {
      toast.warn("All fields are required!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setloading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };

      // API request
      const { data } = await axios.post(
        `http://localhost:5000/api/user/login`,
        { email, password },
        config
      );

      // Success feedback
      toast.success("Successfully Login", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      // Store user data and redirect
      localStorage.setItem("userInfo", JSON.stringify(data));
      setloading(false);
      history.push("/chats");


    } catch (error) {
      // Error handling
      console.error(error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      setloading(false);
    }
  };

  return (
    <form className="max-w-sm w-[320px] min-w-[270px] mx-auto bg-slate-800 p-4 rounded-md shadow-lg border border-slate-500/[0.1] flex flex-col">
      <div className="mb-5 flex flex-col items-start">
        <label
          htmlFor="email"
          className="block mb-2 pl-2  text-sm font-medium text-gray-50 "
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          onChange={(e) => setemail(e.target.value)}
          className="shadow-sm bg-gray-600 border border-gray-100/[0.2] text-gray-100 text-sm rounded-lg focus:ring-blue-300 focus:border-blue-300 block w-full p-2.5 "
          placeholder="username@example.com"
          required
        />
      </div>
      <div className="mb-5 flex flex-col items-start">
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-gray-50 "
        >
          Enter password
        </label>
        <input
          placeholder="*********"
          type="password"
          id="password"
          onChange={(e) => setpassword(e.target.value)}
          className="shadow-sm bg-gray-600 border border-gray-100/[0.2] text-gray-100 text-sm rounded-lg focus:ring-blue-300 focus:border-blue-300 block w-full p-2.5 "
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        onClick={submitHandle}
        className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
      >
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
