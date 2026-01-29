import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(token) navigate("/dashboard");
  }, []);

  return (
    <div>
      <div className="flex min-h-screen">
          <div className="mx-auto my-auto text-white text-3xl flex flex-col items-center">
              <div className=""> 
                [insert landing page ova here]
              </div>
              <div className="flex gap-3">
                  <Link className="mt-3 bg-green-600 px-3 py-1 rounded-lg hover:bg-green-500" to="/login">Login</Link>
                  <Link className="mt-3 bg-green-600 px-3 py-1 rounded-lg hover:bg-green-500" to="/register">Register</Link>
              </div>
          </div>
      </div>
    </div>
  )
}

export default Home