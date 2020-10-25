## Foxy API

Universal SDK for a full server-side and a limited in-browser access to Foxy hAPI.

> Warning: this is a pre-release software. We're still working on the feature set, documentation and test coverage. Using this package in production is not advised.

## Setup

### Step 1: Install

```bash
npm i @foxy.io/api
```

### Step 2: Import

There are 3 types of API you can pick from:

1. **Client API** is for integrations that connect to hAPI directly from a safe server-side environment. You will need to create an OAuth **client** to work with this class.
2. **User API** is a subset of hAPI for admin-level access to a store from a browser with the same email and password you use to sign in to Foxy Admin. This API is for FoxyCart **users**.
3. **Customer API** is a subset of hAPI available to **customers** of a particular store from a browser. Email and password used for sign in are separate from the admin credentials and always specific to that store.

There's a class for each one of them, and you can import it like so:

```js
const { ClientAPI } = require("@foxy.io/api");
const { UserAPI } = require("@foxy.io/api");
const { CustomerAPI } = require("@foxy.io/api");
```

With TypeScript or Node v13+ you can also use [ES Modules](http://nodejs.org/docs/latest-v13.x/api/esm.html…):

```ts
import { ClientAPI } from "@foxy.io/api";
import { UserAPI } from "@foxy.io/api";
import { CustomerAPI } from "@foxy.io/api";
```

### Step 3: Initialize and sign in

Initializing is same for all 3 API types, and all params are optional, so you can create an instance with defaults and start right away.

```ts
const clientAPI = new ClientAPI();
const userAPI = new UserAPI();
const customerAPI = new CustomerAPI();
```

One of the options you'll most likely want to configure right away when using User API and Customer API is the endpoint:

```ts
const userAPI = new UserAPI({
  endpoint: "https://example.com/s/admin",
});

const customerAPI = new CustomerAPI({
  endpoint: "https://example.com/s/customer",
});
```

Signing in, on the other hand, is different for each one of the APIs. You'll need OAuth client credentials for the ClientAPI and an email + password pair for User and Customer API:

```ts
await clientAPI.signIn({
  clientId: "client-id-for-your-integration",
  clientSecret: "client-secret-for-your-integration",
  refreshToken: "refresh-token-for-your-integration",
});

await userAPI.signIn({
  email: "admin@example.com",
  password: "your-admin-password",
});

await customerAPI.signIn({
  email: "customer@example.com",
  password: "customer-password",
});
```

Once you're in, you can start making requests to the API. The SDK will keep the session open as long as the NodeJS process is active or a browser tab is open. If you'd like to persist the session, you'll need to specify a different storage implementing the `Storage` interface of the Web Storage API when creating your instance:

```ts
// NodeJS doesn't have a built-in `Storage` implementation,
// but you can always provide your own:
new ClientAPI({ storage: new MyCustomStorage() });

// Session Storage will keep you logged in for
// as long as your browser is open:
new UserAPI({ storage: window.sessionStorage });

// Local Storage will persist your session for as long
// as possible. Keep in mind that some browsers clear
// local storage after 7 days and most of them wipe it
// upon exiting the private mode:
new CustomerAPI({ storage: window.localStorage });
```

Signing out is as simple as calling the `.signOut()` method. It's always async:

```ts
await clientAPI.signOut();
await userAPI.signOut();
await customerAPI.signOut();
```

## Usage

Regardless of the API type you're working with, the interface will always be the same. To make the examples a bit more lightweight, we'll refer to the API instance as to `api` in the following examples.

### Obtain a reference

```ts
const store = api.follow("fx:stores").follow(8);

// for store there's also a root rel:
const store = api.follow("fx:store");
```

### Make a raw request (no url builder/resolver)

```ts
const store = await api.fetchRaw({
  url: new URL("stores/8", api.endpoint),
});
```

### GET, where available

```ts
await store.fetch({ method: "GET" });
// or simply:
await store.fetch();
```

There's many `.fetch()` options available depending on the resource type you're working with. One of them is zooming:

```ts
await store.fetch({
  zoom: ["transactions", { customer: ["default_billing_address"] }],
});
```

The other two are the standard `order`, `limit` and `offset` options available for collections:

```ts
await store.follow("fx:transactions").fetch({
  order: [{ date_created: "desc" }, "transaction_date"],
  limit: 10,
  offset: 25,
});
```

You can also speed up the download by requesting only the data you need:

```ts
await store.fetch({
  fields: ["store_name", "logo_url"],
});
```

For any other advanced hAPI functionality you feel free use the `query` property or add your parameters directly to the `url`. Let's fetch transactions that have an attribute with name "color":

```ts
// using a plain object
await transactions.fetch({
  query: { "name[color]": "red" },
});

// the same, but wrapped in URLSearchParams
await transactions.fetch({
  query: new URLSearchParams({ "name[color]": "red" }),
});

// with a different syntax
await transactions.fetch({
  query: new URLSearchParams([["name[color]", "red"]]),
});

// and even like this
await transactions.fetch({
  query: new URLSearchParams("name[color]=red"),
});

// or in a url
await transactions.fetch({
  url: "path/to/transactions?name[color]=red",
});

// now mix them all together and add another constraint
await transactions.fetch({
  url: "path/to/transactions?name[color]=red",
  query: { total_order: 50 },
});
```

The last example shows that no matter how you pass the request options in, the SDK will do its best to merge them into a single query. The specificity of the parameters will be respected: `query` will overwrite the conflicting params in `url`, and options like `zoom` or `fields` will overwrite the respective values in both `query` and `url`.

### PUT / POST / PATCH, where available

```ts
await store.fetch({
  method: "PATCH",
  body: { store_name: "New Store Name" },
});

// or using a serialized payload:

await store.fetch({
  method: "PATCH",
  body: '{ "store_name": "New Store Name" }',
});
```

### DELETE, where available

```ts
await store.fetch({ method: "DELETE" });
```

### Opting out of smart path resolution

By default our client will try to leverage the built-in resolvers to make as few network calls as possible when following relations. These resolvers aren't perfect yet and even though we have a failsafe mechanism that runs a full tree traversal on failure, silent errors are still a possibility (e.g. when the resolved path is valid, but points to a wrong resource). In that case you can set `FetchInit.skipCache` option to `true` to disable smart path resolution:

```ts
await store.fetch({
  // ...
  skipCache: true,
});
```

## Custom element

This package includes a custom element for APIs that can be used in a browser (currently Customer API and User API). You'll most likely need it to connect components from `@foxy.io/elements` to hAPI, but you can also use it with your own elements.

To get started, import the element and add a tag anywhere on the page:

**JS**

```js
// Quick setup: registers <foxy-api> globally
import "@foxy.io/api/dist/element";

// Advanced setup: custom name, register when ready, extend the class etc.
import { APIElement } from "@foxy.io/api";
customElements.define("my-api", APIElement);
```

**HTML**

```html
<foxy-api><!-- put your components here --></foxy-api>
```

API element creates a `UserAPI` instance linked to `${location.origin}/s/admin` by default. You'll most likely want to customize the endpoint or be explicit about the API you use:

```html
<foxy-api href="https://api.example.com/admin" rel="user">...</foxy-api>
```

For `CustomerAPI` you'll need to provide both the `href` the `rel` attribute values:

```html
<foxy-api href="https://api.example.com/customer" rel="customer">...</foxy-api>
```

That's it! From this point our custom element will listen to the `request` events emitted by the child elements and send them to the chosen API with the correct auth headers. If you'd like to make your element compatible with `<foxy-api>`, replace `fetch` with `RequestEvent.emit` like so:

#### Before

```ts
class MyCustomElement extends HTMLElement {
  getStore() {
    return fetch("https://api.example.com/s/admin/stores/8");
  }
}
```

#### After

```ts
import { RequestEvent } from "@foxy.io/api";

class MyCustomElement extends HTMLElement {
  getStore() {
    return RequestEvent.emit({
      source: this,
      init: ["https://api.example.com/s/admin/stores/8"],
    });
  }
}
```

The `init` option accepts exactly the same parameters as `fetch`, so your code should be instantly compatible if you're already relying on Fetch API to make API requests.

## Development

To get started, clone this repo locally and install the dependencies:

```bash
git clone https://github.com/foxy/foxy-api.git
npm install
```

Running tests:

```bash
npm run test       # runs all tests and exits
npm run test:watch # looks for changes and re-runs tests as you code
```

Committing changes with [commitizen](https://github.com/commitizen/cz-cli):

```bash
git commit # precommit hooks will lint the staged files and help you format your message correctly
```
