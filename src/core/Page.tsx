import { Container, Navbar, PageTitleContextProvider } from '.';
import { PageTitle } from './PageTitle';
import { NavLink } from '@k8s-cloud-io/react-router';
import React, { PropsWithChildren } from 'react';

export const Page = (props: PropsWithChildren) => {
    console.log('render whole page');
    return (
        <div className={'page'}>
            <Navbar fixed={'top'} className={'bg-primary'}>
                <NavLink to={'/'} className={'navbar-brand text-white'}>
                    DockerUI
                </NavLink>
            </Navbar>
            <Container fluid className={'page-container'}>
                <PageTitleContextProvider>
                    <PageTitle />
                    {props.children}
                </PageTitleContextProvider>
            </Container>
        </div>
    );
};
