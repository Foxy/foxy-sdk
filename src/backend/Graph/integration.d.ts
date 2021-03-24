import type { Client } from './client';
import type { Graph } from '../../core';
import type { Store } from './store';
import type { User } from './user';

export interface Integration extends Graph {
  curie: 'fx:integration';

  links: {
    /** This resource. */
    'self': Integration;
    /** Admin user who created this integration. */
    'fx:user': User;
    /** Store this integration is assigned to. */
    'fx:store': Store;
    /** API client details. */
    'fx:client': Client;
  };

  props: {
    /** A full API URI of the user resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    user_uri: string;
    /** A unique identifier for this client. Maps to the client_id of the {@link https://api.foxycart.com/rels/client client} resource. */
    client_id: string;
    /** The OAuth scope granted to this integration. */
    scope: string;
    /** When this OAuth refresh token expires. */
    expires: number;
    /** Maps to the project_name of the {@link https://api.foxycart.com/rels/client client} resource. */
    project_name: string;
    /** Maps to the project_description of the {@link https://api.foxycart.com/rels/client client} resource. */
    project_description: string;
    /** Maps to the company_name of the {@link https://api.foxycart.com/rels/client client} resource. */
    company_name: string;
    /** Maps to the company_url of the {@link https://api.foxycart.com/rels/client client} resource. */
    company_url: string;
    /** Maps to the company_logo of the {@link https://api.foxycart.com/rels/client client} resource. */
    company_logo: string;
    /** Maps to the contact_name of the {@link https://api.foxycart.com/rels/client client} resource. */
    contact_name: string;
    /** Maps to the contact_email of the {@link https://api.foxycart.com/rels/client client} resource. */
    contact_email: string;
    /** Maps to the first_name and last_name of the {@link https://api.foxycart.com/rels/user user} resource. */
    added_by_name: string;
    /** Maps to the email of the {@link https://api.foxycart.com/rels/user user} resource. */
    added_by_email: string;
  };
}
