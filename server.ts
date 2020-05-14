import { Application, Router } from "https://deno.land/x/oak@v4.0.0/mod.ts";
import { parse } from "https://deno.land/std@v0.51.0/flags/mod.ts";
import { getUser, addUser, addPages, setPages } from "./db.ts";
import { auth, register } from "./auth.ts";

const router = new Router();

router
  .get("/api", ctx => {
    ctx.response.body = "It works!";
  })
  .post("/api", async ctx => {
    let body;
    try {
      body = (await ctx.request.body());
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "Invalid body format"
      };
      return;
    }

    const { username, password } = body.value;
    const user = await getUser(username);
    if (user) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "User already exists"
      };
      return;
    }
    const token: any = await register(username, password);
    if(!token) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "You need to provide a token"
      };
      return;
    }
    if (token.msg) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: token.msg
      };
      return;
    }

    await addUser({ username, pages: [] });

    ctx.response.body = { jwt: token };
  })
  .get("/api/pages", async ctx => {
    const token = ctx.request.headers.get("x-access-token");
    if (!token) {
      ctx.response.status = 403;
      ctx.response.body = {
        msg: "Token not provided"
      };
      return;
    }
    const username = await auth(token);

    const user = await getUser(username);

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = {
        msg: "No user found"
      };
      return;
    }
    ctx.response.body = user;
  })
  .post("/api/pages", async ctx => {
    const token = ctx.request.headers.get("x-access-token");

    if (!token) {
      ctx.response.status = 403;
      ctx.response.body = {
        msg: "Token not provided"
      };
      return;
    }
    let body;
    try {
      body = (await ctx.request.body());
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "Invalid body format"
      };
      return;
    }
    const username = await auth(token);
    const user = await getUser(username);
    if (!user) {
      await addUser({
        username,
        pages: []
      });
    }
    //console.log("BODY", body.value)
    const pages = body.value.pages;

    if (!pages) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "You need to provide pages"
      };
      return;
    }
    await setPages(username, pages);

    ctx.response.body = {
      msg: "success"
    };
  });

const app = new Application();
app.use(async (ctx, next) => {
  ctx.response.headers.append("access-control-allow-origin", "*");
  ctx.response.headers.append(
    "access-control-allow-headers",
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept, Range"
  );
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());

const DEFAULT_PORT = 8080;
const argPort = Deno.env.get("PORT");
const port = argPort ? Number(argPort) : DEFAULT_PORT;

const address = `0.0.0.0:${port}`

console.log(`Listening on http://${address}`);
await app.listen(address);