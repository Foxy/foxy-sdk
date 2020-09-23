export interface Props {
  "fx:create_client": {
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

  "fx:client": {
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

  "fx:create_user": {
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
    is_programmer: string;
    /** If this user is a front end developer who writes code in things like HTML, CSS, and maybe some JavaScript. */
    is_front_end_developer: string;
    /** If this user is a front end designer who works in wireframes, graphic designs, and user interfaces. */
    is_designer: string;
    /** If this user is a a merchant or store admin involved in the item and money side of the e-commerce business. */
    is_merchant: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:user": {
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
    is_programmer: string;
    /** If this user is a front end developer who writes code in things like HTML, CSS, and maybe some JavaScript. */
    is_front_end_developer: string;
    /** If this user is a front end designer who works in wireframes, graphic designs, and user interfaces. */
    is_designer: string;
    /** If this user is a a merchant or store admin involved in the item and money side of the e-commerce business. */
    is_merchant: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:attribute": {
    /** Controls who can see this attribute. Public attributes can be shown to anyone, including customers. Private attributes are more suitable for configuration or technical details which are irrelevant to the public. Restricted attributes can only be viewed by the OAuth client who creates them. */
    visibility: string;
    /** The name of this attribute. */
    name: string;
    /** The value of this attribute. */
    value: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:default_store": {
    /** This is the store version for this store. For more details about this version, see the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/store_versions store_versions} property helpers which include changelog information. */
    store_version_uri: string;
    /** The name of your store as you'd like it displayed to your customers and our system. */
    store_name: string;
    /** This is a unique FoxyCart subdomain for your cart, checkout, and receipt. If you install a custom SSL certificate, this will contain a full domain such as store.yourdomain.com. */
    store_domain: string;
    /** Set to true when you plan to use a custom SSL certificate. If set to true, your store_domain must be a full domain. */
    use_remote_domain: string;
    /** The URL of your online store. */
    store_url: string;
    /** By default, FoxyCart sends customers back to the page referrer after completing a purchase. Instead, you can set a specific URL here. */
    receipt_continue_url: string;
    /** This is the email address of your store. By default, this will be the from address for your store receipts. If you specify a from_email, you can also put in multiple email addresses here, separated by a comma to be used when bcc_on_receipt_email is true. */
    store_email: string;
    /** Used for when you want to specify a different from email than your store's email address or when your store_email has a list of email addresses. */
    from_email: string;
    /** Set this to true if you would like each receipt sent to your customer to also be blind carbon copied to your store's email address. */
    bcc_on_receipt_email: string;
    /** Set this to true if you have set up your DNS settings to include and spf record for FoxyCart. See the {@link http://wiki.foxycart.com/v/1.1/emails FoxyCart documentation} for more details. */
    use_email_dns: string;
    /** If you'd like to configure your own SMTP server for sending transaction receipt emails, you can do so here. The JSON supports the following fields: `username`,`password`,`host`,`port`,`security`. The security value can be blank, `ssl`, or `tls` */
    smtp_config: string;
    /** The postal code of your store. This will be used for calculating shipping costs if you sell shippable items. */
    postal_code: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. This will be used for calculating shipping costs if you sell shippable items. */
    region: string;
    /** Two character ISO 3166-1-alpha-2 code for the country your store is located in. This will be used for calculating shipping costs if you sell shippable items. */
    country: string;
    /** The locale code for your Store's locale. This will be used to format strings for your store. */
    locale_code: string;
    /** Set to true to prevent the currency symbol from being displayed (example: a points based checkout system). */
    hide_currency_symbol: string;
    /** Set to true to prevent the decimal characters from being displayed (example: a points based checkout system). */
    hide_decimal_characters: string;
    /** Set true to use the international currency symbol such as USD instead of the regional one like $. */
    use_international_currency_symbol: string;
    /** The default language for your store's cart, checkout, and receipt strings. */
    language: string;
    /** A url to your store's logo which may be used in your store's templates. */
    logo_url: string;
    /** The preferred configuration of your customer checkout experience, such as defaulting to guest checkout or requiring account creation with each checkout. */
    checkout_type: string;
    /** Set this to true to POST encrypted XML of your order to the webhook url of your choice. */
    use_webhook: string;
    /** This is the url of the webhook endpoint for processing your store's webhook. See the {@link http://wiki.foxycart.com/static/redirect/webhook FoxyCart documentation} for more details. */
    webhook_url: string;
    /** This is the key used to encrypt your webhook data. It is also used as the legacy API key and the HMAC cart encryption key. */
    webhook_key: string;
    /** Set to true to use HMAC cart validation for your store. */
    use_cart_validation: string;
    /** Set this to true to redirect to your server before checkout so you can use our single sign on feature and log in your users automatically to FoxyCart or if you want to validate items before checkout. */
    use_single_sign_on: string;
    /** This is your single sign on url to redirect your users to prior to hitting the checkout page.  See the {@link http://wiki.foxycart.com/static/redirect/sso FoxyCart documentation} for more details. */
    single_sign_on_url: string;
    /** When saving a customer to FoxyCart, this is the password hashing method that will be used. */
    customer_password_hash_type: string;
    /** Configuration settings for the customer_password_hash_type in use. See the {@link http://wiki.foxycart.com/static/redirect/customers FoxyCart documentation} for more details. */
    customer_password_hash_config: string;
    /** Set to true to turn on FoxyCart's multiship functionality for shipping items to multiple locations in a single order. See the {@link http://wiki.foxycart.com/static/redirect/multiship FoxyCart documentation} for more details. */
    features_multiship: string;
    /** Set to true to require all front-end add-to-cart interactions have a valid `expires` property. */
    products_require_expires_property: string;
    /** If your store sells products which collect personal or sensitive information as product attributes, you may want to consider lowering your cart session lifespan. You can leave it as 0 to keep the default which is currently 43200 seconds (12 hours). The maximum allowed time is currently 259200 seconds (72 hours). */
    app_session_time: number;
    /** Used for determining the type of the customer address used when calculating shipping costs. */
    shipping_address_type: string;
    /** Shipping rate signing ensures that the rate the customer selects is carried through and not altered in any way. If you're intending to make use of javascript snippets on your store to alter the price or label of shipping rates or add custom rates dynamically, disable this setting as it will block those rates from being applied. The default is false. */
    require_signed_shipping_rates: string;
    /** The timezone of your store. This will impact how dates are shown to customers and within the FoxyCart admin. */
    timezone: string;
    /** Set a master password here if you would like to be able to check out as your customers without having to know their password. */
    unified_order_entry_password: string;
    /** Instead of displaying the Foxy Transaction ID, you can display your own custom display ID on your store's receipt and receipt emails. This JSON config determines how those display ids will work. The JSON supports the following fields: `enabled`, `start`, `length`, `prefix`, `suffix`. */
    custom_display_id_config: string;
    /** This can only be set during store creation. Contact us if you need this value changed later. */
    affiliate_id: number;
    /** This settings makes your checkout page completely non-functioning. Your customers will see the maintenance notification language string instead. The default is false. */
    is_maintenance_mode: string;
    /** If this store is in development or if it has an active FoxyCart subscription and can therefore use a live payment gateway to process live transactions. */
    is_active: string;
    /** The date of the first payment for this FoxyCart store subscription. This can be considered the go live date for this store. */
    first_payment_date: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:store": {
    /** This is the store version for this store. For more details about this version, see the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/store_versions store_versions} property helpers which include changelog information. */
    store_version_uri: string;
    /** The name of your store as you'd like it displayed to your customers and our system. */
    store_name: string;
    /** This is a unique FoxyCart subdomain for your cart, checkout, and receipt. If you install a custom SSL certificate, this will contain a full domain such as store.yourdomain.com. */
    store_domain: string;
    /** Set to true when you plan to use a custom SSL certificate. If set to true, your store_domain must be a full domain. */
    use_remote_domain: string;
    /** The URL of your online store. */
    store_url: string;
    /** By default, FoxyCart sends customers back to the page referrer after completing a purchase. Instead, you can set a specific URL here. */
    receipt_continue_url: string;
    /** This is the email address of your store. By default, this will be the from address for your store receipts. If you specify a from_email, you can also put in multiple email addresses here, separated by a comma to be used when bcc_on_receipt_email is true. */
    store_email: string;
    /** Used for when you want to specify a different from email than your store's email address or when your store_email has a list of email addresses. */
    from_email: string;
    /** Set this to true if you would like each receipt sent to your customer to also be blind carbon copied to your store's email address. */
    bcc_on_receipt_email: string;
    /** Set this to true if you have set up your DNS settings to include and spf record for FoxyCart. See the {@link http://wiki.foxycart.com/v/1.1/emails FoxyCart documentation} for more details. */
    use_email_dns: string;
    /** If you'd like to configure your own SMTP server for sending transaction receipt emails, you can do so here. The JSON supports the following fields: `username`,`password`,`host`,`port`,`security`. The security value can be blank, `ssl`, or `tls` */
    smtp_config: string;
    /** The postal code of your store. This will be used for calculating shipping costs if you sell shippable items. */
    postal_code: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. This will be used for calculating shipping costs if you sell shippable items. */
    region: string;
    /** Two character ISO 3166-1-alpha-2 code for the country your store is located in. This will be used for calculating shipping costs if you sell shippable items. */
    country: string;
    /** The locale code for your Store's locale. This will be used to format strings for your store. */
    locale_code: string;
    /** Set to true to prevent the currency symbol from being displayed (example: a points based checkout system). */
    hide_currency_symbol: string;
    /** Set to true to prevent the decimal characters from being displayed (example: a points based checkout system). */
    hide_decimal_characters: string;
    /** Set true to use the international currency symbol such as USD instead of the regional one like $. */
    use_international_currency_symbol: string;
    /** The default language for your store's cart, checkout, and receipt strings. */
    language: string;
    /** A url to your store's logo which may be used in your store's templates. */
    logo_url: string;
    /** The preferred configuration of your customer checkout experience, such as defaulting to guest checkout or requiring account creation with each checkout. */
    checkout_type: string;
    /** Set this to true to POST encrypted XML of your order to the webhook url of your choice. */
    use_webhook: string;
    /** This is the url of the webhook endpoint for processing your store's webhook. See the {@link http://wiki.foxycart.com/static/redirect/webhook FoxyCart documentation} for more details. */
    webhook_url: string;
    /** This is the key used to encrypt your webhook data. It is also used as the legacy API key and the HMAC cart encryption key. */
    webhook_key: string;
    /** Set to true to use HMAC cart validation for your store. */
    use_cart_validation: string;
    /** Set this to true to redirect to your server before checkout so you can use our single sign on feature and log in your users automatically to FoxyCart or if you want to validate items before checkout. */
    use_single_sign_on: string;
    /** This is your single sign on url to redirect your users to prior to hitting the checkout page.  See the {@link http://wiki.foxycart.com/static/redirect/sso FoxyCart documentation} for more details. */
    single_sign_on_url: string;
    /** When saving a customer to FoxyCart, this is the password hashing method that will be used. */
    customer_password_hash_type: string;
    /** Configuration settings for the customer_password_hash_type in use. See the {@link http://wiki.foxycart.com/static/redirect/customers FoxyCart documentation} for more details. */
    customer_password_hash_config: string;
    /** Set to true to turn on FoxyCart's multiship functionality for shipping items to multiple locations in a single order. See the {@link http://wiki.foxycart.com/static/redirect/multiship FoxyCart documentation} for more details. */
    features_multiship: string;
    /** Set to true to require all front-end add-to-cart interactions have a valid `expires` property. */
    products_require_expires_property: string;
    /** If your store sells products which collect personal or sensitive information as product attributes, you may want to consider lowering your cart session lifespan. You can leave it as 0 to keep the default which is currently 43200 seconds (12 hours). The maximum allowed time is currently 259200 seconds (72 hours). */
    app_session_time: number;
    /** Used for determining the type of the customer address used when calculating shipping costs. */
    shipping_address_type: string;
    /** Shipping rate signing ensures that the rate the customer selects is carried through and not altered in any way. If you're intending to make use of javascript snippets on your store to alter the price or label of shipping rates or add custom rates dynamically, disable this setting as it will block those rates from being applied. The default is false. */
    require_signed_shipping_rates: string;
    /** The timezone of your store. This will impact how dates are shown to customers and within the FoxyCart admin. */
    timezone: string;
    /** Set a master password here if you would like to be able to check out as your customers without having to know their password. */
    unified_order_entry_password: string;
    /** Instead of displaying the Foxy Transaction ID, you can display your own custom display ID on your store's receipt and receipt emails. This JSON config determines how those display ids will work. The JSON supports the following fields: `enabled`, `start`, `length`, `prefix`, `suffix`. */
    custom_display_id_config: string;
    /** This can only be set during store creation. Contact us if you need this value changed later. */
    affiliate_id: number;
    /** This settings makes your checkout page completely non-functioning. Your customers will see the maintenance notification language string instead. The default is false. */
    is_maintenance_mode: string;
    /** If this store is in development or if it has an active FoxyCart subscription and can therefore use a live payment gateway to process live transactions. */
    is_active: string;
    /** The date of the first payment for this FoxyCart store subscription. This can be considered the go live date for this store. */
    first_payment_date: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:store_version": {
    /** Human readable store version string. */
    version: string;
    /** The full URL of the blog post describing the new release. */
    changelog_blog_url: string;
    /** The full URL of the changelog. */
    changelog_url: string;
    /** Full content of the changelog as HTML */
    changelog_content: string;
    /** A JSON object for various cart types supported by this version. Examples include colorbox with links to the JavaScript library, FoxyCart JavaScript files, and FoxyCart CSS files. */
    cart_types: string;
    /** The date this version was publicly released. */
    version_date: string;
    /** If this version is currently visible in the FoxyCart admin. At times, FoxyCart may launch a private beta of the latest version. */
    is_visible: string;
    /** If this version is currently considered a beta release. */
    is_beta: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:cart": {
    /**
     * The full API URI of the customer this cart is associated with. You can not POST a cart into a transaction (ie. charge a customer's saved payment method) unless this value is set to a valid customer with an active default payment method.
     *
     * Guest (ie. `is_anonymous=1` customer resources *can* be used, but be aware that guest customer payment methods are purged regularly and according to various internal criteria. As such, so you should not rely on a guest customer's saved credit card being usable indefinitely. In general, you shouldn't rely on a saved payment method persisting more than 60 days, though this value is subject to change. (And, of course, there's no guarantee for *any* saved payment method that it will work in the future, so always be sure to handle payment errors on your end.)
     *
     * Note that when this value is included, the customer's `shipping_*` and `billing_*` values will populate *and override* any existing values on the `cart` resource (unless the address values are PUT or PATCHed in the same request, in which case the explicitly set values will be used).
     *
     * Note that if you are using the `customer_uri` value, you'll likely either want to explicitly set the `use_customer_shipping_address` value.
     */
    customer_uri: string;

    /**
     * This value will be populated when `customer_uri` is set, but can be set separately (for instance, if the customer is unknown or new. This is *not* used for pre-population on the checkout, but can be helpful in certain situations (such as cart abandonment tracking).
     *
     * Note that setting `customer_uri` will overwrite this value, and you will receive an error if you set both `customer_email` and `customer_uri` with a mismatched email address.
     */
    customer_email: string;

    /**
     * The full API URI of the `fx:payments` resource, from a previous transaction. This can be used *in addition to* the `customer_uri`, to specify a specific payment method used in the past. Without this value, the customer's default saved payment method will be used instead.
     *
     * This can be helpful in certain situations, such as when a customer may use multiple different payment methods, but you need to use the API to charge a specific payment method. For instance, if a customer makes 3 transactions with 3 different credit cards, and you need to add a charge to the 2nd card used. Without this `payment_method_uri`, the *most recent* card would be charged.
     *
     * **IMPORTANT NOTES:**
     * - Not all payment methods can be used this way. Current support includes: normal credit card gateways; CyberSource card-present / point-of-sale, PayPal Express Checkout Reference Transaction, Amazon Pay and Adyen Embedded.
     * - Some gateways will only use the last payment method for the customer for that gateway, even if you might be using a `payment_method_uri` from a transaction that had used an earlier payment method for that gateway. These include PayPal Express Checkout Reference Transaction, Amazon Pay, Stripe Connect, Square and Adyen Embedded.
     * - If you're interested in this functionality and not sure if all of your chosen payment gateways are supported, please get in touch with Foxy support.
     */
    payment_method_uri: string;

    /** This value determines how an attached customer's addresses should be handled in the event the cart resource is POSTed to. When `false`, the customer's billing address will be used for both the billing and shipping addresses. Defaults to `true`, so a customer's shipping address will be used if it exists. */
    use_customer_shipping_address: string;
    /** The name of the billing address. This is also the value used as the shipto entry for a multiship item. */
    billing_address_name: string;
    /** The given name associated with the billing address. */
    billing_first_name: string;
    /** The surname associated with the billing address. */
    billing_last_name: string;
    /** The company associated with the billing address. */
    billing_company: string;
    /** The first line of billing street address. */
    billing_address1: string;
    /** The second line of the billing street address. */
    billing_address2: string;
    /** The city of this address. */
    billing_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    billing_region: string;
    /** The postal code of the billing address. */
    billing_postal_code: string;
    /** The country code of the billing address. */
    billing_country: string;
    /** The phone of the billing address. */
    billing_phone: string;
    /** The name of the shipping address. This is also the value used as the shipto entry for a multiship item. */
    shipping_address_name: string;
    /** The given name associated with the shipping address. */
    shipping_first_name: string;
    /** The surname associated with the shipping address. */
    shipping_last_name: string;
    /** The company associated with the shipping address. */
    shipping_company: string;
    /** The first line of shipping street address. */
    shipping_address1: string;
    /** The second line of the shipping street address. */
    shipping_address2: string;
    /** The city of this address. */
    shipping_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    shipping_region: string;
    /** The postal code of the shipping address. */
    shipping_postal_code: string;
    /** The country code of the shipping address. */
    shipping_country: string;
    /** The phone of the shipping address. */
    shipping_phone: string;
    /** The full API URI of the template set for this cart, if one has been specified. */
    template_set_uri: string;
    /** The language defined by the template set being used. */
    language: string;
    /** Total amount of the items in this cart. */
    total_item_price: string;
    /** Total amount of the taxes for this cart. */
    total_tax: string;
    /** Total amount of the shipping costs for this cart. */
    total_shipping: string;
    /** If this cart has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total order amount of this cart including all items, taxes, shipping costs and discounts. */
    total_order: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:create_session": {
    /** Unique session identifier. */
    session_id: string;
    /** URL of the cart associated with this session. */
    cart_link: string;
  };

  "fx:transaction": {
    /** The order number. */
    id: number;
    /** True if this transaction was a test transaction and not run against a live payment gateway. */
    is_test: string;
    /** Set this to true to hide it in the FoxyCart admin. */
    hide_transaction: string;
    /** If the webhook for this transaction has been successfully sent, this will be true. You can also modify this to meet your needs. */
    data_is_fed: string;
    /** The date of this transaction shown in the timezone of the store. The format used is ISO 8601 (or 'c' format string for PHP developers). */
    transaction_date: string;
    /** The locale code of this transaction. This will be a copy of the store's local_code at the time of the transaction. */
    locale_code: string;
    /** The customer's given name at the time of the transaction. */
    customer_first_name: string;
    /** The customer's surname at the time of the transaction. */
    customer_last_name: string;
    /** If the customer provided a tax_id during checkout, it will be included here. */
    customer_tax_id: string;
    /** The customer's email address at the time of the transaction. */
    customer_email: string;
    /** The customer's ip address at the time of the transaction. */
    customer_ip: string;
    /** The country of the customer's ip address. */
    ip_country: string;
    /** Total amount of the items in this transaction. */
    total_item_price: string;
    /** Total amount of the taxes for this transaction. */
    total_tax: string;
    /** Total amount of the shipping costs for this transaction. */
    total_shipping: string;
    /** If this transaction has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total amount of this transaction including all items, taxes, shipping costs and discounts. */
    total_order: string;
    /** Used for transactions processed with a hosted payment gateway which can change the status of the transaction after it is originally posted. If the status is empty, a normal payment gateway was used and the transaction should be considered completed. */
    status: string;
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:customer": {
    /** The FoxyCart customer id, useful for Single Sign On integrations. */
    id: number;
    /** The date of the last time this customer authenticated with the FoxyCart checkout. */
    last_login_date: string;
    /** The customer's given name. */
    first_name: string;
    /** The customer's surname. */
    last_name: string;
    /** The customer's email address. This is used as the login to the FoxyCart checkout for this customer. */
    email: string;
    /** A tax identification number for this customer. */
    tax_id: string;
    /** Your customer's clear text password. This value is never stored, not displayed for this resource, and is not available in our system. You can, however, pass it via clear text when creating or modifying a customer. When creating a customer, if you leave this blank, a random value will be generated for you which you can modify later as needed. */
    password: string;
    /** The salt for this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
    password_salt: string;
    /** The hash of this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
    password_hash: string;
    /** This will be a copy of your store's current password_hash_type at the time of creation or modificaiton. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
    password_hash_type: string;
    /** This will be a copy of your store's current password_hash_config at the time of creation or modification. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
    password_hash_config: string;
    /** If your customer forgot their password and requested a forgotten password, it will be set here. */
    forgot_password: string;
    /** The exact time the forgot password was set. */
    forgot_password_timestamp: string;
    /** If this customer checks out as a guest, this will be set to true. Once it is set, it can not be changed. */
    is_anonymous: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:default_billing_address": {
    /** The name of this address. This is also the value used as the shipto entry for a multiship item. */
    address_name: string;
    /** The given name associated with this address. */
    first_name: string;
    /** The surname associated with this address. */
    last_name: string;
    /** The company associated with this address. */
    company: string;
    /** The first line of the street address. */
    address1: string;
    /** The second line of the street address. */
    address2: string;
    /** The city of this address. */
    city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** Specifies if this address is the default billing address for the customer. */
    is_default_billing: string;
    /** Specifies if this address is the default shipping address for the customer. */
    is_default_shipping: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:default_payment_method": {
    /** If the customer selected to save their payment information, this will be true. To clear out the payment information, set this to false. */
    save_cc: string;
    /** The credit card or debit card type. This will be determined automatically once the payment card is saved. */
    cc_type: string;
    /** The payment card number. This property will not be displayed as part of this resource, but can be used to modify this payment method. */
    cc_number: number;
    /** A masked version of this payment card showing only the last 4 digits. */
    cc_number_masked: string;
    /** The payment card expiration month in the MM format. */
    cc_exp_month: string;
    /** The payment card expiration year in the YYYY format. */
    cc_exp_year: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:default_shipping_address": {
    /** The name of this address. This is also the value used as the shipto entry for a multiship item. */
    address_name: string;
    /** The given name associated with this address. */
    first_name: string;
    /** The surname associated with this address. */
    last_name: string;
    /** The company associated with this address. */
    company: string;
    /** The first line of the street address. */
    address1: string;
    /** The second line of the street address. */
    address2: string;
    /** The city of this address. */
    city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** Specifies if this address is the default billing address for the customer. */
    is_default_billing: string;
    /** Specifies if this address is the default shipping address for the customer. */
    is_default_shipping: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:item": {
    /** The full API URI of the item category associated with this item. */
    item_category_uri: string;
    /** The name of this item. */
    name: string;
    /** The price of this item. This represents the base price of the item before any item option modifiers. */
    price: string;
    /** The number of items in the cart or transaction. When adding products to the cart, if all properties are identical, the quantity will be incremented accordingly. */
    quantity: number;
    /** Minimum quantity that should be allowed per product, per cart. If the quantity is less than this, the quantity will be updated automatically to this number. */
    quantity_min: number;
    /** Maximum quantity that should be allowed per product, per cart. If the quantity is more than this, the quantity will be updated automatically to this amount. */
    quantity_max: number;
    /** This item's per-item weight, used for shipping rate requests. */
    weight: string;
    /** Item code. Can be used however you would like (internal use, product SKU, etc.). */
    code: string;
    /** Parent item code. Used if this should be a child product in a bundle. */
    parent_code: string;
    /** The name of the line item discount if it is included on this item. */
    discount_name: string;
    /** The type of the line item discount if this item has a discount. */
    discount_type: string;
    /** The details of the line item discount if this item has a discount. See the cart documentation for details on how this value should be formatted. */
    discount_details: string;
    /** This determines how often this subscription will be processed. The format is a number followed by a date type such as d (day), w (week), m (month), or y (year). You can also use .5m for twice a month. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_frequency: string;
    /** The original date this subscription began or will begin if set in the future. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_start_date: string;
    /** The date for when this subscription will run again. To modify this value for an existing subscription, you must modify the subscription directly. */
    subscription_next_transaction_date: string;
    /** If set, the date this subscription will end. The subscription will not run on this day. */
    subscription_end_date: string;
    /** If this item is part of a future subscription (or a subscription originally set up to start in the future), this will be set to true. */
    is_future_line_item: string;
    /** Used for multiship to assign this item to a specific shipment. This value will be the address name of the shipment. */
    shipto: string;
    /** The full item url for the customer to view this item online. */
    url: string;
    /** The full image url for the customer to view an image of this item online. */
    image: string;
    /** The length of this item. This is currently a place holder for future use. */
    length: number;
    /** The width of this item. This is currently a place holder for future use. */
    width: number;
    /** The width of this item. This is currently a place holder for future use. */
    height: number;
    /** As a unix timestamp, this is the point in the future when this item will no longer be valid and will be removed from the cart. */
    expires: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:coupon_detail": {
    /** The ID of this coupon detail. */
    id: string;
    /** The original coupon name used for this discount. */
    name: string;
    /** The original coupon code used for this discount. */
    code: string;
    /** The amount of discount applied to this item. */
    amount_per: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:discount_detail": {
    /** The ID of this discount detail. */
    id: string;
    /** The name of the discount. */
    name: string;
    /** The amount of discount applied to this item. */
    amount_per: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:downloadable_purchase": {
    /** The number of times the customer attempted to download this item. This is useful for fine tuning your downloadables settings. */
    number_of_downloads: number;
    /** The time of the first download attempt by the customer. This is useful for fine tuning your downloadables settings. */
    first_download_time: string;
    /** This is the passcode for downloading this item after a purchase. To construct the download link, use `https://{store_domain}.foxycart.com/dl?p={download_passcode}` */
    download_passcode: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:shipment": {
    /** Either the shipto value or `Default Shipping Address` for non-multiship transactions. */
    address_name: string;
    /** The given name associated with this address. */
    first_name: string;
    /** The surname associated with this address. */
    last_name: string;
    /** The company associated with this address. */
    company: string;
    /** The first line of the street address. */
    address1: string;
    /** The second line of the street address. */
    address2: string;
    /** The city of this address. */
    city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, the full region name will be used. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** The shipping service id selected during checkout. This will normally correspond with a `shipping_service` from one of the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/shipping_methods shipping_methods} available. */
    shipping_service_id: number;
    /** The description of the shipping service selected for this shipment. */
    shipping_service_description: string;
    /** The total price of the items in this shipment. */
    total_item_price: string;
    /** The total tax on the items in this shipment. */
    total_tax: string;
    /** The total shipping cost of the items in this shipment. */
    total_shipping: string;
    /** The total price of this shipment. */
    total_price: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:item_category": {
    /** The full API URI of the email template used by this category for sending an administrative email if send_admin_email is true. */
    admin_email_template_uri: string;
    /** The full API URI of the email template used by this category for sending an additional customer email if send_customer_email is true. */
    customer_email_template_uri: string;
    /** The category code used when applying this item category to the cart. */
    code: string;
    /** The name of this category. */
    name: string;
    /** The delivery type of the items in this category. */
    item_delivery_type: string;
    /** Determines how many times the same customer can attempt to download a purchased downloadable item before they are given an error. */
    max_downloads_per_customer: number;
    /** Determines how long in hours after the initial purchase a customer can attempt to download a purchased downloadable item before they are given an error. Some helpful values include: 1 day = 24 hours, 1 Week = 168 hours, 1 Month = 672 hours, 6 Months = 4032 hours */
    max_downloads_time_period: number;
    /** The customs value that should be used for shipping services for items in this category. */
    customs_value: string;
    /** The default weight of an item in this category if no individual item weight is given. */
    default_weight: number;
    /** The weight unit of measurement that will be sent to shipping services for items in this category. */
    default_weight_unit: string;
    /** The length unit of measurement that will be sent to shipping services for items in this category. */
    default_length_unit: string;
    /** The amount to charge for flat rate shipping when the `item_delivery_type` is `flat_rate`. */
    shipping_flat_rate: string;
    /** How to apply the flat rate shipping amount, either to the whole order or to each shipment in the order. */
    shipping_flat_rate_type: string;
    /** Specify a handling fee type if you want items in this category to have a handling fee added to their price. */
    handling_fee_type: string;
    /** The handling fee amount for this category. */
    handling_fee: string;
    /** The minimum fee when calculating the flat fee per shipment OR % of order total with items in this category. Whichever is greater. */
    handling_fee_minimum: string;
    /** The handling fee percentage used when the `handling_fee_type` includes a percentage. */
    handling_fee_percentage: string;
    /** If specified, the type of discount applied to this item category. */
    discount_type: string;
    /** The name of this category discount. */
    discount_name: string;
    /** This is the string that determines the tiers and amounts that make up your discount. For example, 2-.50|10-3|50-5 means "between 2 and 9 is discounted by .5 per product, 10 and 49 by 3 per product and 50 and over by 5 per product. If you're doing a quantity discount, it will compare against the quantity of products in the order. If you're doing a price based discount, it will compare against the price of the products in the order. Please see the documentation for more information: {@link http://wiki.foxycart.com/v/2.0/coupons_and_discounts Coupons and Discounts} */
    discount_details: string;
    /** Set to true to send an email to the customer any time an item in this category is purchased. If you set this to true, you'll also need to specify a `customer_email_template_uri` */
    send_customer_email: string;
    /** Set to true to send an email to an administrator any time an item in this category is purchased. If you set this to true, you'll also need to specify a `admin_email_template_uri` */
    send_admin_email: string;
    /** Email address of the administrator you'd like to send an email to every time an item in this category is purchased. */
    admin_email: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:item_option": {
    /** The name of this item option. */
    name: string;
    /** The value of this item option. */
    value: string;
    /** The price modifier for this item option. The price of the item in the cart will be adjusted by this amount because of this item option. */
    price_mod: string;
    /** The weight modifier for this item option. The weight of the item in the cart will be adjusted by this amount because of this item option. */
    weight_mod: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:payment": {
    /** The payment type for this payment. Values include plastic (for credit/debit cards), purchase_order, paypal, amazon_mws, hosted, ogone, and paypal_ec */
    type: string;
    /** The payment gateway type for this payment. This should correspond to a value in {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/hosted_payment_gateways hosted_payment_gateways} or {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways}. */
    gateway_type: string;
    /** The processor response string from the payment gateway. This will include their transaction or reference number. */
    processor_response: string;
    /** If supported by the payment gateway integration, this will include additional information from the payment gateway's response. */
    processor_response_details: string;
    /** The PO value entered by the customer during checkout (for purchase order payment types). */
    purchase_order: string;
    /** The masked credit card number used for this payment (for plastic payment types). */
    cc_number_masked: string;
    /** The type of credit card such as Visa or MasterCard (for plastic payment types). */
    cc_type: string;
    /** The credit card expiration month (for plastic payment types). */
    cc_exp_month: string;
    /** The credit card expiration year (for plastic payment types). */
    cc_exp_year: string;
    /** If this payment gateway set is configured with a fraud protection system, the fraud score for this payment will be listed here. */
    fraud_protection_score: string;
    /** The payer id for this payment (for Paypal payment types). */
    paypal_payer_id: string;
    /** The identifer for the third party provider for this payment (for hosted payment types). */
    third_party_id: string;
    /** The total amount of this payment. */
    amount: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:applied_tax": {
    /** The tax rate as a percentage for this applied tax. As an example, a 9.75% tax rate would be displayed as 9.75. */
    rate: string;
    /** The original tax name of this tax. */
    name: string;
    /** The amount of tax applied to the transaction. Note, this amount is not rounded to the specific currency decimal precision. */
    amount: string;
    /** Whether or not this tax was also applied to the handling fees for the transaction. */
    apply_to_handling: string;
    /** Whether or not this tax was also applied to the shipping fees for the transaction. */
    apply_to_shipping: string;
    /** Whether or not this applied tax is part of a subscription that is to be charged in the future based on when this transaction was processed. */
    is_future_tax: string;
    /** If this tax only applied to a specific shipto shipment, the shipto address name will be listed here. */
    shipto: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:custom_field": {
    /** The name of the custom field. */
    name: string;
    /** The value of this custom field. */
    value: string;
    /** Whether or not this custom field is visible on the receipt and email receipt. This correlates to custom fields with a "h:" prefix when added to the cart. */
    is_hidden: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:discount": {
    /** The original coupon code used for this discount. */
    code: string;
    /** The amount of the discount. */
    amount: string;
    /** The original coupon name used for this discount. */
    name: string;
    /** The discount displayed in the format of the currency the transaction took place in. */
    display: string;
    /** Whether or not this discount was taxable. */
    is_taxable: string;
    /** Whether or not this discount is part of a subscription that is to be charged in the future based on when this transaction was processed. */
    is_future_discount: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:billing_address": {
    /** The name of this address. This is also the value used as the shipto entry for a multiship item. */
    address_name: string;
    /** The given name associated with this address. */
    first_name: string;
    /** The surname associated with this address. */
    last_name: string;
    /** The company associated with this address. */
    company: string;
    /** The first line of the street address. */
    address1: string;
    /** The second line of the street address. */
    address2: string;
    /** The city of this address. */
    city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    region: string;
    /** The postal code of this address. */
    postal_code: string;
    /** The country code of this address. */
    country: string;
    /** The phone of this address. */
    phone: string;
    /** Specifies if this address is the default billing address for the customer. */
    is_default_billing: string;
    /** Specifies if this address is the default shipping address for the customer. */
    is_default_shipping: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:subscription": {
    /** The original date this subscription began or will begin if set in the future. */
    start_date: string;
    /** The date for when this subscription will run again. */
    next_transaction_date: string;
    /** If set, the date this subscription will end. The subscription will not run on this day. */
    end_date: string;
    /** This determines how often this subscription will be processed. The format is a number followed by a date type such as d (day), w (week), m (month), or y (year). You can also use .5m for twice a month. */
    frequency: string;
    /** If the last run of this subscription encountered an error, that error message will be saved here. It will also note if a past due payment was made. */
    error_message: string;
    /** If a subscription payment is missed, this amount will be increased by that payment. The next time the subscription runs, it will be charged automatically, depending on your store's subscription settings. */
    past_due_amount: string;
    /** If this subscription failed to process due to an error such as expired payment card, this field will show the first date the subscription failed to process. If it processes successfully at the next attempt, this field will be cleared. */
    first_failed_transaction_date: string;
    /** Determines whether or not this transaction is active or not. If you are using the subscription datafeed, it is best to set the end_date to tomorrow instead of settings this to inactive. */
    is_active: string;
    /** If this subscription is using a third party subscription system such as PayPal Express, their identifier will be set here. */
    third_party_id: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:original_transaction": {
    /** The order number. */
    id: number;
    /** True if this transaction was a test transaction and not run against a live payment gateway. */
    is_test: string;
    /** Set this to true to hide it in the FoxyCart admin. */
    hide_transaction: string;
    /** If the webhook for this transaction has been successfully sent, this will be true. You can also modify this to meet your needs. */
    data_is_fed: string;
    /** The date of this transaction shown in the timezone of the store. The format used is ISO 8601 (or 'c' format string for PHP developers). */
    transaction_date: string;
    /** The locale code of this transaction. This will be a copy of the store's local_code at the time of the transaction. */
    locale_code: string;
    /** The customer's given name at the time of the transaction. */
    customer_first_name: string;
    /** The customer's surname at the time of the transaction. */
    customer_last_name: string;
    /** If the customer provided a tax_id during checkout, it will be included here. */
    customer_tax_id: string;
    /** The customer's email address at the time of the transaction. */
    customer_email: string;
    /** The customer's ip address at the time of the transaction. */
    customer_ip: string;
    /** The country of the customer's ip address. */
    ip_country: string;
    /** Total amount of the items in this transaction. */
    total_item_price: string;
    /** Total amount of the taxes for this transaction. */
    total_tax: string;
    /** Total amount of the shipping costs for this transaction. */
    total_shipping: string;
    /** If this transaction has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total amount of this transaction including all items, taxes, shipping costs and discounts. */
    total_order: string;
    /** Used for transactions processed with a hosted payment gateway which can change the status of the transaction after it is originally posted. If the status is empty, a normal payment gateway was used and the transaction should be considered completed. */
    status: string;
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:last_transaction": {
    /** The order number. */
    id: number;
    /** True if this transaction was a test transaction and not run against a live payment gateway. */
    is_test: string;
    /** Set this to true to hide it in the FoxyCart admin. */
    hide_transaction: string;
    /** If the webhook for this transaction has been successfully sent, this will be true. You can also modify this to meet your needs. */
    data_is_fed: string;
    /** The date of this transaction shown in the timezone of the store. The format used is ISO 8601 (or 'c' format string for PHP developers). */
    transaction_date: string;
    /** The locale code of this transaction. This will be a copy of the store's local_code at the time of the transaction. */
    locale_code: string;
    /** The customer's given name at the time of the transaction. */
    customer_first_name: string;
    /** The customer's surname at the time of the transaction. */
    customer_last_name: string;
    /** If the customer provided a tax_id during checkout, it will be included here. */
    customer_tax_id: string;
    /** The customer's email address at the time of the transaction. */
    customer_email: string;
    /** The customer's ip address at the time of the transaction. */
    customer_ip: string;
    /** The country of the customer's ip address. */
    ip_country: string;
    /** Total amount of the items in this transaction. */
    total_item_price: string;
    /** Total amount of the taxes for this transaction. */
    total_tax: string;
    /** Total amount of the shipping costs for this transaction. */
    total_shipping: string;
    /** If this transaction has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total amount of this transaction including all items, taxes, shipping costs and discounts. */
    total_order: string;
    /** Used for transactions processed with a hosted payment gateway which can change the status of the transaction after it is originally posted. If the status is empty, a normal payment gateway was used and the transaction should be considered completed. */
    status: string;
    /** The 3 character ISO code for the currency. */
    currency_code: string;
    /** The currency symbol, such as $, £, €, etc. */
    currency_symbol: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:transaction_template": {
    /**
     * The full API URI of the customer this cart is associated with. You can not POST a cart into a transaction (ie. charge a customer's saved payment method) unless this value is set to a valid customer with an active default payment method.
     *
     * Guest (ie. `is_anonymous=1` customer resources *can* be used, but be aware that guest customer payment methods are purged regularly and according to various internal criteria. As such, so you should not rely on a guest customer's saved credit card being usable indefinitely. In general, you shouldn't rely on a saved payment method persisting more than 60 days, though this value is subject to change. (And, of course, there's no guarantee for *any* saved payment method that it will work in the future, so always be sure to handle payment errors on your end.)
     *
     * Note that when this value is included, the customer's `shipping_*` and `billing_*` values will populate *and override* any existing values on the `cart` resource (unless the address values are PUT or PATCHed in the same request, in which case the explicitly set values will be used).
     *
     * Note that if you are using the `customer_uri` value, you'll likely either want to explicitly set the `use_customer_shipping_address` value.
     */
    customer_uri: string;

    /**
     * This value will be populated when `customer_uri` is set, but can be set separately (for instance, if the customer is unknown or new. This is *not* used for pre-population on the checkout, but can be helpful in certain situations (such as cart abandonment tracking).
     *
     * Note that setting `customer_uri` will overwrite this value, and you will receive an error if you set both `customer_email` and `customer_uri` with a mismatched email address.
     */
    customer_email: string;

    /**
     * The full API URI of the `fx:payments` resource, from a previous transaction. This can be used *in addition to* the `customer_uri`, to specify a specific payment method used in the past. Without this value, the customer's default saved payment method will be used instead.
     *
     * This can be helpful in certain situations, such as when a customer may use multiple different payment methods, but you need to use the API to charge a specific payment method. For instance, if a customer makes 3 transactions with 3 different credit cards, and you need to add a charge to the 2nd card used. Without this `payment_method_uri`, the *most recent* card would be charged.
     *
     * **IMPORTANT NOTES:**
     *
     * - Not all payment methods can be used this way. Current support includes: normal credit card gateways; CyberSource card-present / point-of-sale, PayPal Express Checkout Reference Transaction, Amazon Pay and Adyen Embedded.
     * - Some gateways will only use the last payment method for the customer for that gateway, even if you might be using a `payment_method_uri` from a transaction that had used an earlier payment method for that gateway. These include PayPal Express Checkout Reference Transaction, Amazon Pay, Stripe Connect, Square and Adyen Embedded.
     * - If you're interested in this functionality and not sure if all of your chosen payment gateways are supported, please get in touch with Foxy support.
     */
    payment_method_uri: string;

    /** This value determines how an attached customer's addresses should be handled in the event the cart resource is POSTed to. When `false`, the customer's billing address will be used for both the billing and shipping addresses. Defaults to `true`, so a customer's shipping address will be used if it exists. */
    use_customer_shipping_address: string;
    /** The name of the billing address. This is also the value used as the shipto entry for a multiship item. */
    billing_address_name: string;
    /** The given name associated with the billing address. */
    billing_first_name: string;
    /** The surname associated with the billing address. */
    billing_last_name: string;
    /** The company associated with the billing address. */
    billing_company: string;
    /** The first line of billing street address. */
    billing_address1: string;
    /** The second line of the billing street address. */
    billing_address2: string;
    /** The city of this address. */
    billing_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    billing_region: string;
    /** The postal code of the billing address. */
    billing_postal_code: string;
    /** The country code of the billing address. */
    billing_country: string;
    /** The phone of the billing address. */
    billing_phone: string;
    /** The name of the shipping address. This is also the value used as the shipto entry for a multiship item. */
    shipping_address_name: string;
    /** The given name associated with the shipping address. */
    shipping_first_name: string;
    /** The surname associated with the shipping address. */
    shipping_last_name: string;
    /** The company associated with the shipping address. */
    shipping_company: string;
    /** The first line of shipping street address. */
    shipping_address1: string;
    /** The second line of the shipping street address. */
    shipping_address2: string;
    /** The city of this address. */
    shipping_city: string;
    /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. */
    shipping_region: string;
    /** The postal code of the shipping address. */
    shipping_postal_code: string;
    /** The country code of the shipping address. */
    shipping_country: string;
    /** The phone of the shipping address. */
    shipping_phone: string;
    /** The full API URI of the template set for this cart, if one has been specified. */
    template_set_uri: string;
    /** The language defined by the template set being used. */
    language: string;
    /** Total amount of the items in this cart. */
    total_item_price: string;
    /** Total amount of the taxes for this cart. */
    total_tax: string;
    /** Total amount of the shipping costs for this cart. */
    total_shipping: string;
    /** If this cart has any shippable subscription items which will process in the future, this will be the total amount of shipping costs for those items. */
    total_future_shipping: string;
    /** Total order amount of this cart including all items, taxes, shipping costs and discounts. */
    total_order: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:subscription_settings": {
    /** If your customer's subscription payment fails and is configured to keep track of past due amounts, this option will automatically charge the past due amount in the next scheduled subscription. The default value is true. */
    automatically_charge_past_due_amount: string;
    /** If you would like to keep track of past due amounts but not automatically charge them, this setting is helpful to reset them once a successful transaction for that subscription is processed. The default value is false. */
    clear_past_due_amounts_on_success: string;
    /** This setting determines how you'd like to handle past due amounts when we try to process a subscription and that subscritpion fails. You can either increment the past due for each failure, only keep track of the most recent failure or ignore the amounts completely. The default value is increment. */
    past_due_amount_handling: string;
    /** If a past due payment is paid directly by the customer, reset the next transaction date for the subscription to be one frequency out from the day that transaction is processed. */
    reset_nextdate_on_makeup_payment: string;
    /** A comma separated list of numbers. Each number represents the number of days after the initial failure that a reattempt should be made. For example, a setting of `1, 3, 5, 15, 30` would direct FoxyCart to attempt to collect the past-due amount on the 1st, 3rd, 5th, and 15th days after the initial transaction. */
    reattempt_schedule: string;
    /** Used in conjunction with the "bypass strings" below, this setting determines whether Foxy should reattempt the subscription charge if the transaction's previous error string does or doesn't contain specific text. */
    reattempt_bypass_logic: string;
    /** A comma separated list of strings containing text strings that should prevent or allow (based on the above setting) a rebilling attempt. For example, setting the logic to "skip if the string is present" with a value for the "strings" field of `Code: 8, Code: 37` would instruct FoxyCart to not initiate the rebilling process if the last error contained either `Code: 8` or `Code: 37`, but to attempt the rebilling in all other cases. */
    reattempt_bypass_strings: string;
    /** Enter a comma separated list of numbers. Each number represents the number of days until the payment card expires that an email notification should be sent to the customer. This only happens for customers with active subscriptions. For example, if you put in 20,15,5, 20 days before the end of the month, customers with payment cards that will expire that month will receive an email. Same with 15 days and 5 days before the end of the month. */
    expiring_soon_payment_reminder_schedule: string;
    /** A comma separated list of numbers. Each number represents the number of days after the initial failure that an email notification to the customer should be sent. This only happens for active subscriptions which still have a past due amount. If a reattempt is successful, no additional reminder email will be sent. */
    reminder_email_schedule: string;
    /** A single number representing the number of days after the initial failure that a subscription should be set to cancel (assuming a successful payment hasn't been made in the meantime). For example, if a subscription is set to process on the 1st of the month and this value is 35, on the 5th of the next month (which is 35 days later, assuming the first month had 30 days), the subscription will be cancelled. (The end date will be set to that day, and it will be set to inactive.) */
    cancellation_schedule: number;
    /** When subscriptions run automatically to bill your customers, turning this setting off will prevent the normal receipt emails from being sent for their automated payment. The default value is true. */
    send_email_receipts_for_automated_billing: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:admin_email_template": {
    /** The description of your email template. */
    description: string;
    /** The content of your html email template. Leave blank to use the default responsive template. You can set the content directly or set the `content_html_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_html: string;
    /** The URL of your html email template hosted on your own server online and publicly available for our server to cache. */
    content_html_url: string;
    /** The content of your text email template. Leave blank to use the default template. You can set the content directly or set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_text: string;
    /** The URL of your text email template hosted on your own server online and publicly available for our server to cache. */
    content_text_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:customer_email_template": {
    /** The description of your email template. */
    description: string;
    /** The content of your html email template. Leave blank to use the default responsive template. You can set the content directly or set the `content_html_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_html: string;
    /** The URL of your html email template hosted on your own server online and publicly available for our server to cache. */
    content_html_url: string;
    /** The content of your text email template. Leave blank to use the default template. You can set the content directly or set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_text: string;
    /** The URL of your text email template hosted on your own server online and publicly available for our server to cache. */
    content_text_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:tax_item_category": {
    /** A full API URI of the item category resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    item_category_uri: string;
    /** A full API URI of the tax resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    store_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:tax": {
    /** The name of this tax which will be displayed to the customer. */
    name: string;
    /** The type of tax rate which determines when this tax will be applied. */
    type: string;
    /** The country which will be matched against the customer shipping country to determine if a country tax will be applied. */
    country: string;
    /** The region (also known as a state or province) which will be matched against the customer shipping region to determine if a regional tax will be applied. */
    region: string;
    /** The city which will be matched against the customer shipping city to determine if a local tax will be applied. */
    city: string;
    /** Set to true if the tax rate will be determined automatically by the postal code. */
    is_live: string;
    /** If using a live tax rate service provider, this value can be set to determine which provider you would like to use. */
    service_provider: string;
    /** Set to true if the tax rate will also be applied to the shipping costs. */
    apply_to_shipping: string;
    /** For a Union tax type, set to true to use the origin country tax rates. */
    use_origin_rates: string;
    /** Set to true to exempt all customers with a tax id */
    exempt_all_customer_tax_ids: string;
    /** The tax rate to be applied for this tax. For 10%, use 10. */
    rate: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:payment_method_set": {
    /** The full API URI of the payment_gateway associated with this payment method set. */
    gateway_uri: string;
    /** The description of your payment method set. */
    description: string;
    /** Set this to true to enable a live payment gateway and live hosted gateways. This can only be set to true if your store is active. If this is set to false, transactions will be processed as test transactions. */
    is_live: string;
    /** Set this to true to enable the purchase order payment option on your store. This can only be set to true if your store is active. */
    is_purchase_order_enabled: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:payment_gateway": {
    /** Description of this payment gateway */
    description: string;
    /** Valid payment gateway type. */
    type: string;
    /** Your payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    account_id: string;
    /** Your payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    account_key: string;
    /** Your payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    third_party_key: string;
    /** Configuration settings for 3D Secure. */
    config_3d_secure: string;
    /** Additional configuration details specific to each payment gateway. */
    additional_fields: string;
    /** Your test payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    test_account_id: string;
    /** Your test payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    test_account_key: string;
    /** Your test payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    test_third_party_key: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:payment_method_set_hosted_payment_gateway": {
    /** The full API URI of the payment method set associated with this payment method set hosted payment gateway. */
    payment_method_set_uri: string;
    /** The full API URI of the hosted payment gateway associated with this payment method set hosted payment gateway. */
    hosted_payment_gateway_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:payment_method_set_fraud_protection": {
    /** The full API URI of the payment method set associated with this payment method set fraud protection. */
    payment_method_set_uri: string;
    /** The full API URI of the fraud protection associated with this payment method set fraud protection. */
    fraud_protection_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:coupon": {
    /** The name of this coupon. This will be for your own use and displayed to the customer. */
    name: string;
    /** If you want this coupon's usage to be limited by a time frame or start in the future, add a start date here. To clear it out, set an empty value or use 0000-00-00. */
    start_date: string;
    /** If you want this coupon's usage to be limited by a time frame or end in the future, add an end date here. To clear it out, set an empty value or use 0000-00-00. */
    end_date: string;
    /** This is the total number of times this coupon is allowed to be used. This can be helpful for promotions that involve offering a discount to the first 100 customers, as an example, even though more than 100 coupon codes were given out. Leave as 0 to ignore this feature. */
    number_of_uses_allowed: number;
    /** For informational purposes, this shows you how many times this coupon has already been used. */
    number_of_uses_to_date: number;
    /** If each customer is only allowed to use this coupon once, enter 1 here. This is based off of the customer email address, not a payment method, ip address, shipping address or browser cookie. Leave as 0 to ignore this feature. */
    number_of_uses_allowed_per_customer: number;
    /** If you want to limit the number of uses per individual coupon code, enter that number here. If you want each code to only be used once, enter 1 here. Leave as 0 to ignore this feature. */
    number_of_uses_allowed_per_code: number;
    /** If you want to limit which products can use this coupon, you can enter a comma separated listed of product codes or partial product codes using * as a wild card at the beginning or end of the value. So abc123, fun_*, *-small would match abc123, fun_ and fun_times, and example-small. It wouldn't match abc12, abc1234, fun, or good-smalls. */
    product_code_restrictions: string;
    /** This specifies what type of discount will be applied. Will it be a percentage discount or an amount discount based on either the product price or the product quantity? */
    coupon_discount_type: string;
    /** This is the string that determines the tiers and amounts that make up your discount. For example, 2-.50|10-3|50-5 means "between 2 and 9 is discounted by .5 per product, 10 and 49 by 3 per product and 50 and over by 5 per product. If you're doing a quantity discount, it will compare against the quantity of products in the order. If you're doing a price based discount, it will compare against the price of the products in the order. Please see the documentation for more information: {@link http://wiki.foxycart.com/v/2.0/coupons_and_discounts Coupons and Discounts} */
    coupon_discount_details: string;
    /** If this coupon can be combined with other coupons, check this check box. If this box is unchecked, the coupon will not be added to the cart if another coupon is already in the cart. Similarly, if this coupon is added first, no other coupons will be able to be added to the cart. */
    combinable: string;
    /** Set to true if you want to allow your customers to use multiple coupon codes from this coupon on the same order. If false, the customer will see an error if they try to add another coupon code if one for this coupon is already in the cart. */
    multiple_codes_allowed: string;
    /** Set to true if you want to ensure category discounts are not applied for an order that uses this coupon. */
    exclude_category_discounts: string;
    /** Set to true if you want to ensure line item discounts are not applied to any products for an order that uses this coupon. */
    exclude_line_item_discounts: string;
    /** Set to true to apply taxes before this coupon's discount is applied. Check with your tax professional if you have questions about how you should calculate taxes. */
    is_taxable: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:coupon_code": {
    /** The string value of this coupon code which your customer will add to their cart to use this coupon. */
    code: string;
    /** For informational purposes, this shows you how many times this coupon code has already been used. */
    number_of_uses_to_date: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:coupon_code_transaction": {
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:coupon_item_category": {
    /** The full API URI of the coupon associated with this coupon item category. */
    coupon_uri: string;
    /** The full API URI of the item category associated with this coupon item category. */
    item_category_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:template_set": {
    /** The full API URI of the cart template associated with this template set. */
    cart_template_uri: string;
    /** The full API URI of the cart_include template associated with this template set. */
    cart_include_template_uri: string;
    /** The full API URI of the checkout template associated with this template set. */
    checkout_template_uri: string;
    /** The full API URI of the receipt template associated with this template set. */
    receipt_template_uri: string;
    /** The full API URI of the email template associated with this template set. */
    email_template_uri: string;
    /** The full API URI of the payment method set associated with this template set. */
    payment_method_set_uri: string;
    /** The template set code used when applying this template set to the cart (currently only supports DEFAULT). */
    code: string;
    /** The template set description. (currently only supports the default description). */
    description: string;
    /** The language configured for this template set. */
    language: string;
    /** The locale code for this store. This will impact how the currency and dates are displayed. */
    locale_code: string;
    /** This is the template configuration settings for your store. */
    config: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:template_config": {
    /** The description of your template config. */
    description: string;
    /** This is the template configuration settings for your store. */
    json: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
    /** Controls how your cart functions. */
    cart_type: string;
    /** Determines how you'd like customers to interact with your checkout regarding guest checkout or account checkout. The default value shows which option is shown first by default. */
    checkout_type: string;
    /** Sets under what circumstances the card security code should be required. */
    csc_requirements: string;
    /** Determines if you'd like a terms of service checkbox and url on your checkout. The usage can be `none`, `required`, or `optional`. The initial state can be `checked` or `unchecked`. is_hidden is a boolean you can use to use a hidden custom field. Url is the url of your terms of service document. */
    tos_checkbox_settings: string;
    /** Display a Secure Data Transfer agreement to EU customers. The usage can be `none` or `required`. */
    eu_secure_data_transfer_consent: string;
    /** Display a newsletter subscribe checkbox on your checkout. The usage can be `none` or `required`. */
    newsletter_subscribe: string;
    /** Display a newsletter subscribe checkbox on your checkout. The usage can be `none` or `required`. google_analytics is another array with `usage`, `account_id`, and `include_on_site` (boolean) */
    analytics_config: string;
    /** Can be used to set some basic colors for your cart, checkout, and receipt templates. The usage can be `none` or `required`. The primary, secondary, and tertiary values should be RGB color codes without the hash such as FFFFFF. */
    colors: string;
    /** Not currently implemented. The usage can be `none` or `required`. */
    use_checkout_confirmation_window: string;
    /** Add the payment card types you support and want displayed on the checkout page. */
    supported_payment_cards: string;
    /** Customize which fields should be required, option, hidden or default on the checkout page. `cart_controls` (values `enabled` or `disabled`) determines if someone can remove or change the quantity of an item on the checkout. `coupon_entry` (values `enabled` or `disabled`) determines if the checkout page should include the coupon entry field. The other billing fields determines how those fields are used on the checkout. */
    custom_checkout_field_requirements: string;
    /** Customize which fields in the cart are shown are hidden. The usage can be `none` or `required`. The named fields are booleans (either true or false) and `hidden_product_options` is an array of custom product option names you specify. */
    cart_display_config: string;
    /** Allows you to customize and control the functionality of our find-as-you type system from countries and regions. The usage can be `none` or `required`. show_combobox and show_flags are booleans while combobox_open and combobox_close are the characters used for the combo box styling. */
    foxycomplete: string;
    /** Custom HTML, css, and JavaScript for your cart, checkout and receipt templates. Twig is not allowed in the footer template. */
    custom_script_values: string;

    /**
     * @deprecated
     * This field is deprecated and should not be relied on.
     */
    http_receipt: string;

    /** A place where you can store your own custom JSON configuration data to be used by your Twig templates. */
    custom_config: string;
    /** The usage can be `none` or `required` */
    debug: string;
    /** This controls which countries and regions you want to allow on your cart and checkout pages. The usage can be `none`, `shipping`, `billing`, `both`, or `independent`. The filter types can be `blacklist` or `whitelist` */
    location_filtering: string;
    /** The usage can be `none` or `enabled` */
    postal_code_lookup: string;
  };

  "fx:cart_template": {
    /** The description of your cart template. */
    description: string;
    /** The content of your cart template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your cart template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:cart_include_template": {
    /** The description of your cart include template. */
    description: string;
    /** The content of your cart include template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your cart include template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:checkout_template": {
    /** The description of your checkout template. */
    description: string;
    /** The content of your checkout template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your checkout template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:receipt_template": {
    /** The description of your receipt template. */
    description: string;
    /** The content of your receipt template. Leave blank to use the default responsive template. This shouldn't be set directly unless all of your image references are already over https. If they are not, set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content: string;
    /** The URL of your receipt template hosted on your own server online and publicly available for our server to cache. */
    content_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:email_template": {
    /** The description of your email template. */
    description: string;
    /** The content of your html email template. Leave blank to use the default responsive template. You can set the content directly or set the `content_html_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_html: string;
    /** The URL of your html email template hosted on your own server online and publicly available for our server to cache. */
    content_html_url: string;
    /** The content of your text email template. Leave blank to use the default template. You can set the content directly or set the `content_url` to point to your template content online and then POST to the `cache` link relationship. */
    content_text: string;
    /** The URL of your text email template hosted on your own server online and publicly available for our server to cache. */
    content_text_url: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:language_override": {
    /** The code for this language string. This is the same code you will see in the `FC.json.config.lang` array. */
    code: string;
    /** For the language strings specific to a payment gateway, enter the gateway key here. */
    gateway: string;
    /** Your custom string for this language code. */
    custom_value: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:error_entry": {
    /** The Foxy page where the error took place. */
    url: string;
    /** The error message explaining what happened. */
    error_message: string;
    /** The user agent string collected at the time of the error. */
    user_agent: string;
    /** The browser referrer value at the time of the error. */
    referrer: string;
    /** The IP Address of the user collected at the time of the error. */
    ip_address: string;
    /** The country of the user based on the IP Address at the time of the error. */
    ip_country: string;
    /** All the POST data sent to the url at the time of the error. Note: secure card holder data such as the card number, csc, or password will not be included in this data. */
    post_values: string;
    /** All the GET data sent to the url at the time of the error. Note: secure card holder data such as the card number, csc, or password will not be included in this data. */
    get_values: string;
    /** Set this to false to hide this error entry from the Foxy administrative interface. This may be a helpful way to manage and acknowledge errors for your store. */
    hide_error: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:downloadable": {
    /** The full API URI of the item category this product is part of. The item category must have an item delivery type of downloaded. */
    item_category_uri: string;
    /** The name of this downloadable. This will be shown to the customer in the cart. */
    name: string;
    /** The code for this downloadable. When adding this item to the cart, this is the code which will be used. */
    code: string;
    /** The item total for this downloadable. This is the amount the customer will pay to purchased this downloadable item. */
    price: string;
    /** The name of the file uploaded to our server. This is originally set when creating a downloadable with the `file` property. */
    file_name: string;
    /** The size of the file uploaded to our server. This is originally set when creating a downloadable with the `file` property. */
    file_size: number;
    /** The date this file was last uploaded. */
    upload_date: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:hosted_payment_gateway": {
    /** Description of this payment gateway */
    description: string;
    /** Valid hosted payment gateway type. */
    type: string;
    /** Your payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    account_id: string;
    /** Your payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    account_key: string;
    /** Your payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    third_party_key: string;
    /** Configuration settings for 3D Secure. */
    config_3d_secure: string;
    /** Additional configuration details specific to each payment gateway. */
    additional_fields: string;
    /** Your test payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    test_account_id: string;
    /** Your test payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    test_account_key: string;
    /** Your test payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    test_third_party_key: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:fraud_protection": {
    /** The type of this fraud protection */
    type: string;
    /** Description of this fraud protection */
    description: string;
    /** Configuration settings for some fraud protection systems. */
    json: string;
    /** The score threshold used for minfraud. This should be set between 0 and 100. 0 will disable minFraud and 100 will turn it on for logging but still allow all transactions to go through. */
    score_threshold_reject: number;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
    /** Determines how reCAPTCHA is configured to operate. */
    config: string;
    /** Your Google reCAPTCHA Private Key */
    private_key: string;
    /** Your Google reCAPTCHA Site Key */
    site_key: string;
    /** Whether or not the Pre-Checkout Hook is enabled. */
    enabled: string;
    /** Url of your Pre-Checkout Hook */
    url: string;
    /** If your Pre-Checkout Hook is unavailabe for some reason, this setting determines if the checkout should be rejected or approved. */
    failure_handling: string;
  };

  "fx:payment_method_expiring": {
    /** Months from today's day before this payment card will expire. */
    months_before_expiration: string;
    /** The customer's given name. */
    first_name: string;
    /** The customer's surname. */
    last_name: string;
    /** The customer's email address. */
    email: string;
    /** The credit card or debit card type. */
    cc_type: string;
    /** A masked version of this payment card showing only the last 4 digits. */
    cc_number_masked: string;
    /** The payment card expiration month in the MM format. */
    cc_exp_month: string;
    /** The payment card expiration year in the YYYY format. */
    cc_exp_year: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:store_shipping_method": {
    /** The full API URI of the shipping method defined in our property helpers. */
    shipping_method_uri: string;
    /** The full API URI of the shipping method container defined in our property helpers. Each shipping method will have it's own shipping containers. */
    shipping_container_uri: string;
    /** The full API URI of the shipping method drop type defined in our property helpers. Each shipping method will have it's own shipping drop types. */
    shipping_drop_type_uri: string;
    /** If using account specific rates, enter your shipping account id here. */
    accountid: string;
    /** If using account specific rates, enter your shipping account password here. */
    password: string;
    /** If using account specific rates, enter your shipping account meter number here, if applicable. */
    meter_number: string;
    /** If using account specific rates, enter your shipping account authentication key here, if applicable. */
    authentication_key: string;
    /** Set to true if you want this shipping method to apply to domestic shipping rate requests. <br>Note: This value is read only `true` for `CUSTOM-CODE`. */
    use_for_domestic: string;
    /** Set to true if you want this shipping method to apply to international shipping rate requests. <br>Note: This value is read only `true` for `CUSTOM-CODE`. */
    use_for_international: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
    /** For the `CUSTOM-CODE` shipping method. JavaScript used to create and modify shipping rates. */
    custom_code: string;
    /** For the `CUSTOM-CODE` shipping method. Values are `deploying`, `deployed`, and `error`. */
    deployment_status: string;
  };

  "fx:store_shipping_service": {
    /** The full API URI of the shipping method defined in our property helpers. */
    shipping_method_uri: string;
    /** The full API URI of the shipping method shipping service defined in our property helpers. Each shipping method will have it's own shipping services. */
    shipping_service_uri: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:integration": {
    /** A full API URI of the user resource used in this relationship. When working with hypermedia, it's important to save URIs and not just numeric ids. */
    user_uri: string;
    /** A unique identifier for this client. Maps to the client_id of the {@link https://api.foxycart.com/rels/client client} resource. */
    client_id: string;
    /** The OAuth scope granted to this integration. */
    scope: string;
    /** When this OAuth refresh token expires. */
    expires: string;
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

  "fx:native_integration": {
    /** The identifier string of this provider. */
    provider: string;
    /** A JSON string containing the configuration values and credentials for this native integration. */
    config: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:token": {
    /** The OAuth refresh token. This token is returned in the response whenever creating a client, user or store or when doing an authorization code grant. */
    refresh_token: string;
    /** The OAuth access token. Access tokens expire after 7200 seconds (2 hours). */
    access_token: string;
    /** Lifespan of the access token in seconds. */
    expires_in: number;
    /** Returned token type, e.g. `bearer`. */
    token_type: string;
    /** The scopes assigned to this token. */
    scope: string;
  };

  "fx:property_helpers": {
    /** Resource description. */
    message: string;
  };

  "fx:checkout_types": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `checkout_type` property. */
    values: string;
  };

  "fx:customer_password_hash_types": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the password hash type as the object key. This key is the value you use for the Store resource's `customer_password_hash_type` property and the Customer resource's `password_hash_type` property. */
    values: string;
  };

  "fx:default_templates": {
    /** A small, human readable explanation of this property helper. */
    message: string;
  };

  "fx:languages": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the languages supported. The key values are the values you use for the Store resource's language property. */
    values: string;
  };

  "fx:language_strings": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the language strings supported. The key values match the language property and each pair represents the language_override `code` and `custom_value`. */
    values: string;
  };

  "fx:locale_codes": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the locale codes supported. The key values are the values you use for the Store resource's `locale_code` property. */
    values: string;
  };

  "fx:shipping_method": {
    /** The name of this shipping method */
    name: string;
    /** The code for this shipping method */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:shipping_service": {
    /** The name of this shipping service */
    name: string;
    /** The code for this shipping service */
    code: string;
    /** Specifies whether or not this shipping service is for international rate requests only. */
    is_international: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:shipping_container": {
    /** The name of this shipping container */
    name: string;
    /** The code for this shipping container */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:shipping_drop_type": {
    /** The name of this shipping drop type */
    name: string;
    /** The code for this shipping drop type */
    code: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  "fx:shipping_address_types": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the checkout types supported. The key values are the values you use for the Store resource's `shipping_address_type` property. */
    values: string;
  };

  "fx:countries": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the country codes as the keys. */
    values: string;
  };

  "fx:regions": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the region codes as the keys. */
    values: string;
  };

  "fx:timezones": {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON object with an array of timezones. */
    values: string;
  };
}
