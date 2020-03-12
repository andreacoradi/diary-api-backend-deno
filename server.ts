import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
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
    console.log(username, password);
    const user = await getUser(username);
    if (user) {
      ctx.response.status = 400;
      ctx.response.body = {
        msg: "User already exists"
      };
      return;
    }
    const token: any = await register(username, password);
    console.log(token);
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

    const pages = JSON.parse(body.value).pages;

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
app.use(router.routes());
app.use(router.allowedMethods());

const DEFAULT_PORT = 8080;

const argPort = parse(Deno.args).port;

const port = argPort ? Number(argPort) : DEFAULT_PORT;

console.log("Listening on http://localhost:" + port);
await app.listen({ port: port });
