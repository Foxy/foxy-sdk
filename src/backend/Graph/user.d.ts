import type { Attributes } from './attributes';
import type { DefaultStore } from './default_store';
import type { Graph } from '../../core';
import type { Stores } from './stores';
import type { UserInvitations } from './user_invitations';

export interface User extends Graph {
  curie: 'fx:user';

  links: {
    /** This resource. */
    'self': User;
    /** List of stores this user has access to. */
    'fx:stores': Stores;
    /** List of custom attributes on this user resource. */
    'fx:attributes': Attributes;
    /** Default store for this user. */
    'fx:default_store': DefaultStore;
    /** List of user invitations for this store. */
    'fx:user_invitations': UserInvitations;
  };

  props: {
    /** The user's given name. */
    first_name: string;
    /** The user's surname. */
    last_name: string;
    /** The user's email address. This is used as the login to the FoxyCart admin for this user. */
    email: string;
    /** The user's phone number. */
    phone: string;
    /** This can only be set during user creation. Contact us if you need this value changed later. */
    affiliate_id: number;
    /** If this user is a programmer who writes server side code in languages like PHP, .NET, Python, Java, Ruby, etc */
    is_programmer: boolean;
    /** If this user is a front end developer who writes code in things like HTML, CSS, and maybe some JavaScript. */
    is_front_end_developer: boolean;
    /** If this user is a front end designer who works in wireframes, graphic designs, and user interfaces. */
    is_designer: boolean;
    /** If this user is a a merchant or store admin involved in the item and money side of the e-commerce business. */
    is_merchant: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
