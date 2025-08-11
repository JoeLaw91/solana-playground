type ToastTypeOptions = {
  success: "success";
  error: "error";
  warning: "warning";
  info: "info";
};

type ToastType = keyof ToastTypeOptions;

export default ToastType;
