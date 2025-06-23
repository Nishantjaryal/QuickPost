import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import Chatroom from "./components/chatroom";
import { getSender, getSenderPic } from "../config/Chatlogics";
import GroupModal from "./components/GroupModal";
import ChatInfo from "./components/chatInfo";

const Chatpage = () => {
  const {
    user,
    selectedChat,
    setselectedChat,
    chats,
    setChats,
    notification,
    setnotifications,
  } = ChatState();
  const history = useHistory();

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setloading] = useState(false);
  const [loadingChat, setloadingChat] = useState(false);
  const [sidebar, setsidebar] = useState(false);
  const [model, toggleModel] = useState(false);
  const [Infomodel, toggleInfoModel] = useState(false);
  const [savedChats, setSavedChats] = useState([]);

  // Initialize savedChats properly
  useEffect(() => {
    if (!chats || chats.length === 0) {
      try {
        const stored = localStorage.getItem("mychats");
        if (stored) {
          const parsedChats = JSON.parse(stored);
          setSavedChats(Array.isArray(parsedChats) ? parsedChats : []);
        } else {
          setSavedChats([]);
        }
      } catch (error) {
        console.error("Error parsing stored chats:", error);
        setSavedChats([]);
      }
    } else {
      setSavedChats(chats);
    }
  }, [chats]);

  const fetchChats = useCallback(async () => {
    if (!user?.token) {
      console.error("No user token available");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/chat",
        config
      );

      if (Array.isArray(data)) {
        setChats(data);
        localStorage.setItem("mychats", JSON.stringify(data));
        setSavedChats(data);
      } else {
        console.error("Invalid chat data received:", data);
        setSavedChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error(error.response?.data?.message || error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [user?.token, setChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const accessChat = async (userId) => {
    if (!user?.token) {
      toast.error("Authentication required", {
        position: "bottom-right",
        theme: "dark",
      });
      return;
    }

    if (!userId) {
      toast.error("Invalid user ID", {
        position: "bottom-right",
        theme: "dark",
      });
      return;
    }

    setloadingChat(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { userId },
        config
      );

      // Ensure chats is an array before checking
      const currentChats = Array.isArray(chats) ? chats : [];

      // Avoid duplicates in the chats list
      if (!currentChats.find((c) => c._id === data._id)) {
        const updatedChats = [data, ...currentChats];
        setChats(updatedChats);
        localStorage.setItem("mychats", JSON.stringify(updatedChats));
      }

      setselectedChat(data);
      setSearch("");
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast.error(error.response?.data?.message || error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setloadingChat(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("mychats");
    history.push("/");
  };

  const handleSearch = useCallback(async () => {
    if (!search.trim()) {
      setSearchResult([]);
      return;
    }

    if (!user?.token) {
      toast.error("Authentication required", {
        position: "bottom-right",
        theme: "dark",
      });
      return;
    }

    setloading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${encodeURIComponent(search)}`,
        config
      );

      setSearchResult(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error(error.response?.data?.message || error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setSearchResult([]);
    } finally {
      setloading(false);
    }
  }, [search, user?.token]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResult([]);
      return;
    }

    // Debouncing to improve performance
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  // Early return if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="antialiased relative bg-gray-50 dark:bg-gray-900 w-full overflow-hidden">
      {/* Group Modal */}
      <GroupModal
        classNm={model ? "block" : "hidden"}
        fn={toggleModel}
        isOpen={model}
      />

      {/* Chat Info Modal */}
      <ChatInfo
        classNm={Infomodel ? "block" : "hidden"}
        fn={toggleInfoModel}
        isOpen={Infomodel}
      />

      {/* Search Drawer */}
      <div
        id="drawer-navigation"
        className={`fixed top-0 ${
          search.length > 0 ? "right-0" : "right-[-256px]"
        } z-[100] w-64 h-screen p-4 overflow-y-auto transition-transform border-l-gray-600 bg-[#273141]`}
        aria-labelledby="drawer-navigation-label"
      >
        <button
          type="button"
          onClick={() => setSearch("")}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 start-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>

        <h5 className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
          Users
        </h5>

        <div className="py-4 overflow-y-auto">
          {/* Loading Spinner */}
          <div
            className={`${
              loading ? "flex" : "hidden"
            } items-center justify-center w-full h-56 border-gray-200 rounded-lg bg-gray-50 dark:bg-transparent`}
          >
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>

          {/* Search Results */}
          <ul
            className={`${loading ? "hidden" : "block"} space-y-2 font-medium`}
          >
            {searchResult.map((user) => (
              <li
                className="flex w-full gap-2 py-2 px-4 text-base font-medium text-center text-gray-700 cursor-pointer hover:bg-gray-600"
                key={user._id}
                onClick={() => accessChat(user._id)}
              >
                <img
                  src={user.pic || "/user.svg"}
                  className="rounded-full w-6 h-6"
                  alt={user.name}
                  onError={(e) => {
                    e.target.src = "/user.svg";
                  }}
                />
                {user.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            <img
              src="/telegram.svg"
              className="mr-3 h-8"
              alt="QuickPost Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              QuickPost
            </span>
            <form className="hidden md:block md:pl-5">
              <label htmlFor="topbar-search" className="sr-only">
                Search
              </label>
              <div className="relative min-w-64 w-full md:w-96">
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="topbar-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search users..."
                />
              </div>
            </form>
          </div>

          <div className="flex items-center lg:order-2">
            {/* Notifications */}
            <button
              type="button"
              className={`p-2 max-md:hidden mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 ${
                notification?.length > 0 ? "bg-blue-700 border-white" : ""
              }`}
              onClick={() => setnotifications([])}
            >
              <span className="sr-only">View notifications</span>
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setsidebar((prev) => !prev)}
              className="p-1.5 md:hidden text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>

            {/* User profile */}
            <button
              type="button"
              className="flex ml-2 w-10 justify-center items-center h-10 md:mx-3 p-0 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <img
                className="w-8 h-8 rounded-full"
                src={user?.pic || "/user.svg"}
                alt={user?.name || "User"}
                onError={(e) => {
                  e.target.src = "/user.svg";
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 ${
          sidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } z-40 w-64 h-screen pt-14 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">
          <ul className="space-y-3">
            {/* Mobile search */}
            <li className="md:hidden">
              <span className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#B7B7B7"
                >
                  <path d="M440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T520-640q0-33-23.5-56.5T440-720q-33 0-56.5 23.5T360-640q0 33 23.5 56.5T440-560ZM884-20 756-148q-21 12-45 20t-51 8q-75 0-127.5-52.5T480-300q0-75 52.5-127.5T660-480q75 0 127.5 52.5T840-300q0 27-8 51t-20 45L940-76l-56 56ZM660-200q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-540 40v-111q0-34 17-63t47-44q51-26 115-44t142-18q-12 18-20.5 38.5T407-359q-60 5-107 20.5T221-306q-10 5-15.5 14.5T200-271v31h207q5 22 13.5 42t20.5 38H120Zm320-480Zm-33 400Z" />
                </svg>
                <span className="ml-3">Search</span>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search users..."
              />
            </li>

            {/* Chats section */}
            <li>
              <span className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                <span className="ml-4">Chats</span>
              </span>

              <ul className="space-y-1 font-medium h-[200px] overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-500 [&::-webkit-scrollbar-thumb]:bg-gray-700">
                {savedChats.map((chat) => (
                  <li
                    className={`flex w-full gap-2 py-2 px-4 text-base font-medium text-center cursor-pointer text-gray-400 hover:bg-gray-700 ${
                      chat === selectedChat ? "bg-gray-900" : ""
                    }`}
                    key={chat._id}
                    onClick={() => setselectedChat(chat)}
                  >
                    <img
                      className="w-7 h-7 rounded-full"
                      src={
                        !chat.isGroupChat
                          ? getSenderPic(user, chat.users) || "/user.svg"
                          : "/group.svg"
                      }
                      alt="Chat"
                      onError={(e) => {
                        e.target.src = chat.isGroupChat
                          ? "/group.svg"
                          : "/user.svg";
                      }}
                    />
                    <span className="truncate">
                      {!chat.isGroupChat
                        ? getSender(user, chat.users)
                        : chat.chatName}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* Additional menu items */}
          <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <li onClick={() => toggleModel((prev) => !prev)}>
              <button className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25px"
                  viewBox="0 -960 960 960"
                  width="25px"
                  fill="#B7B7B7"
                >
                  <path d="M96-192v-92q0-25.78 12.5-47.39T143-366q54-32 114.5-49T384-432q66 0 126.5 17T625-366q22 13 34.5 34.61T672-284v92H96Zm648 0v-92q0-42-19.5-78T672-421q39 8 75.5 21.5T817-366q22 13 34.5 34.67Q864-309.65 864-284v92H744ZM384-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42Zm336-144q0 60-42 102t-102 42q-8 0-15-.5t-15-2.5q25-29 39.5-64.5T600-624q0-41-14.5-76.5T546-765q8-2 15-2.5t15-.5q60 0 102 42t42 102ZM168-264h432v-20q0-6.47-3.03-11.76-3.02-5.3-7.97-8.24-47-27-99-41.5T384-360q-54 0-106 14t-99 42q-4.95 2.83-7.98 7.91-3.02 5.09-3.02 12V-264Zm216.21-288Q414-552 435-573.21t21-51Q456-654 434.79-675t-51-21Q354-696 333-674.79t-21 51Q312-594 333.21-573t51 21ZM384-264Zm0-360Z" />
                </svg>
                <span className="ml-3">Add Group</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
              >
                <svg
                  className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-3">Sign out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:ml-64 min-h-screen pt-20">
        {loadingChat ? (
          <div className="flex flex-row gap-2 py-5 px-4">
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" />
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]" />
            <div className="w-4 h-4 rounded-full bg-blue-800 animate-bounce [animation-delay:-.5s]" />
          </div>
        ) : (
          <Chatroom triggerfn={toggleInfoModel} />
        )}
      </main>

      <ToastContainer />
    </div>
  );
};

export default Chatpage;
