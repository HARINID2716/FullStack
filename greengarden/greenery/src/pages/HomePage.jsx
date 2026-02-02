import { useEffect, useState } from "react";
// import Vegetable from "../components/Vegetable"; // Not used in this component
import HeroSection from "../components/HeroSection";
import AdminMessagesView from "../components/AdminMessagesView";

const HomePage = () => {
    const [count, setCount] = useState(10);

    useEffect(() => {
        console.log("useEffect Executed");
        setCount(prevCount => prevCount + 1);
    }, []);

    const fetchData = async () => {

    };

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



