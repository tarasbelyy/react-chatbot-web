import './App.css';
import { AuthProvider } from './AuthContext';
import Navbar from "./Navbar"
import Messages from "./Messages"

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Navbar />
        <Messages />
      </AuthProvider>
    </div>
  );
}

export default App;
