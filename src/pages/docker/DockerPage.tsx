import React, {PropsWithChildren} from "react";
import {usePageTitle} from "@core";
import {Container} from "@k8s-cloud-io/react-bootstrap";
import {DockerNavigation} from ".";

export const DockerPage = (props: PropsWithChildren & {pageTitle: string}) => {
    const ctx = usePageTitle();
    ctx.setPageTitle(props.pageTitle);

    return <Container fluid className={'row m-0 mt-2 p-0'}>
        <DockerNavigation />
        <Container className={'col flex-column m-0'}>{props.children}</Container>
    </Container>
}