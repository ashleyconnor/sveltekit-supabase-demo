import { supabase } from '$lib/supabaseClient';

// PATCH /todos/:id.json
export const patch = async (request) => {
  if (!request.locals.user) {
    return { status: 401 };
  }

  const { data, error } = await supabase.from('todos').upsert({
    id: request.params.id,
    task: request.body.get('task'),
    is_complete: request.body.get('is_complete'),
    user_id: request.locals.user.id
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

// DELETE /todos/:id.json
export const del = async (request) => {
  if (!request.locals.user) {
    return { status: 401 };
  }

  const { data, error } = await supabase.from('todos').delete().match({
    id: request.params.id,
    user_id: request.locals.user.id
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
