import React, { useEffect } from "react";
// import Vegetable from "../components/Vegetable"; // Not used in this component
import HeroSection from "../components/HeroSection";
import AdminMessagesView from "../components/AdminMessagesView";

const HomePage = () => {
    useEffect(() => {
        console.log("useEffect Executed");
    }, []);

    return (
        <>
            <HeroSection />
            <div className="container mx-auto px-4 py-8">
                <AdminMessagesView />
            </div>
        </>
    );
};

export default HomePage



