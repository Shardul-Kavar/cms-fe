'use client';

import React from 'react';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: { borderRadius: 8, fontSize: 14 },
          }}
        >
          <AntdApp>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </AntdApp>
        </ConfigProvider>
      </body>
    </html>
  );
}
