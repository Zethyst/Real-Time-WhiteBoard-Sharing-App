"use server";
import fs from "fs/promises";

export const submitAction = async (e:any) => {
  console.log(e.get("name"), e.get("email"));
  await fs.writeFile(
    "Dummy.txt",
    `Name is ${e.get("name")} and Email is ${e.get("email")}`
  );
};
