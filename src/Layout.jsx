import React from 'react'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';
import './App.css'  



function Layout(){
    return(
        <>
        <Navbar />
        <Outlet />
        <Footer />
        </>
    )
}

export default Layout