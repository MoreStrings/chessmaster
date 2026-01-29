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
    <div className="flex justify-center items-center  min-h-[calc(100vh-4rem)] text-white">
        <form onSubmit={handleSubmit} className=" bg-[#303030] p-3 rounded-xl flex flex-col gap-4 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Login</h2>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                name="username"
                placeholder="example_123"
                required
                value={form.username}
                onChange={handleChange}
                className="p-2 bg-[#414141] rounded-xl"
            />
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                name="password"
                placeholder=""
                required
                value={form.password}
                onChange={handleChange}
                className="p-2 bg-[#414141] rounded-xl"
            />
            <button type="Submit" className="p-2 bg-green-800">Login</button>
        </form>
    </div>
  )
}

export default Login