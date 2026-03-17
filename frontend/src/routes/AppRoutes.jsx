import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserRegister from '../pages/auth/UserRegister';
import ChooseRegister from '../pages/auth/ChooseRegister';
import UserLogin from '../pages/auth/UserLogin';
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister';
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin';
import Home from '../pages/general/Home';
import Saved from '../pages/general/Saved';
import BottomNav from '../components/BottomNav';
import CreateFood from '../pages/food-partner/CreateFood';
import Profile from '../pages/food-partner/Profile';
import MyUploads from '../pages/food-partner/MyUploads';

const getAuthRole = () => {
    return localStorage.getItem('authRole'); // "user" | "food-partner"
}

const ProtectedFoodPartner = ({ children }) => {
    const role = getAuthRole();
    if (role !== 'food-partner') return <Navigate to="/food-partner/login" replace />;
    return children;
}

const ProtectedUser = ({ children }) => {
    const role = getAuthRole();
    if (role !== 'user') return <Navigate to="/user/login" replace />;
    return children;
}

const AppRoutes = () => {
    const role = getAuthRole();
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    role === 'user'
                        ? <Navigate to="/home" replace />
                        : role === 'food-partner'
                            ? <Navigate to="/create-food" replace />
                            : <Navigate to="/register" replace />
                } />
                <Route path="/register" element={<ChooseRegister />} />
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
                <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
                <Route path="/home" element={
                    <ProtectedUser>
                        <><Home /><BottomNav /></>
                    </ProtectedUser>
                } />
                <Route path="/saved" element={
                    <ProtectedUser>
                        <><Saved /><BottomNav /></>
                    </ProtectedUser>
                } />
                <Route path="/create-food" element={
                    <ProtectedFoodPartner>
                        <CreateFood />
                    </ProtectedFoodPartner>
                } />
                <Route path="/food-partner/uploads" element={
                    <ProtectedFoodPartner>
                        <MyUploads />
                    </ProtectedFoodPartner>
                } />
                <Route path="/food-partner/:id" element={<Profile />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes
