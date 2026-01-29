import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home"
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Puzzle from "@/pages/Puzzle";
import Evaluate from "@/pages/Evaluate"
import Navbar from "@/components/Navbar";
import PlayFish from "@/pages/PlayFish";

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/evaluate" element={<Evaluate />} />
        <Route path="/play" element={<PlayFish/>} />
        
      </Routes>

    </div>
  );
}