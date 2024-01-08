import React, {PropsWithChildren} from "react";
import {Container, usePageTitle} from "@core";
import {DockerNavigation} from ".";

export const DockerPage = (props: PropsWithChildren & {pageTitle: string, backLink?: string}) => {
    const ctx = usePageTitle();
    ctx.setPageTitle(props.pageTitle);
    ctx.setBackLink(props.backLink);

    return <Container fluid className={'row m-0 mt-2 p-0'}>
        <DockerNavigation />
        <Container className={'col flex-column m-0'}>{props.children}</Container>
    </Container>
}