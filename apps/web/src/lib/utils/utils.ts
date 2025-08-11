import { toast } from "react-toastify";
import ToastType from "../types/toastType";

export function validEmail(email: string): boolean {
  return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) !== null;
}

export function validPassword(password: string): boolean {
  // at least 8 characters, 1 letter and 1 number and 1 special character
  return (
    password.match(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    ) !== null
  );
}

/**
 *  Fill parameter in a url string
 *
 * @param url the url to be filled
 * @param parameter named parameter in the url
 * @param value value to fill into the parameter
 * @returns the filled url
 *
 * @example
 * fillUrlParameter('/admin/accounts/[id]/activate', 'id', '1') // /admin/accounts/1/activate
 */
export const fillUrlParameter = (
  url: string,
  parameter: string,
  value: string,
) => {
  return url.replace("[" + parameter + "]", value);
};

/**
 * Copies text to clipboard and displays a toast message if specified.
 *
 * @param text the text to be copied to clipboard
 * @param showToast display toast message
 * @param displayText the text to be displayed in the toast message
 * @param type the type of toast message
 *
 * @return void
 *
 * @example
 * copyToClipboard('hello world', true, 'Copied to clipboard', 'info')
 *
 */
export const copyToClipboard = (
  text: string,
  showToast: boolean = true,
  displayText: string = "Copied to clipboard",
  type: ToastType = "info",
) => {
  navigator.clipboard.writeText(text);

  if (showToast) {
    switch (type) {
      case "success":
        toast.success(displayText);
        break;
      case "error":
        toast.error(displayText);
        break;
      case "warning":
        toast.warning(displayText);
        break;
      default:
        toast.info(displayText);
        break;
    }
  }
};

/**
 *  Converts a string to title case
 *
 * @param text the text to be converted to title case
 * @returns the converted text
 *
 * @example
 * titleCase('hello world') // Hello World
 */

export const firstCharUpperCase = (text: string) => {
  if (!text) {
    return "";
  }

  const words = text.split(" ");
  const result = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );
  return result.join(" ");
};

export const formatter = (currencyCodeDisplay: boolean) => {
  return new Intl.NumberFormat("en-US", {
    style: currencyCodeDisplay ? "currency" : "decimal",
    currency: "USD",
    currencyDisplay: currencyCodeDisplay ? "code" : undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

export const formatCurrency = (value: string): string => {
  if (value === "NaN" || !value) return "0.00";
  const [integer, decimal] = value.split(".");
  const integerFormatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalFormatted = decimal ? decimal.slice(0, 2) : "00";
  return `${integerFormatted}.${decimalFormatted}`;
};

export const formatToLocalDateTime = (datetime?: Date) => {
  if (!datetime) {
    return "";
  }
  const date = new Date(
    datetime.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const formattedDateTime = `${year}-${month}-${day}, ${hours}:${minutes}`;
  return formattedDateTime;
};

export const formatToLocalDate = (datetime?: Date) => {
  if (!datetime) {
    return "";
  }
  const date = new Date(
    datetime.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

export const formatToUTCDate = (datetime?: Date) => {
  if (!datetime) {
    return "";
  }

  const year = datetime.getUTCFullYear();
  const month = String(datetime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(datetime.getUTCDate()).padStart(2, "0");
  const hours = String(datetime.getUTCHours()).padStart(2, "0");
  const minutes = String(datetime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(datetime.getUTCSeconds()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
};

export const exportCSVFile = (
  fileTitle: string,
  items: Object[],
  headers?: string[],
  totalDeposit?: number | string,
  totalWithdrawal?: number | string,
  totalReceived?: number | string,
  returnAsString?: boolean, // New parameter to determine whether to return the CSV content as a string
) => {
  let csv = "";

  if (headers && headers.length > 0) {
    csv += headers.join(",") + "\n";
  }

  items.forEach((item: Object) => {
    const row = Object.values(item).map((value: any) => {
      if (typeof value === "string") {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += row.join(",") + "\n";
  });

  if (totalDeposit) {
    if (headers) {
      csv += "\n";
      for (let i = 3; i <= headers.length || 0; i++) {
        csv += ",";
      }
    }
    csv += `Total Deposit,${totalDeposit}\n`;
  }

  if (totalWithdrawal) {
    if (headers) {
      for (let i = 3; i <= headers.length || 0; i++) {
        csv += ",";
      }
    }
    csv += `Total Withdrawal,${totalWithdrawal}\n`;
  }

  if (totalReceived) {
    if (headers) {
      for (let i = 3; i <= headers.length || 0; i++) {
        csv += ",";
      }
    }
    csv += `Total Received Deposit,${totalReceived}\n`;
  }

  if (returnAsString) {
    return csv; // Return the CSV content as a string if the parameter is true
  }

  const exportedFilename = fileTitle + ".csv" || "export.csv";

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", exportedFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
