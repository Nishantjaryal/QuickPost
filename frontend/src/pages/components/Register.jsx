import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Register = () => {
  const [email, setemail] = useState("");
  const [name, setname] = useState("");
  const [password, setpassword] = useState("");
  const [repeatpassword, setrepeatpassword] = useState("");
  const [file, setfile] = useState("");
  const [loading, setloading] = useState(false);
  const [allset, setallset] = useState(true);



  const history = useHistory();

  const postdetails = (pic) => {
    setloading(true);

    if (pic === undefined) {
      toast.warn("Provide Valid Image", {
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

    if (
      pic.type === "image/jpeg" ||
      pic.type === "image/jpg" ||
      pic.type === "image/png"
    ) {
      const data = new FormData();
      data.append("file", pic);
      data.append("upload_preset", "QuickPost");
      data.append("cloud_name", "dwx9dldyc");

      fetch("https://api.cloudinary.com/v1_1/dwx9dldyc/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setfile(data.url.toString());
          console.log(data.url.toString());
          setloading(false);
          toast.success("Successfully Uploaded", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        })
        .catch((err) => {
          console.log(err.message);
          setloading(false);
          toast.error("Application Error", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        });
    } else {
      toast.info("Image type not supported", {
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
    }
  };

  const submitHandle = async () => {
    setloading(true);

    // Validate fields
    if (!name || !email || !password || !repeatpassword || !allset) {
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

    // Check password match
    if (password !== repeatpassword) {
      toast.info("Passwords do not match!", {
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
      // API call configuration
      const config = {
        headers: { "Content-type": "application/json" },
      };

      // API request
      const { data } = await axios.post(
        `http://localhost:5000/api/user`,
        { name, email, password, pic:file },
        config
      );

      // Success feedback
      toast.success("Successfully Registered!", {
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
      <div className="mb-4 flex flex-col items-start">
        <label
          htmlFor="name"
          className="block mb-2 pl-2  text-sm font-medium text-gray-50 "
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          onChange={(e) => setname(e.target.value)}
          className="shadow-sm bg-gray-600 mb-4 border border-gray-100/[0.2] text-gray-100 text-sm rounded-lg focus:ring-blue-300 focus:border-blue-300 block w-full p-2.5 "
          placeholder="username"
          required
        />
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
      <div className="mb-4 flex flex-col items-start">
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
      <div className="mb-4 flex flex-col items-start">
        <label
          htmlFor="repeat-password"
          className="block mb-2 text-sm font-medium text-gray-50 "
        >
          Repeat password
        </label>
        <input
          placeholder="*********"
          type="password"
          id="repeat-password"
          onChange={(e) => setrepeatpassword(e.target.value)}
          className="shadow-sm bg-gray-600 border border-gray-100/[0.2] text-gray-100 text-sm rounded-lg focus:ring-blue-300 focus:border-blue-300 block w-full p-2.5 "
          required
        />
      </div>
      <div className="flex flex-col items-start mb-4">
        <label
          className="block  mb-2 text-sm font-medium text-gray-50 "
          htmlFor="user_avatar"
        >
          Upload file
        </label>
        <input
          className=" block w-full p-2 text-sm text-gray-50 border border-gray-100/[0.2] rounded-lg cursor-pointer bg-gray-600focus:outline-none "
          aria-describedby="user_avatar_help"
          id="user_avatar"
          type="file"
          accept="image/*"
          onChange={(e) => postdetails(e.target.files[0])}
        />
      </div>
      <div className="flex items-start mb-4">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            value=""
            onChange={(e) => setallset(e.target.checked)}
            // onChange={() => setallset((prev) => !prev)}
            className="w-4 h-4 border border-gray-100/[0.2] rounded bg-white focus:ring-3 focus:ring-blue-300 "
            defaultChecked={allset}
            required
          />
        </div>
        <label
          htmlFor="terms"
          className="ms-2 text-sm font-medium text-gray-100 "
        >
          I agree with the{" "}
          <a href="#" className="text-blue-300 hover:underline ">
            terms and conditions
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        onClick={submitHandle}
        className="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
      >
        {loading ? "Loading..." : "Register New User"}
      </button>
    </form>
  );
};

export default Register;
