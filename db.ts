const getData = async () => {
  const data = await Deno.readFile("./db.json");
  const decoder = new TextDecoder();
  const decodedData = decoder.decode(data);
  return JSON.parse(decodedData);
};

const writeData = async (data: any): Promise<void> => {
  const encoder = new TextEncoder();
  await Deno.writeFile("./db.json", encoder.encode(JSON.stringify(data)));
};

export const addUser = async (user: any) => {
  const db = await getData();
  db["users"].push(user);
  writeData(db);
};

export const addPages = async (username: string, pages: Array<object>) => {
  const db = await getData();
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
  const db = await getData();
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
  const db = await getData();
  let user = null;
  db["users"].forEach((u: any) => {
    if (u.username === username) {
      user = u;
      return;
    }
  });
  return user;
};
