import React from "react";
import { createRoot } from "react-dom/client";

import "../src/resources/scss/app.scss";
import {DockerContainerListPage, DockerImageListPage, DockerNetworkListPage, DockerVolumeListPage} from "./pages/docker";
import {BrowserRouter, Route} from "@k8s-cloud-io/react-router";
import {
    CacheInterface,
    GraphQLClient,
    GraphQLProvider
} from "@k8s-cloud-io/react-graphql";
import {Page} from "@core";

const Home = () => {
    return <Page>
        HOME
    </Page>
}

class NoopCache implements CacheInterface {
    get(_: string): any {
        return null;
    }

    has(_: string): boolean {
        return false;
    }

    put(_: string, _1: any): void {
    }
}

const client = new GraphQLClient({
    uri: "http://symfony.local/api",
    cache: new NoopCache()
})

const App = () => {
    return <GraphQLProvider client={client}>
        <BrowserRouter>
            <Route path={'/docker/images'} element={<DockerImageListPage />} />
            <Route path={'/docker/containers'} element={<DockerContainerListPage />} />
            <Route path={'/docker/networks'} element={<DockerNetworkListPage />} />
            <Route path={'/docker/volumes'} element={<DockerVolumeListPage />} />
            <Route path={'/'} element={<Home />} />
        </BrowserRouter>
    </GraphQLProvider>
}

const root = createRoot(document.getElementById('app-root'));
root.render(<App />);