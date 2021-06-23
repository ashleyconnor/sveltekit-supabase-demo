import { supabase } from '$lib/supabaseClient';

// GET /todos.json
export const get = async (_) => {
  let { data } = await supabase.from('todos').select('*');
  return {
    body: data
  };
};

// POST /todos.json
export const post = async (request) => {
  const { data, error } = await supabase.from('todos').upsert({
    task: request.body.get('text'),
    is_complete: false,
    user_id: request.locals.user.id,
    inserted_at: new Date().toISOString()
  });

  if (!error && request.headers.accept !== 'application/json') {
    return {
      status: 303,
      headers: {
        location: '/todos'
      }
    };
  }

  return {
    body: data[0]
  };
};
