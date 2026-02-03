import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, Route, createBrowserRouter,createRoutesFromElements} from "react-router-dom";
import './index.css'
import Layout from './Layout.jsx'
import PlayFish from './pages/PlayFish.jsx'; 
import Puzzle from './pages/Puzzle.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Evaluate from './pages/Evaluate.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<LandingPage />}/>
      <Route path='login' element={<Login />}/>
      <Route path='register' element={<Register />}/>
      <Route path='/dashboard/play' element={<PlayFish/>}/>
      <Route path='/dashboard/puzzle' element={<Puzzle/>}/>
      <Route path='/dashboard/evaluate' element={<Evaluate/>}/>
      <Route path='/dashboard' element={<Layout />}>
        <Route index element={<Dashboard/>}/>
      </Route>
    </>
  )
)


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
