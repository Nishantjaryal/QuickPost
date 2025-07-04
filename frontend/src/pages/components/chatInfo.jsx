import { useEffect, useState } from "react";
import { getSender, getSenderPic } from "../../config/Chatlogics";
import { ChatState } from "../../Context/ChatProvider";
import { toast } from "react-toastify";
import axios from "axios";

const ChatInfo = (props) => {
  const { user, setChats, selectedChat, setselectedChat } = ChatState();
  const [fetchagain, setfetchagain] = useState(false);
  const [groupChatName, setgroupChatName] = useState("");
  const [selectedUsers, setselectedUsers] = useState([]);
  const [search, setsearch] = useState("");
  const [searchResults, setsearchResults] = useState([]);
  const [SearchQuery, setSearchQuery] = useState("");

  const [loading, setloading] = useState(false);
  const [Renameloading, setRenameloading] = useState(false);

  const handleRename = async (e) => {
    e.preventDefault(); // Prevent form submission

    if (!groupChatName.trim()) {
      toast.warn("Please enter a group name", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (!user?.token) {
      toast.error("Authentication token not found", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const { token } = user;

    try {
      setRenameloading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `http://localhost:5000/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName.trim(),
        },
        config
      );

      setselectedChat(data);
      setfetchagain((prev) => !prev);
      toast.success("Group name updated successfully", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to rename group";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setRenameloading(false);
      setgroupChatName("");
    }
  };

  const handleSearch = async (query) => {
    const trimmedQuery = query.trim();
    setsearch(trimmedQuery);

    if (!trimmedQuery) {
      setsearchResults([]);
      setloading(false);
      return;
    }

    if (!user?.token) {
      toast.error("Authentication token not found", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const { token } = user;

    try {
      setloading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${encodeURIComponent(
          trimmedQuery
        )}`,
        config
      );
      console.log(data);
      setsearchResults(data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to search users";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setsearchResults([]);
    } finally {
      setloading(false);
    }
  };

  const fetchChats = async () => {
    if (!user?.token) {
      toast.error("Authentication token not found", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const { token } = user;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/chat",
        config
      );

      setChats(data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch chats";
      toast.error(errorMessage, {
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
  };

  const handleRemove = async (usr) => {
    if (!user?.token) {
      toast.error("Authentication token not found", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (!selectedChat?.groupAdmin?._id || !usr?._id) {
      toast.error("Invalid chat or user data", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const { token } = user;

    // Check permissions
    if (selectedChat.groupAdmin._id !== user._id && usr._id !== user._id) {
      toast.warn("You are not Admin", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: usr._id,
        },
        config
      );

      // If user is removing themselves, close the chat
      if (usr._id === user._id) {
        setselectedChat(null);
        props?.fn?.(false); // Close modal
      } else {
        setselectedChat(data);
      }
      setfetchagain((prev) => !prev);

      toast.success(
        usr._id === user._id
          ? "Left group successfully"
          : "User removed successfully",
        {
          position: "bottom-right",
          autoClose: 3000,
          theme: "dark",
        }
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove user";
      toast.error(errorMessage, {
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
  };

  const handleAdd = async (usr) => {
    if (!user?.token) {
      toast.error("Authentication token not found", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (!selectedChat?.users || !usr?._id) {
      toast.error("Invalid chat or user data", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    const { token } = user;

    // Check if user is already in the group
    if (selectedChat.users.find((u) => u._id === usr._id)) {
      toast.info("User already added", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    // Check if current user is admin
    if (selectedChat.groupAdmin?._id !== user._id) {
      toast.warn("You are not Admin", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: usr._id,
        },
        config
      );

      setselectedChat(data);
      setfetchagain((prev) => !prev);
      toast.success("User added successfully", {
        position: "bottom-right",
        autoClose: 3000,
        theme: "dark",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to add user";
      toast.error(errorMessage, {
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
  };

  useEffect(() => {
    fetchChats();
  }, [fetchagain]);

  // Clean up search when component unmounts or selectedChat changes
  useEffect(() => {
    setsearch("");
    setsearchResults([]);
    setgroupChatName("");
  }, [selectedChat]);

  return (
    <div
      className={`${props?.classNm} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex bg-black/[0.5] justify-center items-center w-full h-[calc(100%-1rem)] max-h-full`}
      role="dialog"
      aria-labelledby="modal-title"
      aria-hidden={!props?.isOpen}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="rounded-lg shadow dark:bg-gray-700">
          <div className="flex p-2 md:p-5">
            <div className="text-gray-400 h-full flex flex-col items-start justify-start">
              {selectedChat ? (
                <div className="flex flex-col items-start justify-start">
                  <span className="flex bg-gray-800 gap-2 font-semibold max-w-[90%] overflow-hidden justify-center items-center pr-4 text-lg py-[8px] px-2 rounded-full">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        !selectedChat.isGroupChat
                          ? getSenderPic(user, selectedChat.users)
                          : "/group.svg"
                      }
                      alt={
                        !selectedChat.isGroupChat
                          ? getSender(user, selectedChat.users)
                          : selectedChat.chatName
                      }
                      onError={(e) => {
                        e.target.src = "/default-avatar.png"; // Fallback image
                      }}
                    />

                    {!selectedChat.isGroupChat
                      ? getSender(user, selectedChat.users)
                      : selectedChat.chatName}
                  </span>

                  <div className="mt-3">ID: {selectedChat?._id}</div>

                  <div
                    className={`${
                      selectedChat.users?.length > 2
                        ? "border-t border-gray-500 flex pt-4"
                        : "hidden"
                    } gap-2 flex-wrap max-h-[100px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-500 [&::-webkit-scrollbar-thumb]:bg-gray-800 overflow-auto`}
                  >
                    {selectedChat.users?.map((chatUser) => (
                      <span
                        key={chatUser._id}
                        onClick={() => handleRemove(chatUser)}
                        className="flex flex-wrap gap-1 font-semibold justify-center overflow-hidden items-center pr-1 cursor-pointer text-sm bg-blue-800 border hover:bg-red-500 transition border-white/[0.2] text-gray-100 rounded-lg"
                      >
                        <img
                          width={30}
                          height={30}
                          className="rounded-md"
                          src={chatUser.pic}
                          alt={chatUser.name}
                          onError={(e) => {
                            e.target.src = "/default-avatar.png"; // Fallback image
                          }}
                        />
                        {chatUser.name}
                      </span>
                    ))}
                  </div>

                  <form
                    className={`${
                      selectedChat.isGroupChat &&
                      selectedChat?.groupAdmin?._id === user?._id
                        ? "flex"
                        : "hidden"
                    } gap-2 mt-4 w-full`}
                    onSubmit={handleRename}
                  >
                    <input
                      className="rounded-md min-w-[60%] p-1 bg-gray-800 border border-white/[0.3]"
                      type="text"
                      name="rename"
                      id="rename"
                      value={groupChatName}
                      onChange={(e) => setgroupChatName(e.target.value)}
                      placeholder="Enter new group name"
                    />
                    <button
                      type="submit"
                      disabled={Renameloading || !groupChatName.trim()}
                      className="py-2 min-w-24 px-3 bg-gray-800 border border-white/[0.3] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Renameloading ? "..." : "Rename"}
                    </button>
                  </form>

                  <div
                    className={`${
                      selectedChat.isGroupChat &&
                      selectedChat?.groupAdmin?._id === user?._id
                        ? "flex"
                        : "hidden"
                    } gap-2 my-4 w-full flex-col items-start`}
                  >
                    <label htmlFor="add">Search User</label>
                    <input
                      className="rounded-md w-full py-2 pl-2 bg-gray-800 border border-white/[0.3]"
                      type="text"
                      name="add"
                      id="add"
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Just Type and search"
                    />
                  </div>

                  <div className={`${search ? "flex" : "hidden"} gap-2 py-2`}>
                    {loading ? (
                      <div className="flex flex-row gap-2 py-5 px-4">
                        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-800 animate-bounce [animation-delay:-.5s]"></div>
                      </div>
                    ) : (
                      searchResults?.slice(0, 4).map((searchUser) => (
                        <span
                          key={searchUser._id}
                          onClick={() => handleAdd(searchUser)}
                          className="flex flex-wrap gap-1 font-bold justify-center overflow-hidden items-center pr-1 cursor-pointer text-sm bg-yellow-500 border hover:bg-green-500 transition border-white/[0.5] text-gray-100 rounded-lg"
                        >
                          <img
                            width={30}
                            height={30}
                            className="rounded-md"
                            src={searchUser.pic}
                            alt={searchUser.name}
                            onError={(e) => {
                              e.target.src = "/default-avatar.png"; // Fallback image
                            }}
                          />
                          {searchUser.name}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-gray-500 text-white rounded p-2 py-0.5 mt-4 border border-white/[0.1]"
                      onClick={() => props?.fn?.(false)}
                    >
                      Close
                    </button>
                    <button
                      className={`${
                        selectedChat?.isGroupChat ? "flex" : "hidden"
                      } bg-red-500 text-white rounded p-2 py-0.5 mt-4 border border-white/[0.1]`}
                      onClick={() => handleRemove(user)}
                    >
                      Leave Group
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center gap-0">
                  <h3 className="text-2xl border border-white/[0.1] pb-0.5 bg-slate-900 px-3 rounded-full text-[#557] font-semibold">
                    Please Pick Conversation
                  </h3>
                  <div className="flex gap-2 items-start justify-start w-full">
                    <button
                      className="bg-gray-500 text-white rounded p-2 py-0.5 mt-4 border border-white/[0.1]"
                      onClick={() => props?.fn?.(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
