<script>
  import { goto } from "$app/navigation";
  import { supabase } from "$lib/supabaseClient";
  import { session } from "$app/stores";
  import { unsetAuthCookie } from "$lib/utils/session";

  async function signOut() {
    await supabase.auth.signOut();
    await unsetAuthCookie();
    session.set({ user: { guest: true } });
    goto("/");
  }
  signOut();
</script>

<svelte:head>
  <title>Logout</title>
</svelte:head>
