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
import { Metadata, MetadataFromJSON } from './Metadata'
import { Votes, VotesFromJSON } from './Votes'
import { Playlists, PlaylistsFromJSON } from './Playlists'
import { Users, UsersFromJSON } from './Users'
/**
 *
 * @export
 * @interface Songs
 */
export interface Songs {
  /**
   * Note: This is a Primary Key.<pk/>
   * @type {number}
   * @memberof Songs
   */
  id?: number
  /**
   * Note: This is a Foreign Key to `playlists.id`.<fk table=\'playlists\' column=\'id\'/>
   * @type {number}
   * @memberof Songs
   */
  playlistId: number
  /**
   * Note: This is a Foreign Key to `metadata.id`.<fk table=\'metadata\' column=\'id\'/>
   * @type {number}
   * @memberof Songs
   */
  metadataId?: number
  /**
   * Note: This is a Foreign Key to `users.id`.<fk table=\'users\' column=\'id\'/>
   * @type {number}
   * @memberof Songs
   */
  userAdded: number
  /**
   *
   * @type {string}
   * @memberof Songs
   */
  dateAdded?: string

  metadata?: Metadata
  playlists?: Playlists
  votes?: Array<Votes>
  user?: Users
}

export function SongsFromJSON(json: any): Songs {
  return SongsFromJSONTyped(json, false)
}

export function SongsFromJSONTyped(json: any, ignoreDiscriminator: boolean): Songs {
  if (json === undefined || json === null) {
    return json
  }
  return {
    id: json['id'],
    playlistId: json['playlist_id'],
    metadataId: !exists(json, 'metadata_id') ? undefined : json['metadata_id'],
    userAdded: json['user_added'],
    dateAdded: !exists(json, 'date_added') ? undefined : json['date_added'],
    metadata: !exists(json, 'metadata') ? undefined : MetadataFromJSON(json['metadata']),
    playlists: !exists(json, 'playlists') ? undefined : PlaylistsFromJSON(json['playlists']),
    votes: !exists(json, 'votes') ? undefined : json['votes'].map((vote) => VotesFromJSON(vote)),
    user: !exists(json, 'user') ? undefined : UsersFromJSON(json['user']),
  }
}

export function SongsToJSON(value?: Songs | null): any {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  return {
    id: value.id,
    playlist_id: value.playlistId,
    metadata_id: value.metadataId,
    user_added: value.userAdded,
    date_added: value.dateAdded,
  }
}
