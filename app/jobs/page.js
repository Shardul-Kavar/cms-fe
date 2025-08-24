// app/jobs/page.js
// Updated Title column to pack {category} {priority} {status} on first line, and title on second line,
// optimized for small screens.

"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Layout,
  Table,
  Input,
  Space,
  Typography,
  Descriptions,
  Button,
  Tag,
  Flex,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";
import AppHeader from "@/components/AppHeader";
import api from "@/lib/axios";
import Protected from "@/components/Protected";
import { ApiRoute, Pagination } from "@/lib/enums";
import { formatDate, fromNow } from "@/utils/formatDate";

const { Content } = Layout;
const { Title } = Typography;

function statusColor(s) {
  switch (s) {
    case "NEW":
      return "default";
    case "APPROVED":
      return "purple";
    case "SCHEDULED":
      return "cyan";
    case "IN_PROGRESS":
      return "gold";
    case "COMPLETED":
    case "DONE":
      return "green";
    case "CANCELLED":
      return "red";
    default:
      return "default";
  }
}

function priorityColor(p) {
  switch (p) {
    case "LOW":
      return "default";
    case "MEDIUM":
      return "blue";
    case "HIGH":
      return "orange";
    case "URGENT":
      return "red";
    default:
      return "default";
  }
}

function categoryColor(c) {
  switch (c) {
    case "AC":
      return "blue";
    case "FRIDGE":
      return "geekblue";
    case "WASHING_MACHINE":
      return "volcano";
    default:
      return "default";
  }
}

function fullName(obj) {
  if (!obj) return "";
  if (obj.name) return obj.name;
  const ln = obj.lastName || "";
  const fn = obj.firstName || "";
  return `${ln} ${fn}`.trim();
}

export default function JobsPage() {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const columns = useMemo(() => {
    return [
      {
        title: "Title",
        key: "titlePacked",
        ellipsis: true,
        render: (_, r) => (
          <div className="job-title-packed">
            <div className="job-title-packed__meta">
              <Tag color={categoryColor(r.category)}>{r.category}</Tag>
              <Tag color={priorityColor(r.priority)}>{r.priority}</Tag>
              <Tag color={statusColor(r.status)}>{r.status}</Tag>
            </div>
            <div className="job-title-packed__title" title={r.title}>
              {r.title}
            </div>
          </div>
        ),
      },
      {
        title: "Customer",
        key: "customer",
        render: (_, r) => {
          const name = fullName(r.customer);
          const phone = r.customer?.phone ? ` • ${r.customer.phone}` : "";
          return name ? `${name}${phone}` : r.customerId || "-";
        },
        ellipsis: true,
      },
      {
        title: "Technician",
        key: "technician",
        render: (_, r) => fullName(r.technician) || r.assignedTo || "-",
        ellipsis: true,
      },
      {
        title: "Scheduled",
        dataIndex: "scheduledAt",
        key: "scheduledAt",
        render: (v) => (v ? `${formatDate(v)} (${fromNow(v)})` : "-"),
        width: 220,
      },
      {
        title: "",
        key: "expand-action",
        align: "right",
        width: 56,
        render: (_, record) => {
          const isExpanded = expandedRowKeys.includes(record.id);
          const Icon = isExpanded ? MinusSquareOutlined : PlusSquareOutlined;
          return (
            <Icon
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedRowKeys((prev) =>
                  prev.includes(record.id)
                    ? prev.filter((k) => k !== record.id)
                    : [...prev, record.id]
                );
              }}
            />
          );
        },
      },
    ];
  }, [expandedRowKeys]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ApiRoute.JOBS}?page=1&limit=1000`);
      const rows = res.data?.rows ?? res.data?.items ?? res.data ?? [];
      const normalized = Array.isArray(rows) ? rows : [];
      setAllData(normalized);
      applyFilter(search, normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = (query, baseOverride = null) => {
    const base = Array.isArray(baseOverride) ? baseOverride : allData;
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFiltered(base);
      setTotal(base.length);
      return;
    }
    const result = base.filter((r) => {
      const title = String(r.title || "").toLowerCase();
      const category = String(r.category || "").toLowerCase();
      const status = String(r.status || "").toLowerCase();
      const priority = String(r.priority || "").toLowerCase();
      const custName = fullName(r.customer).toLowerCase();
      const custPhone = String(r.customer?.phone || "").toLowerCase();
      const custEmail = String(r.customer?.email || "").toLowerCase();
      const techName = fullName(r.technician).toLowerCase();
      return (
        title.includes(q) ||
        category.includes(q) ||
        status.includes(q) ||
        priority.includes(q) ||
        custName.includes(q) ||
        custPhone.includes(q) ||
        custEmail.includes(q) ||
        techName.includes(q)
      );
    });
    setFiltered(result);
    setTotal(result.length);
  };

  const onSearch = (value) => {
    setSearch(value);
    applyFilter(value);
  };

  return (
    <Protected>
      <Layout>
        <AppHeader />
        <Content className="container">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Flex justify="space-between" align="center" wrap>
              <Title level={4} style={{ margin: 0 }}>
                Jobs
              </Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {}}>
                Add Job
              </Button>
            </Flex>

            <Input.Search
              placeholder="Search by title, category, status, priority, customer, technician"
              allowClear
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                applyFilter(v);
              }}
              onSearch={onSearch}
              enterButton
            />

            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={filtered}
              expandable={{
                expandedRowRender: (r) => (
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Descriptions size="small" bordered column={2} labelStyle={{ width: 180 }}>
                      <Descriptions.Item label="Title" span={2}>
                        {r.title}
                      </Descriptions.Item>
                      <Descriptions.Item label="Category">
                        <Tag color={categoryColor(r.category)}>{r.category}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        <Tag color={statusColor(r.status)}>{r.status}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Priority">
                        <Tag color={priorityColor(r.priority)}>{r.priority}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Scheduled At" span={2}>
                        {r.scheduledAt
                          ? `${formatDate(r.scheduledAt)} (${fromNow(r.scheduledAt)})`
                          : "-"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Customer" span={2}>
                        {fullName(r.customer) || r.customerId || "-"}{" "}
                        {r.customer?.phone ? `• ${r.customer.phone}` : ""}{" "}
                        {r.customer?.email ? `• ${r.customer.email}` : ""}
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Address Line 1">
                        {r.serviceAddressLine1 || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Address Line 2">
                        {r.serviceAddressLine2 || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Area">
                        {r.serviceArea || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Service Pincode">
                        {r.servicePincode || "-"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Technician">
                        {fullName(r.technician) || r.assignedTo || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created By">
                        {fullName(r.created) || r.createdBy || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Updated By">
                        {fullName(r.updated) || r.updatedBy || "-"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Created At">
                        {r.createdAt
                          ? `${formatDate(r.createdAt)} (${fromNow(r.createdAt)})`
                          : "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Updated At">
                        {r.updatedAt
                          ? `${formatDate(r.updatedAt)} (${fromNow(r.updatedAt)})`
                          : "-"}
                      </Descriptions.Item>

                      <Descriptions.Item label="Description" span={2}>
                        {r.description || "-"}
                      </Descriptions.Item>
                    </Descriptions>

                    <Button icon={<EditOutlined />} onClick={() => {}}>
                      Edit
                    </Button>
                  </Space>
                ),
                expandIconColumnIndex: -1,
                expandedRowKeys,
                onExpandedRowsChange: setExpandedRowKeys,
              }}
              pagination={{
                total,
                defaultPageSize: Pagination?.DEFAULT_PAGE_SIZE || 10,
                showSizeChanger: true,
              }}
              scroll={{ x: true }}
            />
          </Space>
        </Content>
      </Layout>
    </Protected>
  );
}
