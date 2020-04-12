const AUTH_SERVER = "https://denoauth.tk/";
// const AUTH_SERVER = "http://localhost:4000/";

export const auth = async (token: string) => {
  return (await fetch(
    AUTH_SERVER + "auth",
    { headers: { "x-access-token": token } }
  )
    .then(r => r.json())
    .then(b => b.username))
    .catch((e: any) => {
      console.error(e)
    });
};

export const register = async (username: string, password: string) => {
  let failed: any;
  let token: any;
  const body = { username, password };
  (await fetch(AUTH_SERVER + "users", {
    method: "POST",
    body: JSON.stringify(body)
  })
    .then(async r => r.json())
    .then(b => {
      if (b.msg) {
        failed = b;
      }
    }).catch(e => {
      console.error(e)
    }));
  if (failed) {
    console.log("FAILED1");
    return failed;
  }
  (await fetch(AUTH_SERVER + "users/" + username, {
    method: "POST",
    body: JSON.stringify({ password })
  })
    .then(r => r.json())
    .then(b => {
      if (b.msg) {
        failed = b;
      } else {
        token = b.jwt;
      }
    }).catch(e => {
      console.error(e)
    }));
  if (failed) {
    console.log("FAILED2");
    return failed;
  }

  return token;
};
