import {createServiceApi} from "@/redux/api/baseApi";

type Workspace = {
    uuid: string,
    name: string,
}

export type Service = {
    uuid: string,
    name: string,
    gitUrl: string,
    branch: string,
    subdomain: string,
    type: string,
    status: boolean
}

type SubWorkspace = {
    uuid: string,
    name: string,
    workspace: string,
}

export type SpringProject = {
    name: string
    namespace: string
    git: string
    branch: string
    folder: string
    group: string
    dependencies: string[]
}

export type BuildNumber = {
    buildNumber: number
    status: string
}


type Repository = {
    id: number,
    name: string,
    description: string,
    http_url_to_repo: string,
    default_branch: string,

}

export type BuildAnalytic = {
    date: string,
    fail: number,
    success: number
}

type Database = {
    dbName: string,
    username: string,
    password: string,
    dbType: string,
    dbVersion: string,
    workspaceName: string,
    gitUrl: string,
    branch: string,
    status:boolean,
    subdomain: string,
    name: string,
}

const projectApi = createServiceApi('project')

export const projectsApi = projectApi.injectEndpoints({
    endpoints: (builder) => ({
        getWorkspaces: builder.query<Workspace[], void>({
            query: () => 'api/v1/workspace',
        }),

        createWorkspace: builder.mutation<Workspace, { name: string }>({
            query: ({ name }) => ({
                url: 'api/v1/workspace/create',
                method: 'POST',
                body: { name },
            }),
        }),


        getServiceDeployment: builder.query<Service[], { workspaceName: string,size: number,page:number }>({
            query: ({ workspaceName,size,page }) => `api/v1/deploy-service/${workspaceName}?size=${size}&page=${page}`,
        }),

        getServiceByName: builder.query<Service, { name: string }>({
            query: ({ name }) => `api/v1/deploy-service/get-service/${name}`,
        }),

        getBuildInfoByName: builder.query<BuildNumber, { name: string }>({
            query: ({ name }) => `api/v1/deploy-service/get-build-numbers/${name}`,
        }),

        createServiceDeployment: builder.mutation<Service, { name: string, gitUrl: string, branch:string,subdomain:string,workspaceName:string,token:string,type:string}>({
            query: ({ name,gitUrl,branch,subdomain,workspaceName,token,type }) => ({
                url: 'api/v1/deploy-service/create-service',
                method: 'POST',
                body: { name,gitUrl,branch,subdomain,workspaceName,token,type },
            }),
        }),

        deployZipService : builder.mutation<Service, { name: string, gitUrl: string, workspaceName:string,token:string,type:string,branch:string}>({
            query: ({ name,gitUrl,workspaceName,token,type,branch }) => ({
                url: 'api/v1/deploy-service/deploy-zip-service',
                method: 'POST',
                body: { name,gitUrl,workspaceName,token,type,branch },
            }),
        }),

        stopServiceDeployment: builder.mutation<Service, { name: string }>({
            query: ({ name }) => ({
                url: `api/v1/deploy-service/stop-service/${name}`,
                method: 'POST',
            }),
        }),

        deleteServiceDeployment: builder.mutation<void, {name:string}>({
            query: ({name}) => ({
                url: `api/v1/deploy-service/delete-service/${name}`,
                method: 'DELETE',
            }),
        }),

        startServiceDeployment: builder.mutation<Service, { name: string }>({
            query: ({ name }) => ({
                url: `api/v1/deploy-service/restart-service/${name}`,
                method: 'POST',
            }),
        }),

        buildService: builder.mutation<Service,{name:string}>({
            query: ({name}) => ({
                url: `api/v1/deploy-service/run-service/${name}`,
                method: 'POST',
            }),
        }),

        getBuildingLogs: builder.query<Service, { jobName: string,buildNumber:number }>({
            query: ({ jobName,buildNumber }) => `api/v1/deploy-service/stream-logs/${jobName}/${buildNumber}`,
        }),

        updateWorkspace: builder.mutation<Workspace, { uuid: string, name: string }>({
            query: ({ uuid, name }) => ({
                url: `api/v1/workspaces/${uuid}`,
                method: 'PATCH',
                body: { name },
            }),
        }),

        deleteWorkspace: builder.mutation<void, { uuid: string }>({
            query: ({ uuid }) => ({
                url: `api/v1/workspaces/${uuid}`,
                method: 'DELETE',
            }),
        }),

        createSubWorkspace: builder.mutation<SubWorkspace, { name: string, workspaceName: string }>({
            query: ({ name, workspaceName }) => ({
                url: 'api/v1/sub-workspace/create',
                method: 'POST',
                body: { name, workspaceName },
            }),
        }),

        getSubWorkspaces: builder.query<Service[], { workspaceName: string,size: number,page:number }>({
            query: ({ workspaceName,size,page }) => `api/v1/sub-workspace/${workspaceName}?size=${size}&page=${page}`,
        }),

        deleteSubWorkSpace:builder.mutation<void, {name:string}>({
            query: ({name}) => ({
                url: `api/v1/sub-workspace/delete/${name}`,
                method: 'DELETE',
            }),
        }),

        createProject: builder.mutation<SpringProject, { name: string, group: string, folder: string, dependencies: string[],servicesNames:string[] }>({
            query: ({ name, group, folder, dependencies,servicesNames }) => ({
                url: '/api/v1/spring/create-service',
                method: 'POST',
                body: { name, group, folder,servicesNames, dependencies },
            }),
        }),

        getMetadata: builder.query<string, void>({
            query: () => 'api/v1/dependency/metadata', // Matches the backend endpoint path
        }),

        getProjectByName: builder.query<SpringProject, { name: string }>({
            query: ({ name }) => `api/v1/spring/project/${name}`,
        }),

        getProjects: builder.query<Service[], { subWorkspace: string,size: number,page:number }>({
            query: ({ subWorkspace,size,page }) => `api/v1/spring/${subWorkspace}?size=${size}&page=${page}`,
        }),

        getBuildNumberInFolder : builder.query<BuildNumber, { folder: string,name:string }>({
            query: ({ folder,name }) => `api/v1/spring/get-build-numbers/${folder}/${name}`,
        }),

        buildSpringService: builder.mutation<void, { folder: string, name: string, serviceName: string[] }>({
            query: ({ folder, name, serviceName }) => ({
                url: `api/v1/spring/start-build/${folder}/${name}`,
                method: 'POST',
                params: { serviceName },
            }),
        }),

        getTest: builder.mutation<string, { name: string }>({
            query: ({ name }) => ({
                url: `/api/v1/deploy-service/test/${name}`, // Ensure the `/test` route matches the backend
                method: 'POST', // Use POST as defined in the backend
            }),
        }),

        deleteSpringProject: builder.mutation<void, { folder: string, name: string }>({
            query: ({ folder, name }) => ({
                url: `api/v1/spring/delete-service/${folder}/${name}`,
                method: 'DELETE',
            }),
        }),

        getRepository: builder.query<Repository, void>({
            query: () => 'api/v1/gitlab/projects',
        }),

        createGitlabService: builder.mutation<Repository,{name:string,branch:string,workspaceName:string,token:string}>({
            query: ({name,branch,workspaceName,token}) => ({
                url: 'api/v1/deploy-service/deploy-gitlab-service',
                method: 'POST',
                body: {name,branch,workspaceName,token},
            }),
        }),

        createExistingProject: builder.mutation<SpringProject,{name: string, folder: string, servicesNames:string[]}>({
            query: ({ name, folder,servicesNames }) => ({
                url: '/api/v1/spring/create-existing-service',
                method: 'POST',
                body: { name, folder,servicesNames },
            }),
        }),

        updateExistingService: builder.mutation<SpringProject,{name: string, folder: string, servicesNames:string[]}>({
            query: ({ name, folder,servicesNames }) => ({
                url: '/api/v1/spring/update-service',
                method: 'PUT',
                body: { name, folder,servicesNames },
            }),
        }),

        deploySpringService: builder.mutation<SpringProject,{name:string,folder:string}>({
            query: ({ name, folder }) => ({
                url: `/api/v1/spring/build-service/${folder}/${name}`,
                method: 'POST'
            }),
        }),

        countWorkspace: builder.query<number, void>({
            query: () => 'api/v1/workspace/count-workspaces',
        }),

        countSubworkspaces: builder.query<SubWorkspace, {name:string}>({
            query: ({name}) => `api/v1/sub-workspace/count-sub/${name}`,
        }),

        countService: builder.query<SubWorkspace, {name:string}>({
            query: ({name}) => `api/v1/deploy-service/count-deploy-service/${name}`,
        }),

        getBuildAnalytic: builder.query<BuildAnalytic, void>({
            query: () => 'api/v1/deploy-service/get-build-analytics',
        }),

        createDatabase: builder.mutation<void, { dbName: string, dbUser: string, dbPassword: string,dbType:string,dbVersion:string, workspaceName: string }>({
            query: ({ dbName, dbUser, dbPassword,dbType,dbVersion, workspaceName }) => ({
                url: 'api/v1/database/deploy-database',
                method: 'POST',
                body: { dbName, dbUser, dbPassword,dbType,dbVersion, workspaceName },
            }),
        }),

        getDatabaseServices: builder.query<Database[], { workspaceName: string,size: number,page:number }>({
            query: ({ workspaceName,size,page }) => `api/v1/database/${workspaceName}?size=${size}&page=${page}`,
        }),


        rollbackService: builder.mutation<void , {branch:string,repo:string,domain:string,tag:string,namespace:string}>({
            query: ({branch,repo,domain,tag,namespace}) => ({
                url: 'api/v1/deploy-service/rollback-service',
                method: 'POST',
                body: {branch,repo,domain,tag,namespace},
            }),
        }),

        createRepository: builder.mutation<void, { name: string }>({
            query: ({ name }) => ({
                url: 'api/v1/gitlab/create-repository',
                method: 'POST',
                body: { name },
            }),
        }),


    }),
})


export const { useGetWorkspacesQuery, useCreateWorkspaceMutation, useUpdateWorkspaceMutation, useDeleteWorkspaceMutation,useCreateServiceDeploymentMutation ,useGetServiceDeploymentQuery,useGetServiceByNameQuery,useGetBuildInfoByNameQuery,useGetBuildingLogsQuery,useBuildServiceMutation,useCreateSubWorkspaceMutation,useGetSubWorkspacesQuery,useCreateProjectMutation,useGetProjectsQuery,useGetBuildNumberInFolderQuery,useBuildSpringServiceMutation,useGetProjectByNameQuery,useStopServiceDeploymentMutation,useStartServiceDeploymentMutation,useDeployZipServiceMutation,useDeleteServiceDeploymentMutation,useDeleteSubWorkSpaceMutation,useGetTestMutation,useGetMetadataQuery,useDeleteSpringProjectMutation,useGetRepositoryQuery,useCreateGitlabServiceMutation,useCreateExistingProjectMutation,useUpdateExistingServiceMutation,useDeploySpringServiceMutation,useCountWorkspaceQuery,
useCountSubworkspacesQuery,useCountServiceQuery,useGetBuildAnalyticQuery,useCreateDatabaseMutation,useGetDatabaseServicesQuery,useRollbackServiceMutation,useCreateRepositoryMutation} = projectsApi
