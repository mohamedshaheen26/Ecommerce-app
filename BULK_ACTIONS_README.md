# Bulk Actions in Table Component

## Overview

The Table component now supports bulk actions, allowing users to select multiple rows and perform actions on them simultaneously.

## Features

- ✅ Select individual rows with checkboxes
- ✅ Select all rows with a single checkbox
- ✅ Customizable bulk action options
- ✅ Selected count display
- ✅ Responsive design
- ✅ Internationalization support

## Basic Usage

### Enable Bulk Actions

```tsx
<Table
  data={products}
  columns={columns}
  enableBulkActions={true}
  onBulkAction={(action, selectedIds) => {
    console.log(`Action: ${action}`, `Selected IDs: ${selectedIds}`);
  }}
/>
```

### Custom Bulk Actions

```tsx
const customBulkActions = [
  {
    value: "delete",
    label: "Delete Selected",
    variant: "outline",
    color: "error",
  },
  {
    value: "archive",
    label: "Archive Selected",
    variant: "outline",
    color: "warning",
  },
  {
    value: "export",
    label: "Export Selected",
    variant: "outline",
    color: "info",
  },
  {
    value: "duplicate",
    label: "Duplicate Selected",
    variant: "outline",
    color: "success",
  },
];

<Table
  data={products}
  columns={columns}
  enableBulkActions={true}
  bulkActions={customBulkActions}
  onBulkAction={handleBulkAction}
/>;
```

### Custom Row ID Function

```tsx
<Table
  data={products}
  columns={columns}
  enableBulkActions={true}
  getRowId={(item) => item.productId} // Custom ID field
  onBulkAction={handleBulkAction}
/>
```

## Props

| Prop                | Type                                                          | Default             | Description                               |
| ------------------- | ------------------------------------------------------------- | ------------------- | ----------------------------------------- |
| `enableBulkActions` | `boolean`                                                     | `false`             | Enable/disable bulk actions functionality |
| `bulkActions`       | `BulkAction[]`                                                | `[]`                | Custom bulk action options                |
| `onBulkAction`      | `(action: string, selectedIds: (string \| number)[]) => void` | `undefined`         | Callback when bulk action is applied      |
| `getRowId`          | `(item: T) => string \| number`                               | `(item) => item.id` | Function to get unique ID for each row    |
| `showSelectedCount` | `boolean`                                                     | `true`              | Show/hide selected count chip             |

## BulkAction Interface

```tsx
interface BulkAction {
  value: string; // Unique identifier for the action
  label: string; // Display text
  variant?: "outline" | "contained" | "text"; // Button variant
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success"; // Button color
}
```

## Default Actions

If no custom bulk actions are provided, the following default actions are shown:

- Delete Selected
- Archive Selected
- Export Selected
- Print Selected

## Example Implementation

### Products Table with Bulk Actions

```tsx
import { useState } from "react";
import Table from "../components/common/Table";
import { toast } from "react-hot-toast";

function ProductsTable() {
  const [products, setProducts] = useState([]);

  const handleBulkAction = async (action, selectedIds) => {
    try {
      switch (action) {
        case "delete":
          await deleteProducts(selectedIds);
          toast.success(`${selectedIds.length} products deleted successfully`);
          break;
        case "archive":
          await archiveProducts(selectedIds);
          toast.success(`${selectedIds.length} products archived successfully`);
          break;
        case "export":
          await exportProducts(selectedIds);
          toast.success(`Export completed for ${selectedIds.length} products`);
          break;
        default:
          console.log(`Action: ${action}`, `Selected IDs: ${selectedIds}`);
      }
    } catch (error) {
      toast.error("An error occurred while processing bulk action");
      console.error(error);
    }
  };

  const columns = [
    { header: "Name", accessor: (item) => item.name },
    { header: "Price", accessor: (item) => `$${item.price}` },
    { header: "Category", accessor: (item) => item.category },
  ];

  return (
    <Table
      data={products}
      columns={columns}
      enableBulkActions={true}
      onBulkAction={handleBulkAction}
      getRowId={(item) => item.productId}
    />
  );
}
```

### Orders Table with Custom Bulk Actions

```tsx
function OrdersTable() {
  const customBulkActions = [
    {
      value: "approve",
      label: "Approve Selected",
      variant: "outline",
      color: "success",
    },
    {
      value: "reject",
      label: "Reject Selected",
      variant: "outline",
      color: "error",
    },
    {
      value: "ship",
      label: "Mark as Shipped",
      variant: "outline",
      color: "info",
    },
    {
      value: "cancel",
      label: "Cancel Selected",
      variant: "outline",
      color: "warning",
    },
  ];

  const handleBulkAction = async (action, selectedIds) => {
    // Handle order-specific bulk actions
    switch (action) {
      case "approve":
        await approveOrders(selectedIds);
        break;
      case "reject":
        await rejectOrders(selectedIds);
        break;
      case "ship":
        await shipOrders(selectedIds);
        break;
      case "cancel":
        await cancelOrders(selectedIds);
        break;
    }
  };

  return (
    <Table
      data={orders}
      columns={orderColumns}
      enableBulkActions={true}
      bulkActions={customBulkActions}
      onBulkAction={handleBulkAction}
    />
  );
}
```

## Styling

The bulk actions section automatically adapts to the current theme and language direction:

- RTL support for Arabic language
- Theme-aware colors and borders
- Responsive layout
- Hover effects on table rows

## Best Practices

1. **Always provide meaningful feedback** when bulk actions complete
2. **Use appropriate colors** for different action types (error for delete, success for approve, etc.)
3. **Handle errors gracefully** and show user-friendly error messages
4. **Consider performance** when dealing with large datasets
5. **Clear selection** after successful bulk actions
6. **Use translations** for all labels and messages

## Accessibility

- Checkboxes are properly labeled and accessible
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes for better UX

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly interactions
