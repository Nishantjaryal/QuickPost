
export const getSender = (loggedUser,users)=>{
    return (users[0]._id === loggedUser._id) ? (users[1].name) : (users[0].name)
}
export const getSenderPic = (loggedUser,users)=>{
    return (users[0]._id === loggedUser._id) ? (users[1].pic) : (users[0].pic)
}
export const getSenderMail = (loggedUser,users)=>{
    return (users[0]._id === loggedUser._id) ? (users[1].email) : (users[0].email)
}

export const isSameSender = (message, m, i, userID) => {
    return(
        i<message.length-1 && (
            message[i+1].sender._id !== m.sender._id || message[i+1].sender._id === undefined
        ) && message[i].sender._id !== userID
    )
} 