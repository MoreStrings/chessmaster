import {useState} from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "@/lib/Utils";

const Register = () => {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        elo: "",
    });

    const handleChange = (e) =>{
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!form.elo){
            alert("Please select your level!");
            return;
        }

        try{
            const res = await fetch(`${API_URL}/auth/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form)
            });

            if(!res.ok){
                const errorData = await res.json();
                alert(errorData.detail || "Failed to create user.");
                return;
            }

            alert("User created succesfully!");
            navigate("/login");
        } catch (err){
            console.error(err);
            alert("Something went wrong!");
        }

    };

  return (
    <div className="flex justify-center items-center  min-h-[calc(100vh-4rem)] text-white">
        <form onSubmit={handleSubmit} className=" bg-[#303030] p-3 rounded-xl flex flex-col gap-4 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-2">Create Account</h2>
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
            <label htmlFor="email">Email:</label>
            <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                required
                value={form.email}
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
            <div className="flex flex-col">
                <label className="font-semibold">Select your level:</label>
                <div className="flex gap-3 flex-wrap">
                    <div><input type="radio" id="elo1" name="elo" value="800" checked={form.elo === "800"} onChange={handleChange}/> <label htmlFor="elo1">Beginner(800)</label></div>
                    <div><input type="radio" id="elo2" name="elo" value="1500" checked={form.elo === "1500"} onChange={handleChange}/> <label htmlFor="elo2">Intermediate(1500)</label></div>
                    <div><input type="radio" id="elo3" name="elo" value="2000" checked={form.elo === "2000"} onChange={handleChange}/> <label htmlFor="elo3">Advanced(2000)</label></div>
                </div>
            </div>
            <button type="Submit" className="p-2 bg-green-800">Register</button>
        </form>
    </div>
  )
}

export default Register