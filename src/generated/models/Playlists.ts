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

import { exists } from '../runtime'
/**
 *
 * @export
 * @interface Playlists
 */
export interface Playlists {
  /**
   * Note: This is a Primary Key.<pk/>
   * @type {number}
   * @memberof Playlists
   */
  id: number
  /**
   *
   * @type {string}
   * @memberof Playlists
   */
  name: string
  /**
   * Note: This is a Foreign Key to `users.id`.<fk table=\'users\' column=\'id\'/>
   * @type {number}
   * @memberof Playlists
   */
  userAdded?: number
  /**
   *
   * @type {string}
   * @memberof Playlists
   */
  dateAdded?: string
}

export function PlaylistsFromJSON(json: any): Playlists {
  return PlaylistsFromJSONTyped(json, false)
}

export function PlaylistsFromJSONTyped(json: any, ignoreDiscriminator: boolean): Playlists {
  if (json === undefined || json === null) {
    return json
  }
  return {
    id: json['id'],
    name: json['name'],
    userAdded: !exists(json, 'user_added') ? undefined : json['user_added'],
    dateAdded: !exists(json, 'date_added') ? undefined : json['date_added'],
  }
}

export function PlaylistsToJSON(value?: Playlists | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    id: value.id,
    name: value.name,
    user_added: value.userAdded,
    date_added: value.dateAdded,
  }
}