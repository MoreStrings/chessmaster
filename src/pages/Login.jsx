import {useState} from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "@/lib/Utils";

const Login = () => {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
    })

    const handleChange = (e) => {
        setForm({...form,  [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const res = await fetch(`${API_URL}/auth/token/`, {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: form.username,
                    password: form.password
                })
            });

            if(!res.ok){
                const errorData = await res.json();
                alert(errorData.detail || "Failed to login.");
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.access_token);
            alert("Succesful login!");
            navigate("/dashboard");
        } catch (err){
            console.error(err);
            alert("Something went wrong!");
        }

    };

  return (
    // Login.jsx (styling enhanced)
<div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
  <form onSubmit={handleSubmit} className="bg-[#1f1f1f] p-8 rounded-2xl flex flex-col gap-5 shadow-2xl w-full max-w-md transition-transform transform hover:scale-105">
    <h2 className="text-3xl font-bold text-center text-green-400 mb-3">Login</h2>

    <label htmlFor="username" className="text-gray-300 font-semibold">Username:</label>
    <input
      type="text"
      name="username"
      placeholder="example_123"
      required
      value={form.username}
      onChange={handleChange}
      className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
    />

    <label htmlFor="password" className="text-gray-300 font-semibold">Password:</label>
    <input
      type="password"
      name="password"
      required
      value={form.password}
      onChange={handleChange}
      className="p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
    />

    <button type="Submit" className="p-3 bg-green-500 rounded-lg hover:bg-green-600 transition-colors text-white font-bold mt-4 shadow-md">Login</button>
  </form>
</div>

  )
}

export default Login