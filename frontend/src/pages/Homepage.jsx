import { useEffect, useState } from "react";
import Register from "./components/Register";
import Login from "./components/login"; 
import { ToastContainer } from "react-toastify";
import { useHistory } from "react-router-dom";



const Homepage = () => {


  const [hasAccount, setHasAccount] = useState(true);


  const history = useHistory();
  
    useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
      if (userInfo) history.push("/chats");
    }, [history]);


  const toggleAuth = () => {
    setHasAccount((prev) => !prev);
  };



  return (
    <div className="flex flex-col flex-wrap justify-center h-screen w-full items-center text-blue-500">
      <h1 className="font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
        QuickPost
      </h1>
      {hasAccount ? <Login /> : <Register />}
      <p
        id="toggleAuth"
        className="mt-4 py-2 px-3 cursor-pointer rounded-sm"
        onClick={toggleAuth}
      >
        {hasAccount ? "Register" : "Login"}
      </p>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Homepage;







// my approach

// import { useState } from "react";
// import Login from "./components/login"
// import Register from "./components/Register"

// const Homepage = () => {
//     const [hasAccount, setHasAccount] = useState(true);
// const element = document.getElementById("toggleAuth");
// element.addEventListener("click", () => hasAccount?setHasAccount(false):setHasAccount(true));

//   return (
//     <div className="flex flex-col flex-wrap justify-center h-screen w-full items-center text-blue-500">
//       {hasAccount && <Login />}
//       {!hasAccount && <Register />}
//       <p id="toggleAuth" className="mt-4 py-2 px-3 shadow-sm cursor-pointer rounded-sm">
//         {hasAccount && "Register"}
//         {!hasAccount && "Login"}
//       </p>
//     </div>
//   );
// }

// export default Homepage
