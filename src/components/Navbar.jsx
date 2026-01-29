import React from 'react'
import {Link} from "react-router-dom"

const Navbar = () => {
  return (
    <div className="inset-x-0 bg-[#303030]">
        <div className="max-w-7xl mx-auto text-white">
            <div className="flex justify-between items-center h-16 px-5">
                <Link className="text-2xl font-extrabold border-transparent border-b-3 hover:border-blue-500 hover:text-blue-500" to="/">hello1</Link>
                <div className="text-xl font-bold flex gap-4">
                    <Link className="border-transparent border-b-3  hover:border-blue-500 hover:text-blue-500" to="/puzzle">Puzzles</Link>
                    <Link className="border-transparent border-b-3  hover:border-blue-500 hover:text-blue-500" to="/evaluate">Evaluate</Link>
                    <Link className="border-transparent border-b-3  hover:border-blue-500 hover:text-blue-500" to="/play">Play</Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar