import { useState } from "react";
import { toast } from "react-toastify";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";

const GroupModal = (props) => {
  const { user, chats, setChats } = ChatState();
  const [groupChatName, setgroupChatName] = useState();
  const [selectedUsers, setselectedUsers] = useState([]);
  const [search, setsearch] = useState("");
  const [searchResults, setsearchResults] = useState([]);
  const [loading, setloading] = useState(false);


  const handleUser = async(user)=>{
    if(selectedUsers.includes(user)){
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
      return
    }

    setselectedUsers([...selectedUsers, user])

  };

   

  const handleRemove = (user) => {
    
    setselectedUsers(selectedUsers.filter((myusr) => myusr._id !== user._id));
  }

 
  const handleSearch = async (query) => {
    setsearch(query);
    if (!query) {
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
        `http://localhost:5000/api/user?search=${search}`,
        config
      );
      console.log(data);
      setsearchResults(data);
      setloading(false);
    } catch (error) {
      toast.error(error.message, {
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

  const handleSubmit = async() => {
    if (!groupChatName || !selectedUsers){
      toast.warn("Please fill all the feilds", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      return
    }

    const {token} = user;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:5000/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      props.fn(false); // Close modal
       toast.success("New Group Created", {
         position: "bottom-right",
         autoClose: 5000,
         hideProgressBar: false,
         closeOnClick: false,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
         theme: "dark",
       });

    } catch (error) {
       toast.error(error.message, {
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

  return (
    <div
      className={`${props.classNm} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex bg-black/[0.5] justify-center items-center w-full h-[calc(100%-1rem)] max-h-full`}
      role="dialog"
      aria-labelledby="modal-title"
      aria-hidden={!props.isOpen}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              Configure Group
            </h3>

            <button
              onClick={() => props.fn(false)}
              aria-label="Close modal"
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#B7B7B7"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </button>
          </div>
          <div className="p-4 md:p-5">
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-left mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Group Name
                </label>
                <input
                  type="text"
                  name="name"
                  onChange={(e) => {
                    setgroupChatName(e.target.value);
                  }}
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  placeholder="The Golden Trio"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="members"
                  className="block text-left mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Members
                </label>
                <input
                  type="text"
                  name="members"
                  id="members"
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                  placeholder={`Harry, Hermione, Ron`}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required
                />
              </div>
              <div className={`${search ? "flex" : "hidden"} gap-2 `}>
                {/* Render searched users */}
                {loading ? (
                  <div className="flex flex-row gap-2 py-5 px-4">
                    <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-4 h-4 rounded-full bg-blue-800 animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                ) : (
                  searchResults?.slice(0, 4).map((user) => (
                    <span
                      key={user._id}
                      onClick={() => handleUser(user)}
                      className=" flex flex-wrap gap-1 font-bold justify-center overflow-hidden items-center  pr-1 cursor-pointer text-sm  bg-yellow-500 border hover:bg-green-500 transition border-white/[0.5] text-gray-100 rounded-lg"
                    >
                      <img
                        width={30}
                        height={30}
                        className="rounded-md"
                        src={user.pic}
                      />

                      {user.name}
                    </span>
                  ))
                )}
              </div>

              {/* selected users */}
              <div
                className={`flex gap-2 ${
                  selectedUsers.length > 0
                    ? "border-t border-gray-500  pt-4"
                    : ""
                } flex-wrap max-h-[100px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-500 [&::-webkit-scrollbar-thumb]:bg-gray-800 overflow-auto`}
              >
                {selectedUsers?.map((user) => (
                  <span
                    key={user._id}
                    onClick={() => handleRemove(user)}
                    className=" flex flex-wrap gap-1 font-semibold justify-center overflow-hidden items-center  pr-1 cursor-pointer text-sm  bg-blue-800 border hover:bg-red-500 transition border-white/[0.2] text-gray-100 rounded-lg"
                  >
                    <img
                      width={30}
                      height={30}
                      className="rounded-md"
                      src={user.pic}
                    />

                    {user.name}
                  </span>
                ))}
              </div>

              <button 
              onClick={()=>{handleSubmit()}}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Craete Group
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
