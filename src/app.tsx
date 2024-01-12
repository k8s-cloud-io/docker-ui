import React from "react";
import { createRoot } from "react-dom/client";

import "../src/resources/scss/app.scss";
import {
    DockerContainerListPage,
    DockerImageListPage,
    DockerNetworkCreatePage,
    DockerNetworkListPage,
    DockerVolumeCreatePage,
    DockerVolumeListPage
} from "./pages/docker";
import {BrowserRouter, Route} from "@k8s-cloud-io/react-router";
import {
    CacheInterface,
    GraphQLClient,
    GraphQLProvider
} from "@k8s-cloud-io/react-graphql";
import {Page} from "@core";
import {Alert, AlertHeading} from "react-bootstrap";

const Home = () => {
    return <Page>
        HOME
    </Page>
}

const NotFound = () => {
    return <Page>
        <Alert variant={'danger'} className={'p-2 m-3'}>
            <AlertHeading className={'h6'}>Error - 404</AlertHeading>
            The requested url {window.location.pathname} could not be found
        </Alert>
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
            <Route path={'/docker/networks/create'} element={<DockerNetworkCreatePage />} />
            <Route path={'/docker/networks'} element={<DockerNetworkListPage />} />
            <Route path={'/docker/volumes/create'} element={<DockerVolumeCreatePage />} />
            <Route path={'/docker/volumes'} element={<DockerVolumeListPage />} />
            <Route path={'/'} element={<Home />} />
            <Route path={'*'} element={<NotFound />} />
        </BrowserRouter>
    </GraphQLProvider>
}

const root = createRoot(document.getElementById('app-root'));
root.render(<App />);