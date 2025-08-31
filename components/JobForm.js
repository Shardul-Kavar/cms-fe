// components/JobForm.js
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Modal, Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import api from "@/lib/axios";
import { ApiRoute } from "@/lib/enums";

const { TextArea } = Input;

// debounce hook same as before...
function useDebouncedCallback(fn, delay) {
  const fnRef = useRef(fn);
  const timerRef = useRef(null);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  const debounced = useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  );
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );
  return debounced;
}

const INITIAL = {
  category: "WASHING_MACHINE",
  title: "",
  description: "",
  status: "NEW",
  priority: "LOW",
  scheduledAt: dayjs().add(1, "hour"),
  customerId: undefined,
  assignedTo: undefined,
};

export default function JobForm({
  open,
  onCancel,
  onSubmit, // async (values, mode, id?)
  onSuccess, // NEW: callback to notify parent to refresh
  mode = "add",
  initialValues,
  confirming = false,
  categories = ["AC", "FRIDGE", "WASHING_MACHINE"],
  statuses = [
    "NEW",
    "APPROVED",
    "SCHEDULED",
    "IN_PROGRESS",
    "DONE",
    "COMPLETED",
    "CANCELLED",
  ],
  priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"],
}) {
  const [form] = Form.useForm();
  const [customerOpts, setCustomerOpts] = useState([]);
  const [techOpts, setTechOpts] = useState([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(false);
  const [fetchingTechs, setFetchingTechs] = useState(false);

  const normalizedInitial = useMemo(() => {
    if (!initialValues) return INITIAL;
    return {
      ...INITIAL,
      ...initialValues,
      scheduledAt: initialValues.scheduledAt
        ? dayjs(initialValues.scheduledAt)
        : INITIAL.scheduledAt,
      customerId: initialValues.customerId ?? INITIAL.customerId,
      assignedTo: initialValues.assignedTo ?? INITIAL.assignedTo,
      category: initialValues.category ?? INITIAL.category,
    };
  }, [initialValues]);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValues) {
      form.setFieldsValue(normalizedInitial);
    } else {
      form.setFieldsValue(INITIAL);
    }
  }, [open, mode, initialValues, normalizedInitial, form]);

  const fetchCustomers = useCallback(async (q) => {
    setFetchingCustomers(true);
    try {
      const res = await api.get(`${ApiRoute.CUSTOMERS}`, {
        params: { page: 1, limit: 20, ...(q ? { phone: q } : {}) },
      });
      const rows = res.data?.rows ?? res.data?.items ?? res.data ?? [];
      setCustomerOpts(
        rows.map((c) => ({
          label:
            `${c.lastName || ""} ${c.firstName || ""}`.trim() +
            (c.phone ? ` • ${c.phone}` : ""),
          value: c.id,
        }))
      );
    } finally {
      setFetchingCustomers(false);
    }
  }, []);

  const fetchTechnicians = useCallback(async (q) => {
    setFetchingTechs(true);
    try {
      const res = await api.get(`/user`, {
        params: { page: 1, limit: 20, role: "TECHNICIAN" },
      });
      const rows = res.data?.rows ?? res.data?.items ?? res.data ?? [];
      setTechOpts(
        rows.map((u) => ({
          label:
            u.name ||
            `${u.lastName || ""} ${u.firstName || ""}`.trim() ||
            u.email,
          value: u.id,
        }))
      );
    } finally {
      setFetchingTechs(false);
    }
  }, []);

  const debouncedFetchCustomers = useDebouncedCallback(fetchCustomers, 500);
  const debouncedFetchTechnicians = useDebouncedCallback(fetchTechnicians, 500);

  useEffect(() => {
    if (open) fetchTechnicians("");
  }, [open, fetchTechnicians]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(
        {
          ...values,
          scheduledAt: values.scheduledAt
            ? values.scheduledAt.toISOString()
            : null,
        },
        mode,
        initialValues?.id
      );
      // Notify parent to refresh latest jobs when create/update succeeds
      if (typeof onSuccess === "function") {
        onSuccess(); // parent will re-fetch
      }
    } catch {
      // validation errors handled by antd
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Update Job" : "Add Job"}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === "edit" ? "Update" : "Add"}
      confirmLoading={confirming}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={INITIAL}>
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true }]}
        >
          <Select
            options={categories.map((c) => ({ value: c, label: c }))}
            showSearch
            optionFilterProp="label"
            placeholder="Select category"
          />
        </Form.Item>

        <Form.Item label="Customer (optional)" name="customerId">
          <Select
            showSearch
            allowClear
            placeholder="Search customer by phone or name"
            filterOption={false}
            onSearch={(q) => debouncedFetchCustomers(q)}
            loading={fetchingCustomers}
            options={customerOpts}
          />
        </Form.Item>

        <Form.Item
          label="Technician"
          name="assignedTo"
          rules={[{ required: true, message: "Please select a technician" }]}
        >
          <Select
            showSearch
            placeholder="Search technician by name/email"
            filterOption={false}
            onSearch={(q) => debouncedFetchTechnicians(q)}
            loading={fetchingTechs}
            options={techOpts}
          />
        </Form.Item>

        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input placeholder="Job title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <TextArea placeholder="Describe the job" autoSize={{ minRows: 3 }} />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select options={statuses.map((s) => ({ value: s, label: s }))} />
        </Form.Item>

        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true }]}
        >
          <Select options={priorities.map((p) => ({ value: p, label: p }))} />
        </Form.Item>

        <Form.Item label="Scheduled At" name="scheduledAt">
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="Select date & time"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
