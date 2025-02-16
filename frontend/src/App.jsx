
import { Route } from 'react-router-dom'
import './App.css'
import Homepage from './pages/Homepage';
import Chatpage from './pages/Chatpage';

function App() {

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-slate-900 to-slate-800 w-full">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
    </div>
  );
}

export default App
