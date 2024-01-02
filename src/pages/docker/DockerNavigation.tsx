import React from "react";
import {NavLink} from "@k8s-cloud-io/react-router";

export const DockerNavigation = () => {
    return <ul className="page-navigation">
        <li>
            <NavLink to="/">Home</NavLink>
        </li>
        <li>
            <NavLink to="/docker/images">Images</NavLink>
        </li>
        <li>
            <NavLink to="/docker/containers">Containers</NavLink>
        </li>
        <li>
            <NavLink to="/docker/networks">Networks</NavLink>
        </li>
        <li>
            <NavLink to="/docker/volumes">Volumes</NavLink>
        </li>
    </ul>
}