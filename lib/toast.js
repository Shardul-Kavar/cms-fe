import { toast } from 'react-toastify';

// Convenience wrappers for consistent usage
export const toastSuccess = (msg, opts = {}) => toast.success(msg, opts);
export const toastError = (msg, opts = {}) => toast.error(msg, opts);
export const toastInfo = (msg, opts = {}) => toast.info(msg, opts);
export const toastWarn = (msg, opts = {}) => toast.warn(msg, opts);
