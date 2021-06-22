<script>
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";
  import SocialLogin from "$lib/SocialLogin/index.svelte";

  let loading = false;

  let email;
  let password;

  async function loginUser() {
    loading = true;
    let { error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      alert(error);
      return;
    }
    loading = false;

    let redirect = $page.query.get("redirect") || "/";
    if (!password) {
      redirect = `${redirect}?magic_link=true`;
    }
    goto(redirect);
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="content">
  <h1>Login</h1>

  <SocialLogin />

  <form on:submit|preventDefault={loginUser}>
    <div>
      <input
        id="email"
        type="email"
        autocomplete="email"
        placeholder="Email"
        required
        bind:value={email}
      />
    </div>
    <div>
      <input
        id="password"
        type="password"
        placeholder="Password (optional)"
        bind:value={password}
      />
    </div>

    <div>
      <button type="submit" class="submit" disabled={loading}>
        {loading ? "Loading ..." : "Log In"}
      </button>
    </div>

    <div>
      <a sveltekit:prefetch href="/register">No account? Register here</a>
    </div>
  </form>
</div>

<style>
  .content {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;
  }

  .submit {
    border-radius: 20px;
    border: 1px solid var(--accent-color);
    background-color: var(--accent-color);
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
    cursor: pointer;
  }
</style>
