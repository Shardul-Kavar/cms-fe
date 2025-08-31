// lib/customers.js
import api from "@/lib/axios";
import { ApiRoute } from "@/lib/enums";

// Add customer (matches your curl to POST /api/customer/add)
export async function addCustomer(payload) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE || ""}${
    ApiRoute.CUSTOMERS
  }/add`;
  const res = await api.post(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// Update customer (matches your curl to PUT /api/customer/update/:id)
export async function updateCustomer(id, payload) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE || ""}${
    ApiRoute.CUSTOMERS
  }/update/${id}`;
  const res = await api.put(url, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}
