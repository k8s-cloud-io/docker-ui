import React, {
    PropsWithChildren,
    createContext,
    memo,
    useContext,
    useState,
} from 'react';
import {useNavigate} from "@k8s-cloud-io/react-router";

export const PageTitleContext = createContext<{
    pageTitle: string | null;
    backLink: string | null;
    setPageTitle: (title: string) => void;
    setBackLink: (link: string) => void;
}>(undefined);

export const PageTitleContextProvider = (props: PropsWithChildren) => {
    const [pageTitle, setPageTitle] = useState(undefined);
    const [backLink, setBackLink] = useState(undefined);
    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle, backLink, setBackLink }}>
            {props.children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitle = () => {
    return useContext(PageTitleContext);
};

export const PageTitle = memo(() => {
    const ctx = usePageTitle();
    if( !ctx.pageTitle ) return null;

    const navigate = useNavigate();
    if( ctx.backLink ) {
        return <h5 className={'page-title'}>
            <span className={'material-icons-outlined cursor-pointer fs-4 me-2'} onClick={() => {
                navigate(ctx.backLink)
            }}>arrow_back</span>
            <span>{ctx.pageTitle}</span>
        </h5>;
    }
    return <h5 className={'page-title'}>
        <span>{ctx.pageTitle}</span>
    </h5>;
});
