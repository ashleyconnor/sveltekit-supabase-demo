export async function setServerSession(event, session) {
  await fetch('/api/auth.json', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session })
  });
}

export const setAuthCookie = async (session) => await setServerSession('SIGNED_IN', session);
export const unsetAuthCookie = async () => await setServerSession('SIGNED_OUT', null);
