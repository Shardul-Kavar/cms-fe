// app/login/page.js (use toast on success/failure)
"use client";

import React, { useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { toastSuccess } from "@/lib/toast";
import { ApiRoute, CookieName } from "@/lib/enums";
import { setCookie } from "@/lib/cookies-client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post(`${ApiRoute.USER}/login`, values);
      console.log("🚀 ~ onFinish ~ res:", res);
      const token = res.data?.token;
      if (!token) throw new Error("No token returned");

      setCookie(CookieName.USER, res.data);
      setCookie(CookieName.TOKEN, res.data.token);

      toastSuccess("Logged in successfully");
      const from = params.get("from") || "/customers";
      router.replace(from);
    } catch (e) {
      console.log("🚀 ~ onFinish ~ e:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Sign in
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="email@example.com" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
