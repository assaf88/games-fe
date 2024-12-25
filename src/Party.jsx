// import React from "react";
import { useParams } from "react-router-dom";

const Party = () => {
    const { id } = useParams(); // Gets the party ID from the URL
    return <h1>Welcome to Party {id}</h1>;
};

export default Party;
