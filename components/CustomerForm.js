// components/CustomerForm.js
'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Row, Col } from 'antd';

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  houseNumber: '',
  addressLine1: '',
  addressLine2: '',
  area: '',
  pincode: '',
  isActive: true,
};

export default function CustomerForm({
  open,
  onCancel,
  onSubmit, // async (values, mode, id?)
  mode = 'add', // 'add' | 'edit'
  initialValues = null, // record when editing
  confirming = false,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          ...INITIAL_VALUES,
          ...initialValues,
        });
      } else {
        form.setFieldsValue(INITIAL_VALUES);
      }
    }
  }, [open, mode, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values, mode, initialValues?.id);
    } catch (e) {
      // validation errors are shown by antd
    }
  };

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Update Customer' : 'Add Customer'}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'edit' ? 'Update' : 'Add'}
      confirmLoading={confirming}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={INITIAL_VALUES}
      >
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
              <Input placeholder="Phone" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: 'email', message: 'Invalid email' }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={8}>
            <Form.Item label="House No." name="houseNumber">
              <Input placeholder="House no." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16}>
            <Form.Item label="Area" name="area">
              <Input placeholder="Area / Locality" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Address Line 1" name="addressLine1">
          <Input placeholder="Address line 1" />
        </Form.Item>

        <Form.Item label="Address Line 2" name="addressLine2">
          <Input placeholder="Address line 2" />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item label="Pincode" name="pincode">
              <Input placeholder="Pincode" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
