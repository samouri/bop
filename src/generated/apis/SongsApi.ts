/* tslint:disable */
/* eslint-disable */
/**
 * PostgREST API
 * standard public schema
 *
 * The version of the OpenAPI document: 7.0.0 (2b61a63)
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import {
    Songs,
    SongsFromJSON,
    SongsToJSON,
} from '../models';

export interface SongsDeleteRequest {
    id?: number;
    playlistId?: number;
    metadataId?: number;
    userAdded?: number;
    dateAdded?: string;
    prefer?: SongsDeletePreferEnum;
}

export interface SongsGetRequest {
    id?: number;
    playlistId?: number;
    metadataId?: number;
    userAdded?: number;
    dateAdded?: string;
    select?: string;
    order?: string;
    range?: string;
    rangeUnit?: string;
    offset?: string;
    limit?: string;
    prefer?: SongsGetPreferEnum;
}

export interface SongsPatchRequest {
    id?: number;
    playlistId?: number;
    metadataId?: number;
    userAdded?: number;
    dateAdded?: string;
    prefer?: SongsPatchPreferEnum;
    songs?: Songs;
}

export interface SongsPostRequest {
    select?: string;
    prefer?: SongsPostPreferEnum;
    songs?: Songs;
}

/**
 * no description
 */
export class SongsApi extends runtime.BaseAPI {

    /**
     */
    async songsDeleteRaw(requestParameters: SongsDeleteRequest): Promise<runtime.ApiResponse<void>> {
        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.id !== undefined) {
            queryParameters['id'] = requestParameters.id;
        }

        if (requestParameters.playlistId !== undefined) {
            queryParameters['playlist_id'] = requestParameters.playlistId;
        }

        if (requestParameters.metadataId !== undefined) {
            queryParameters['metadata_id'] = requestParameters.metadataId;
        }

        if (requestParameters.userAdded !== undefined) {
            queryParameters['user_added'] = requestParameters.userAdded;
        }

        if (requestParameters.dateAdded !== undefined) {
            queryParameters['date_added'] = requestParameters.dateAdded;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters.prefer !== undefined && requestParameters.prefer !== null) {
            headerParameters['Prefer'] = String(requestParameters.prefer);
        }

        const response = await this.request({
            path: `/songs`,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async songsDelete(requestParameters: SongsDeleteRequest): Promise<void> {
        await this.songsDeleteRaw(requestParameters);
    }

    /**
     */
    async songsGetRaw(requestParameters: SongsGetRequest): Promise<runtime.ApiResponse<Array<Songs>>> {
        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.id !== undefined) {
            queryParameters['id'] = requestParameters.id;
        }

        if (requestParameters.playlistId !== undefined) {
            queryParameters['playlist_id'] = requestParameters.playlistId;
        }

        if (requestParameters.metadataId !== undefined) {
            queryParameters['metadata_id'] = requestParameters.metadataId;
        }

        if (requestParameters.userAdded !== undefined) {
            queryParameters['user_added'] = requestParameters.userAdded;
        }

        if (requestParameters.dateAdded !== undefined) {
            queryParameters['date_added'] = requestParameters.dateAdded;
        }

        if (requestParameters.select !== undefined) {
            queryParameters['select'] = requestParameters.select;
        }

        if (requestParameters.order !== undefined) {
            queryParameters['order'] = requestParameters.order;
        }

        if (requestParameters.offset !== undefined) {
            queryParameters['offset'] = requestParameters.offset;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters.range !== undefined && requestParameters.range !== null) {
            headerParameters['Range'] = String(requestParameters.range);
        }

        if (requestParameters.rangeUnit !== undefined && requestParameters.rangeUnit !== null) {
            headerParameters['Range-Unit'] = String(requestParameters.rangeUnit);
        }

        if (requestParameters.prefer !== undefined && requestParameters.prefer !== null) {
            headerParameters['Prefer'] = String(requestParameters.prefer);
        }

        const response = await this.request({
            path: `/songs`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(SongsFromJSON));
    }

    /**
     */
    async songsGet(requestParameters: SongsGetRequest): Promise<Array<Songs>> {
        const response = await this.songsGetRaw(requestParameters);
        return await response.value();
    }

    /**
     */
    async songsPatchRaw(requestParameters: SongsPatchRequest): Promise<runtime.ApiResponse<void>> {
        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.id !== undefined) {
            queryParameters['id'] = requestParameters.id;
        }

        if (requestParameters.playlistId !== undefined) {
            queryParameters['playlist_id'] = requestParameters.playlistId;
        }

        if (requestParameters.metadataId !== undefined) {
            queryParameters['metadata_id'] = requestParameters.metadataId;
        }

        if (requestParameters.userAdded !== undefined) {
            queryParameters['user_added'] = requestParameters.userAdded;
        }

        if (requestParameters.dateAdded !== undefined) {
            queryParameters['date_added'] = requestParameters.dateAdded;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters.prefer !== undefined && requestParameters.prefer !== null) {
            headerParameters['Prefer'] = String(requestParameters.prefer);
        }

        const response = await this.request({
            path: `/songs`,
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: SongsToJSON(requestParameters.songs),
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async songsPatch(requestParameters: SongsPatchRequest): Promise<void> {
        await this.songsPatchRaw(requestParameters);
    }

    /**
     */
    async songsPostRaw(requestParameters: SongsPostRequest): Promise<runtime.ApiResponse<void>> {
        const queryParameters: runtime.HTTPQuery = {};

        if (requestParameters.select !== undefined) {
            queryParameters['select'] = requestParameters.select;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (requestParameters.prefer !== undefined && requestParameters.prefer !== null) {
            headerParameters['Prefer'] = String(requestParameters.prefer);
        }

        const response = await this.request({
            path: `/songs`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: SongsToJSON(requestParameters.songs),
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async songsPost(requestParameters: SongsPostRequest): Promise<void> {
        await this.songsPostRaw(requestParameters);
    }

}

/**
    * @export
    * @enum {string}
    */
export enum SongsDeletePreferEnum {
    Representation = 'return=representation',
    Minimal = 'return=minimal',
    None = 'return=none'
}
/**
    * @export
    * @enum {string}
    */
export enum SongsGetPreferEnum {
    Countnone = 'count=none'
}
/**
    * @export
    * @enum {string}
    */
export enum SongsPatchPreferEnum {
    Representation = 'return=representation',
    Minimal = 'return=minimal',
    None = 'return=none'
}
/**
    * @export
    * @enum {string}
    */
export enum SongsPostPreferEnum {
    Representation = 'return=representation',
    Minimal = 'return=minimal',
    None = 'return=none'
}