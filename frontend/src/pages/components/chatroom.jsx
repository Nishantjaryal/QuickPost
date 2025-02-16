import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { getSender, getSenderPic, isSameSender } from "../../config/Chatlogics";
import Spinner from "./spinner";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;

const Chatroom = ({ triggerfn }) => {
  const { user, selectedChat, notification, setnotifications } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const selectedChatRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const toastConfig = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("connect_error", (err) =>
      toast.error(`Connection error: ${err.message}`, toastConfig)
    );
    socket.on("typing", () => setTyping(true));
    socket.on("stop typing", () => setTyping(false));

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (
        !selectedChatRef.current ||
        selectedChatRef.current._id !== newMessage.chat._id
      ) {
        if (!notification.some((notif) => notif._id === newMessage._id)) {
          setnotifications((prev) => [newMessage, ...prev]);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => socket.off("message received");
  }, [notification]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 3000);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error(error.message, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      selectedChatRef.current = selectedChat;
      fetchMessages();
    }
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.warn("Message cannot be empty!", toastConfig);
      return;
    }

    setSending(true);
    socket.emit("stop typing", selectedChat._id);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/message",
        { content: newMessage.trim(), chatId: selectedChat._id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      socket.emit("new message", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessage("");
    } catch (error) {
      toast.error(
        `Error: ${error.response?.data?.message || error.message}`,
        toastConfig
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-gray-400 h-full py-10 flex flex-col justify-start items-center relative">
      {selectedChat ? (
        <div className="w-full">
          <span
            onClick={() => triggerfn(true)}
            className="flex gap-2 font-semibold absolute left-0 top-2 border border-white/[0.1] bg-gray-800 py-[3px] px-2 cursor-pointer rounded-full"
          >
            <img
              className="w-7 h-7 rounded-full"
              src={
                !selectedChat.isGroupChat
                  ? getSenderPic(user, selectedChat.users)
                  : "/group.svg"
              }
              alt="Chat Avatar"
            />
            {!selectedChat.isGroupChat
              ? getSender(user, selectedChat.users)
              : selectedChat.chatName}
          </span>

          <div className="mt-10 w-full h-full">
            {typing && (
              <p className="fixed right-2 bottom-20 py-1 pb-1.5 rounded-full p-2 z-30 bg-blue-500 text-white" aria-live="polite">
                Typing...
              </p>
            )}
            {loading ? (
              <Spinner />
            ) : (
              <div className="relative h-full">
                <div className="w-full min-h-[80vh]">
                  {messages.length > 0 ? (
                    messages.map((m, i) => (
                      <div className="flex" key={m._id}>
                        <span
                          className={`max-w-[75%] my-2 rounded-full py-0.5 px-2 ${
                            isSameSender(messages, m, i, user._id)
                              ? "bg-gray-700"
                              : "bg-blue-600"
                          }`}
                        >
                          {m.content}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div>Start Conversation</div>
                  )}
                </div>

                <div className="flex gap-2 w-full mx-auto absolute">
                  <input
                    type="text"
                    id="text-message"
                    value={newMessage}
                    onChange={typingHandler}
                    className="bg-gray-50 w-[94%] border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Type your message..."
                    required
                    disabled={sending}
                    aria-label="Type your message"
                  />
                  <button
                    onClick={sendMessage}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5"
                    disabled={sending}
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-40 flex flex-col justify-center items-center gap-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="150px"
            viewBox="0 -960 960 960"
            width="150px"
            fill="#557"
          >
            <path d="M120-160v-600q0-33 23.5-56.5T200-840h480q33 0 56.5 23.5T760-760v203q-10-2-20-2.5t-20-.5q-10 0-20 .5t-20 2.5v-203H200v400h283q-2 10-2.5 20t-.5 20q0 10 .5 20t2.5 20H240L120-160Zm160-440h320v-80H280v80Zm0 160h200v-80H280v80Zm400 280v-120H560v-80h120v-120h80v120h120v80H760v120h-80ZM200-360v-400 400Z" />
          </svg>
          <h3 className="text-2xl border border-white/[0.1] bg-slate-900 px-3 rounded-full text-[#557] font-semibold">
            Pick Conversation
          </h3>
        </div>
      )}
    </div>
  );
};

export default Chatroom;
