import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
    return(
        <>
        <p>About HTML</p>
        <a href="/">
        <button>Go To Home Page</button>
        </a>

        <Link to ={"/"}>
        <button>Go To Home Page </button>
        </Link>
        </>
    );
};

export default AboutPage