import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const dataApi = createApi({
    reducerPath: 'dataApi',
    baseQuery: fetchBaseQuery({ baseUrl: './data' }),
    endpoints: builder => ({
        getDataByName: builder.query({
            query: name => `${name}.json`,
            transformResponse: response => {
                return {
                    resources: response.resources.rows,
                    events: response.events.rows,
                    timeRanges: response.timeRanges.rows
                };
            }
        })
    })
});

export const { useGetDataByNameQuery } = dataApi;
