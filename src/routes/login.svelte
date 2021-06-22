<script>
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";

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
      redirect = `${redirect}?magiclink=true`;
    }
    goto(redirect);
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<form on:submit|preventDefault={loginUser}>
  <h2>Login with Email Address and Password</h2>
  <div>
    <label for="email">Email</label>
    <input
      id="email"
      type="email"
      autocomplete="email"
      required
      bind:value={email}
    />
  </div>
  <div>
    <label for="password (optional)">Password</label>
    <input id="password" type="password" bind:value={password} />
  </div>

  <div>
    <input
      type="submit"
      class="button block primary"
      value={loading ? "Loading ..." : "Login"}
      disabled={loading}
    />
  </div>
</form>
