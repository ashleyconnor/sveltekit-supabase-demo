<script>
  import { supabase } from '$lib/supabaseClient';
  import { page, session } from '$app/stores';
  import { setAuthCookie } from '$lib/utils/session';

  import Header from '$lib/Header/index.svelte';
  import '../app.css';

  supabase.auth.onAuthStateChange(async (event, _session) => {
    if (event !== 'SIGNED_OUT') {
      session.set({ user: _session.user });
      await setAuthCookie(_session);
    }
  });
</script>

<Header />

<main>
  {#if $page.query.get('magic_link')}
    <span style="text-align: center;">Check your email for login link!</span>
  {/if}
  <slot />
</main>

<footer>
  <p>
    visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit
  </p>
  <h2>Session Data</h2>
  <pre>{JSON.stringify($session, null, 2)}</pre>
</footer>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  footer a {
    font-weight: bold;
  }

  footer pre {
    max-width: 1024px;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  @media (min-width: 480px) {
    footer {
      padding: 40px 0;
    }
  }
</style>
