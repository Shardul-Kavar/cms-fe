"use client";

import React from "react";
import { Layout, Menu, Button, Grid } from "antd";
import {
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const screens = useBreakpoint();

  const items = [
    { key: "/customers", icon: <UserOutlined />, label: "Customers" },
    { key: "/jobs", icon: <ProfileOutlined />, label: "Jobs" },
  ];

  const selectedKeys = items
    .filter((i) => pathname && pathname.startsWith(i.key))
    .map((i) => i.key);

  const onClick = (e) => router.push(e.key);

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  const isAuthed = !!getToken();

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        paddingInline: screens.xs ? 8 : 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ color: "#fff", fontWeight: 600, marginRight: 12 }}>CMS</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        items={items}
        onClick={onClick}
        style={{ flex: 1, minWidth: 0 }}
      />
      {isAuthed && (
        <Button type="primary" icon={<LogoutOutlined />} onClick={logout}>
          Logout
        </Button>
      )}
    </Header>
  );
}
