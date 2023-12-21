import { gql } from '@k8s-cloud-io/react-graphql';

export const CONTAINER_LIST = gql`
    query containers {
        containers {
            id
            names
            created
            image
            state
            ports {
                privatePort
                publicPort
                type
            }
            networkSettings
        }
    }
`;

export const IMAGE_LIST = gql`
    query images {
        images {
            id
            created
            repoTags
        }
    }
`;

export const NETWORK_LIST = gql`
    query networks {
        networks {
            name
            created
        }
    }
`;

export const VOLUME_LIST = gql`
    query volumes {
        volumes {
            name
            createdAt
        }
    }
`;
