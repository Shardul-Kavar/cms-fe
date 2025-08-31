// lib/jobs.js
import api from "@/lib/axios";
import { ApiRoute } from "@/lib/enums";

export async function addJob(payload) {
  const url = `${ApiRoute.JOBS}/add`;
  const { data } = await api.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function updateJob(id, payload) {
  const url = `${ApiRoute.JOBS}/update/${id}`;
  const { data } = await api.put(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}
