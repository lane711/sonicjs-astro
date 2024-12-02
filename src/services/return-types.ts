export const return200 = (data: any = []) => {
  return new Response(
    JSON.stringify({
      data
    }),
    { status: 200 }
  );
};

export const return201 = (message = 'Record Created') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 201 }
  );
};

export const return204 = (message = 'Record Deleted') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 201 }
  );
};

export const return400 = (message = 'Unauthorized') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 400 }
  );
};

export const return401 = (message = 'Unauthorized') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 401 }
  );
};

export const return404 = (message = 'Not Found') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 404 }
  );
};

export const return500 = (message: any = 'Internal Server Error') => {
  return new Response(
    JSON.stringify({
      message
    }),
    { status: 500 }
  );
};
