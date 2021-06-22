<script>
  import { supabase } from "$lib/supabaseClient";

  let loading = false;

  let email;
  let password;

  async function registerUser() {
    loading = true
    let { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) { alert(error); return }

    userStore.set({user})
    loading = false
  }
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<form on:submit|preventDefault={registerUser}>
  <div>
    <label for="email">Email</label>
    <input id="email" type="email" autocomplete="email" required bind:value={email} />
  </div>
  <div>
    <label for="password">Password</label>
    <input
      id="password"
      type="password"
      required
      bind:value={password}
    />
  </div>

  <div>
    <input type="submit" class="button block primary" value={loading ? 'Loading ...' : 'Register'} disabled={loading}/>
  </div>
</form>
