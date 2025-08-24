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
  Flex,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";
import api from "@/lib/axios";
import AppHeader from "@/components/AppHeader";
import Protected from "@/components/Protected";
import CustomerForm from "@/components/CustomerForm";
import { addCustomer, updateCustomer } from "@/lib/customers";
import { ApiRoute, Pagination } from "@/lib/enums";
import { toastSuccess } from "@/lib/toast";
import { formatDate, fromNow } from "@/utils/formatDate";

const { Content } = Layout;
const { Title } = Typography;

export default function CustomersPage() {
  const [allData, setAllData] = useState([]); // full dataset fetched once
  const [filtered, setFiltered] = useState([]); // filtered dataset
  const [total, setTotal] = useState(0); // total rows after filtering
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // search text
  const [expandedRowKeys, setExpandedRowKeys] = useState([]); // control expansion

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' | 'edit'
  const [formInitial, setFormInitial] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const columns = useMemo(() => {
    return [
      {
        title: "Name",
        key: "name",
        render: (_, record) =>
          `${record.lastName || ""} ${record.firstName || ""}`.trim(),
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
      },
      // Custom expand-toggle icon on the right
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
      const res = await api.get(`${ApiRoute.CUSTOMERS}?page=1&limit=1000`);
      const rows = res.data?.rows ?? res.data?.items ?? res.data ?? [];
      const normalized = Array.isArray(rows) ? rows : [];
      setAllData(normalized);
      // Do not overwrite search; re-apply existing search to keep view consistent
      applyFilter(search, normalized); // FIX: apply current search to fresh data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply search filter to either provided base (newAll) or current allData
  const applyFilter = (query, newAll = null) => {
    const base = Array.isArray(newAll) ? newAll : allData;
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setFiltered(base);
      setTotal(base.length);
      return;
    }
    const result = base.filter((r) => {
      const name = `${r.lastName || ""} ${r.firstName || ""}`.toLowerCase();
      const phone = String(r.phone || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
    setFiltered(result);
    setTotal(result.length);
  };

  const onSearch = (value) => {
    setSearch(value);
    applyFilter(value);
  };

  const openAddForm = () => {
    setFormMode("add");
    setFormInitial(null);
    setFormOpen(true);
  };

  const openEditForm = (record) => {
    setFormMode("edit");
    setFormInitial(record);
    setFormOpen(true);
  };

  // Helper: immutable patch for updated or newly added customer in allData
  const patchAllDataUpsert = (item) => {
    setAllData((prev) => {
      const idx = prev.findIndex((r) => r.id === item.id);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...prev[idx], ...item };
      } else {
        next = [item, ...prev]; // prepend new item; adjust as needed
      }
      // Re-apply current filter on the new base to update filtered view
      applyFilter(search, next); // FIX: keep current search and update filtered
      return next;
    });
  };

  const handleFormSubmit = async (values, mode, id) => {
    setConfirming(true);
    try {
      if (mode === "edit" && id) {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          houseNumber: values.houseNumber,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          area: values.area,
          pincode: values.pincode,
          isActive: values.isActive,
        };
        await updateCustomer(id, payload);
        toastSuccess("Customer updated");

        // Optimistically patch the updated record locally so UI reflects instantly
        patchAllDataUpsert({ id, ...payload }); // FIX: immediate UI reflect without clearing search
      } else {
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          email: values.email,
          houseNumber: values.houseNumber,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          area: values.area,
          pincode: values.pincode,
          isActive: values.isActive,
        };
        const created = await addCustomer(payload);
        toastSuccess("Customer added");

        // Some APIs return the created object; if not, we can synthesize minimal id if provided.
        // Prefer the server response; fallback to payload (without id won't help expansions).
        const newItem = created?.id ? created : { ...payload, id: crypto.randomUUID?.() || String(Date.now()) };
        patchAllDataUpsert(newItem); // FIX: reflect new item immediately with current search
      }

      setFormOpen(false);

      // Optional: refresh from server in background to stay consistent
      // but do NOT clear search or expanded rows
      // await fetchAll(); // Not necessary if optimistic patch is enough
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Protected>
      <Layout>
        <AppHeader />
        <Content className="container">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Flex justify="space-between" align="center" wrap>
              <Title level={4} style={{ margin: 0 }}>
                Customers
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddForm}
              >
                Add Customer
              </Button>
            </Flex>

            <Input.Search
              placeholder="Search by name or phone"
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
                expandedRowRender: (record) => (
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Descriptions
                      size="small"
                      bordered
                      column={1}
                      labelStyle={{ width: 160 }}
                    >
                      <Descriptions.Item label="ID">
                        {record.id}
                      </Descriptions.Item>
                      <Descriptions.Item label="First Name">
                        {record.firstName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Name">
                        {record.lastName}
                      </Descriptions.Item>
                      <Descriptions.Item label="Phone">
                        {record.phone}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        {record.email}
                      </Descriptions.Item>
                      <Descriptions.Item label="House No.">
                        {record.houseNumber}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address Line 1">
                        {record.addressLine1}
                      </Descriptions.Item>
                      <Descriptions.Item label="Address Line 2">
                        {record.addressLine2}
                      </Descriptions.Item>
                      <Descriptions.Item label="Area">
                        {record.area}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pincode">
                        {record.pincode}
                      </Descriptions.Item>
                      <Descriptions.Item label="Active">
                        {record.isActive ? "Yes" : "No"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created At">
                        {formatDate(record.createdAt)} ({fromNow(record.createdAt)})
                      </Descriptions.Item>
                      <Descriptions.Item label="Updated At">
                        {formatDate(record.updatedAt)} ({fromNow(record.updatedAt)})
                      </Descriptions.Item>
                    </Descriptions>

                    <Button
                      icon={<EditOutlined />}
                      onClick={() => openEditForm(record)}
                    >
                      Edit
                    </Button>
                  </Space>
                ),
                expandIconColumnIndex: -1, // hide default expand icon column
                expandedRowKeys,           // keep current expanded rows
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

      <CustomerForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialValues={formInitial}
        confirming={confirming}
      />
    </Protected>
  );
}
