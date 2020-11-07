## Foxy SDK 🦊🧱

Universal SDK for a full server-side and a limited in-browser access to Foxy hAPI.

**Warning: this is a pre-release software. We're still working on the feature set, documentation and test coverage. Using this package in production is not advised.**

## Setup

Install the package:

```bash
npm i @foxy.io/sdk@beta
```

Then import using CommonJS (Node 10-12):

```js
const FoxySDK = require('@foxy.io/sdk');
```

or ES Modules (Node 13+, TypeScript, browsers):

```js
import * as FoxySDK from '@foxy.io/sdk';
```

## Getting started

Our SDK consists of 4 main parts available via the main file:

1. **Integration** is for building integrations that connect to hAPI directly from a safe **server-side** environment. Apart from the API client, you'll also find a number of useful utilities for HMAC signing, removing sensitive info from responses and webhook verification under this export alias.
2. **Customer** is for building **universal** apps and websites that interact with a subset of hAPI available to customers of a particular store. This export is also available as a pre-built library on our CDN.
3. **Admin** is for building **universal** apps and websites that interact with a subset of hAPI available to store admins. This export is also available as a pre-built library on our CDN.
4. **Core**: is for building custom API clients that interact with Hypermedia API endpoints. This is the most advanced part of the SDK that every other built-in API client depends on. You can run it server and client-side.

Integration, Customer and Admin all export API client classes for working with the respective endpoints. If you're using TypeScript, you'll also see the type exports for API-specific hypermedia relations and graphs named `Rels` and `Graph`. Let's connect to hAPI using `FoxySDK.Integration.API` class:

```js
const api = new FoxySDK.Integration.API({
  refreshToken: 'your refresh token',
  clientSecret: 'your client secret',
  clientId: 'your client id',
});
```

This will create a hAPI version 1 client connecting to `https://api.foxycart.com/` with the given credentials, using in-memory storage for access token and URL resolution, logging errors, warnings and informational messages to console. You can customize each one of these defaults in constructor params and you'll see similar options for Customer and Admin API as well.

Regardless of the API type you're working with, you'll see the same methods on each node: `.follow()`, `.get()`, `.put()`, `.post()`, `.patch()` and `.delete()`. Here's how you can use them in 3 steps:

### 1. Find a node

To access a hAPI endpoint, you don't type in a URL – instead you traverse the API graph via links until you reach your target. For example, to see your transactions, you need to load the bookmark URL (`https://api.foxycart.com/`), load your store at `bookmark._links['fx:store'].href` and only then get to the transactions at `store._links['fx:transactions'].href`. With our SDK this lengthy process becomes a one-liner:

```js
const transactionsNode = api.follow('fx:store').follow('fx:transactions');
```

String bits that start with `fx:` are called Compact URIs (or curies for short), and if you're using an editor that supports code autocompletion based on TypeScript definitions, we'll provide suggestions for available curies where possible.

Now that we have our node, let's get some data from it:

### 2. Get some data

Each node has a class method corresponding to a supported HTTP method. For example, to make a `GET` request, we can call `.get()`:

```js
const transactionsResponse = await transactionsNode.get();
```

The method we've just called returns a Promise (hence the use of the `await` keyword) that resolves with an enhanced version of a native [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object, giving you an ability to access response status, headers and more. But for now we just want our JSON:

```js
const transactions = await transactionsResponse.json();
```

Done! Now you have the API response with the same schema as in the [docs](https://api.foxycart.com/) at your disposal. And yes, we have type definitions for it too, meaning that you'll get type checking with TypeScript and rich autosuggestions with inline docs in every editor that supports them. But what if we could go even further?

### 3. Making complex queries

Quite often you'll need to fetch a specific set of items, maybe apply some filters, skip a few entries, speed things up by requesting a partial resource – and you can do that with hAPI using query parameters from our [cheatsheet](https://api.foxycart.com/docs/cheat-sheet). Our SDK provides convenient shortcuts for these parameters in the `.get()` method (all optional):

```js
const transactionsResponse = await transactionsNode.get({
  zoom: { customer: ['default_billing_address'] },
  filters: ['total_order:greaterthan=50', 'attributes:name[color]=red'],
  fields: ['id', 'total_order', 'currency_code'],
  offset: 25,
  limit: 10,
});
```

The response type will also match your query as close as possible, giving you the ability to eliminate possible errors before hitting the API. For example, for the above request each transaction will have only those 3 fields and only those 2 nested embeds (+ attributes where supported as they're included by default).

### Bonus: followable responses

Each link in the `_links` object received from our SDK includes the same methods as a regular node, so you can do something like this:

```js
const nextTransactionsPage = await transactions._links.next.get();
```

It also works with embedded resources and following, and you'll get autocompletion and type checking all the way through:

```js
const recentSubscriptions = await transactions._embedded['fx:customer']._links['fx:subscriptions'].follow('last').get();
```

## Development

To get started, clone this repo locally and install the dependencies:

```bash
git clone https://github.com/foxy/foxy-sdk.git && cd foxy-sdk && npm i
```

You can also build this package and test it locally in another project by running the following in the project folder:

```bash
npm pack
```

All the latest features are published from the [beta](https://github.com/Foxy/foxy-sdk/tree/beta) branch to the `beta` distribution channel. If you submit a PR, please target `beta` as well. Releases are published from [main](https://github.com/Foxy/foxy-sdk/tree/main).
