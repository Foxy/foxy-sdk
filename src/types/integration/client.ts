import type { FxAttributes } from "./attributes";

export interface FxClient {
  curie: "fx:client";

  links: {
    /** This resource. */
    "self": FxClient;
    /** Custom attributes of this client. */
    "fx:attributes": FxAttributes;
  };

  props: {
    /** A unique identifier for this client. If you do not supply one, one will be automatically generated for you. If you're not hosting the client integration yourself, please use a known prefix when creating your clients. This can not be modified once it is created. */
    client_id: string;
    /** The password to be used with this client_id for OAuth 2.0 integration. This is generated automatically and can't be changed. */
    client_secret: string;
    /** This is the redirection endpoint as described by {@link http://tools.ietf.org/html/rfc6749#section-3.1.2 OAuth 2.0} */
    redirect_uri: string;
    /** The name of this project which will be using the API. This should be specific to the installation and implementation of this client. This information will be displayed on your OAuth 2.0 authentication page. */
    project_name: string;
    /** A description of this project. This information will be displayed on your OAuth 2.0 authentication page. */
    project_description: string;
    /** The name of the company responsible for this project. This information will be displayed on your OAuth 2.0 authentication page. */
    company_name: string;
    /** The name of the company responsible for this project. This information will be displayed on your OAuth 2.0 authentication page. */
    company_url: string;
    /** An image url for this company. This information will be displayed on your OAuth 2.0 authentication page. */
    company_logo: string;
    /** The individual responsible for this integration. */
    contact_name: string;
    /** The email address of the individual responsible for this integration. */
    contact_email: string;
    /** The phone number of the individual responsible for this integration. */
    contact_phone: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
