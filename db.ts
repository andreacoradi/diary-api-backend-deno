import { readJson, writeJson, exists } from "https://deno.land/std@v0.38.0/fs/mod.ts";

const DB_URL = "./db.json"

const initialize_db = async () => {
  await writeJson(DB_URL, { users: [] })
}

const getData = async (): Promise<object> => {
  if(!await exists(DB_URL)) {
    await initialize_db()
  }
  return  await readJson(DB_URL) as object
};

const writeData = async (data: any): Promise<void> => {
  await writeJson(DB_URL, data)
};

export const addUser = async (user: any) => {
  const db: any = await getData();
  db["users"].push(user);
  writeData(db);
};

export const addPages = async (username: string, pages: Array<object>) => {
  const db: any = await getData();
  db["users"].forEach((user: any) => {
    if (user.username === username) {
      pages.forEach(p => {
        if (unique(user["pages"], p)) {
          user["pages"].push(p);
        }
      });
      return;
    }
  });
  writeData(db);
};

export const setPages = async (username: string, pages: Array<object>) => {
  const db: any = await getData();
  db["users"].forEach((user: any) => {
    if (user.username === username) {
      user["pages"] = pages;
      return;
    }
  });
  writeData(db);
};

const unique = (arr1: Array<any>, obj: any) => {
  let unique = true;
  arr1.forEach(t => {
    if (t.date === obj.date && t.content === obj.content) {
      unique = false;
      return;
    }
  });
  return unique;
};

export const getUser = async (username: string) => {
  const db: any = await getData();
  let user = null;
  db["users"].forEach((u: any) => {
    if (u.username === username) {
      user = u;
      return;
    }
  });
  return user;
};
