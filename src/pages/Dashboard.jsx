import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/Utils";


const Dashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // console.log(token);

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
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#202020]">
      {user ? (
        <>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user.username}!
          </h1>
          <p className="text-xl">Your current Elo: {user.elo}</p>
        </>
      ) : (
        <p className="text-xl">No user data available.</p>
      )}
      <div className="mt-6">add more stuff here to finish</div>
      <ul>
        <li>add charts</li>
        <li>and other stuff</li>
      </ul>
    </div>
  );
};

export default Dashboard