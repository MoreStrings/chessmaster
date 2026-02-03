import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import PuzzleCard from "@/components/PuzzleCard";
import { API_URL } from "@/lib/Utils";
import { FaArrowLeft } from "react-icons/fa";

const Puzzle = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            navigate("/login");
            return;
        }

        const fetchUser = async () => {
            try{
                
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: {"Authorization": `Bearer ${token}`,},
                });

                if(res.status === 401){
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                const data = await res.json();
                setUser(data);
            } catch (err){
                console.error(err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if(loading){
        return <div className="text-white text-center mt-20">Loading...</div>;
    }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative">
        {/* Back Button - Fixed Left Side */}
        <button
            onClick={() => navigate("/dashboard")}
            className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-lg transition-all duration-200 border border-slate-700 hover:border-slate-600 shadow-lg"
        >
            <FaArrowLeft />
            <span className="font-medium">Back</span>
        </button>
        <div className="flex items-center min-h-[calc(100vh-5rem)] justify-center">
            <PuzzleCard user={user} setUser={setUser}/>
        </div>
    </div>
  )
}

export default Puzzle