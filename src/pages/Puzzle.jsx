import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import PuzzleCard from "@/components/PuzzleCard";
import { API_URL } from "@/lib/Utils";

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
        return (
            <div className="mixed-app-bg min-h-[calc(100vh-4rem)] flex items-center justify-center text-slate-800">
                Loading...
            </div>
        );
    }


  return (
    <div className="mixed-app-bg">
        <div className="flex items-center min-h-[calc(100vh-4rem)] justify-center">
            <PuzzleCard user={user} setUser={setUser}/>
        </div>
    </div>
  )
}

export default Puzzle