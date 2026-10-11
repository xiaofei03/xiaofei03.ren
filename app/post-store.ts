import { storedPost, storedPosts } from "@/server/storage";
export async function listPosts(all=false){return storedPosts(all);}
export async function findPost(id:string,all=false){return storedPost(id,all);}
