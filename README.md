# sveltekit-supabase-demo

This repository demonstrates integrating [Supabase](https://supabase.io) authentication with [SvelteKit](https://kit.svelte.dev/).

## How

In order to make authenticated calls to Supabase within endpoints (server-side) we need to send the JWT to the server and respond with a cookie. We can do this in the `auth.onAuthStateChange()` callback:

```javascript
import { supabase } from '$lib/supabaseClient';
import { session } from '$app/stores';
import { setAuthCookie } from '$lib/utils/session';

import Header from '$lib/Header/index.svelte';
import '../app.css';

// this should probably live in your global __layout.svelte file
supabase.auth.onAuthStateChange(async (event, _session) => {
  if (event !== 'SIGNED_OUT') {
    session.set({ user: _session.user });
    await setAuthCookie(_session);
  } else {
    session.set({ user: { guest: true } });
    await unsetAuthCookie();
  }
});
```

The `setAuthCookie` makes a request to an endpoint with the JWT and responds with a cookie:

```javascript
// setAuthCookie
export async function setServerSession(event, session) {
  await fetch('/api/auth.json', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session })
  });
}

export const setAuthCookie = async (session) => await setServerSession('SIGNED_IN', session);
```

It's important to include the event as the `supabase-js` library expects it.

Our endpoint to set the cookie looks like this:

```javascript
export async function post(req /*, res: Response (read the notes below) */) {
  // Unlike, Next.js API handlers you don't get the response object here. As a result, you cannot invoke the below method to set cookies on the responses.
  // await supabaseClient.auth.api.setAuthCookie(req, res);
  // `supabaseClient.auth.api.setAuthCookie(req, res)` is dependent on both the request and the responses
  // `req` used to perform few validations before setting the cookies
  // `res` is used for setting the cookies
  return {
    status: 200,
    body: null
  };
}
```

You're probably thinking "where is the cookie set?" - that has to be done in a [`hook`](https://kit.svelte.dev/docs#hooks) because we don't have access to the response object to pass to the `supabase.auth.setAuthCookie` function.

Our `hooks.js` file then looks like this:

```javascript
export const handle = async ({ request, resolve }) => {
  // Parses `req.headers.cookie` adding them as attribute `req.cookies, as `auth.api.getUserByCookie` expects parsed cookies on attribute `req.cookies`
  const expressStyleRequest = toExpressRequest(request);
  // We can then fetch the authenticated user using this cookie
  const { user } = await auth.api.getUserByCookie(expressStyleRequest);

  // Add the user and the token to our locals so they are available on all SSR pages
  request.locals.token = expressStyleRequest.cookies['sb:token'] || undefined;
  request.locals.user = user || { guest: true };

  // If we have a token, set the supabase client to use it so we can make authorized requests as that user
  if (request.locals.token) {
    supabase.auth.setAuth(request.locals.token);
  }

  //...<snip>

  let response = await resolve(request);

  // if auth request - set cookie in response headers
  if (request.method == 'POST' && request.path === '/api/auth.json') {
    auth.api.setAuthCookie(request, toExpressResponse(response));
    response = toSvelteKitResponse(response);
  }

  return response;
};
```

It's probably possible to do this in the endpoint itself as we can set cookies on the response object of an endpoint:

```javascript
const token = "token"
const cookie = `sb:token=${token}; Path=/; Secure; HttpOnly; Max-Age=2592000; etc...`

return {
	headers: {
		'set-cookie': [cookie]
	}
}
```

The reason I would not do this is that if the client javascript library changes then we will have to update our endpoint to match.


## Issues

This works but it isn't ideal for the following reasons:

1. Supabase stores the refresh token in `localstorage` which makes it vulnerable to [XSS](https://owasp.org/www-community/attacks/xss/). This is done so the `supabase-js` client library can refresh the token on the users behalf.
2. There's no refresh mechanism on a SSR request.
3. It doesn't follow the best practices for [JWTs on frontend clients](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/).

## Potential improvements

Any improvement will likely make Supbase Auth more difficult to use, so what I'm proposing would be opt in for users that want to improve their auth security.

1. Allow configuration of the refresh endpoint so we can proxy the request to Supabase ourselves. This would allow us to set a refresh token in a cookie and remove it from localstorage. There would need to be some extra security work in order to make sure a client wasn't sending the request directly to a Supabase auth endpoint.
2. Expose a function to generate the cookie using just the token. This would save us having to generate a fake Express-style request/response just to get the cookie.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.
