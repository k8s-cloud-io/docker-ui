import React, {
    PropsWithChildren,
    createContext,
    memo,
    useContext,
    useState,
} from 'react';

export const PageTitleContext = createContext<{
    pageTitle: string | null;
    setPageTitle: (title: string) => void;
}>(undefined);

export const PageTitleContextProvider = (props: PropsWithChildren) => {
    const [pageTitle, setPageTitle] = useState(undefined);
    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
            {props.children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitle = () => {
    return useContext(PageTitleContext);
};

export const PageTitle = memo(() => {
    const ctx = usePageTitle();
    return <h5 className={'page-title'}>{ctx.pageTitle}</h5>;
});
