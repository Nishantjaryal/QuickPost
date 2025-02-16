import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// context api provides us with a wrapper around the content to serve data transfer
// Context provides a way to pass data through the component tree without having to pass props

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(); // accessible accross app
  const [selectedChat, setselectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setnotifications] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
  }, [history]);
  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setselectedChat,
        chats,
        setChats,
        notification,
        setnotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// whatever the state we created in context api now it will be appear in entire app

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
