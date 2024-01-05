import { gql } from '@k8s-cloud-io/react-graphql';

export const VOLUME_PRUNE = gql`
    mutation cleanVolumes {
        cleanVolumes
    }
`;

export const NETWORK_PRUNE = gql`
    mutation cleanNetworks {
        cleanNetworks
    }
`;

export const NETWORK_CREATE = gql`
    mutation createNetwork($name: String!, $driver: String!) {
        createNetwork(name: $name, driver: $driver)
    }
`;

export const NETWORK_DELETE = gql`
    mutation removeNetworks($networks: [String!]!) {
        removeNetworks(networks: $networks)
    }
`;

export const IMAGE_DELETE = gql`
    mutation removeImages($images: [String!]!) {
        removeImages(images: $images)
    }
`;

export const CONTAINER_DELETE = gql`
    mutation removeContainers($containers: [String!]!) {
        removeContainers(containers: $containers)
    }
`;

export const VOLUME_DELETE = gql`
    mutation removeVolumes($volumes: [String!]!) {
        removeVolumes(volumes: $volumes)
    }
`;

export const IMAGE_PRUNE = gql`
    mutation cleanImages {
        cleanImages
    }
`;

/*************************************************************************************************/

export const CONTAINER_START = gql`
    mutation startContainer($id: String!) {
        startContainer(id: $id)
    }
`;
export const CONTAINER_STOP = gql`
    mutation stopContainer($id: String!) {
        stopContainer(id: $id)
    }
`;
export const CONTAINER_RESTART = gql`
    mutation restartContainer($id: String!) {
        restartContainer(id: $id)
    }
`;

export const CONTAINER_PRUNE = gql`
    mutation cleanContainers {
        cleanContainers
    }
`;
