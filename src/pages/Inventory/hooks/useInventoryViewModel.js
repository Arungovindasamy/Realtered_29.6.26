import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import sellerService, { resolveWixImage, resolveSellerId } from "../../../services/sellerService";

const LIMIT = 10;

const parseNumber = (val) => {
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

const extractInventoryResponse = (response, fallbackPage, limit = LIMIT) => {
  const inventoryItems = response?.inventoryItems || response?.data?.inventoryItems || response?.message?.inventoryItems || [];
  const totalItems = response?.totalItems || response?.data?.totalItems || response?.message?.totalItems || inventoryItems.length;
  
  const payload = response?.data ?? response ?? {};
  const source = payload?.message ?? payload;
  const currentPage = Number(source?.currentPage ?? source?.page ?? payload?.page ?? fallbackPage);
  
  let totalPages = response?.totalPages || response?.data?.totalPages || response?.message?.totalPages;
  if (!totalPages) {
    totalPages = Math.max(1, Math.ceil(totalItems / limit));
  } else {
    totalPages = Number(totalPages);
  }
  
  return { inventoryItems, totalItems, currentPage, totalPages };
};

export const useInventoryViewModel = (sellerId) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const inventory = inventoryItems;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state (raw input and debounced search term)
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch] = useState("");
  
  // Pagination and filter states
  const [page, setPage] = useState(1);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("in_stock"); // default to In Stock tab

  // Batch update states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const debounceRef = useRef(null);
  const isRefetchingRef = useRef(false);

  // Debounced search handler
  const handleSearchChange = (val) => {
    setSearchRaw(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val.trim());
      setPage(1); // Reset page to 1 when search query changes
    }, 350);
  };

  // Fetch Inventory from API
  const loadInventory = useCallback(async (signal = null, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    const resolvedSellerId = sellerId || resolveSellerId();
    
    // TASK 14: Debug log - list request
    console.log("[Inventory] list request:", { sellerId: resolvedSellerId, page, searchText: search });

    try {
      const response = await sellerService.getSellerProductInventory({ 
        sellerId: resolvedSellerId, 
        page, 
        searchText: search, 
        signal 
      });
      
      // TASK 14: Debug log - list response
      console.log("[Inventory] list response:", response);

      const backendLimit = response?.limit || response?.pagination?.limit || LIMIT;

      const {
        inventoryItems: inventoryItemsResponse,
        totalItems: totalItemsVal,
        currentPage: currentPageVal,
        totalPages: totalPagesVal
      } = extractInventoryResponse(response, page, backendLimit);

      // TASK 2: Fix row mapping from variants
      const getVariantLabel = (variant) => {
        const choices = variant?.choices || {};
        const values = Object.values(choices).filter(Boolean);
        return values.length ? values.join(" / ") : "Default";
      };

      const rows = [];
      inventoryItemsResponse.forEach((item) => {
        const productId = item.productId;
        const externalId = item.externalId;
        const productName = item.productName;
        const image = item.mainMedia;
        const variants = item.variants || [];

        if (variants.length === 0) {
          const variantId = item.variantId || item.id || item._id || "00000000-0000-0000-0000-000000000000";
          const qty = parseNumber(
            item.stock?.quantity ??
            item.quantity ??
            item.stock ??
            0
          );
          const inStock = item.stock?.inStock !== undefined 
            ? item.stock.inStock 
            : (item.inStock !== undefined ? item.inStock : qty > 0);

          const rowId = `${productId || externalId || "prod"}-${variantId}`;
          rows.push({
            rowId,
            id: rowId,
            productId: productId || "-",
            externalId: externalId || "-",
            productName: productName || "-",
            image: resolveWixImage(image) || image || "",
            variantId: variantId,
            originalQuantity: qty,
            editedQuantity: qty,
            inStock: Boolean(inStock),
            choices: {},
            stockStatus: qty <= 0 ? "Out of Stock" : (qty <= 5 ? "Low Stock" : "In Stock"),
            // Legacy / UI properties
            name: productName || "-",
            variant: "Default",
            stock: qty,
            status: qty <= 0 ? "Out of Stock" : (qty <= 5 ? "Low Stock" : "In Stock")
          });
        } else {
          variants.forEach((variant) => {
            const variantId = variant.variantId || "00000000-0000-0000-0000-000000000000";
            const qty = parseNumber(
              variant.stock?.quantity ??
              variant.quantity ??
              0
            );
            const inStock = variant.stock?.inStock !== undefined 
              ? variant.stock.inStock 
              : (variant.inStock !== undefined ? variant.inStock : qty > 0);
            
            const variantLabel = getVariantLabel(variant);
            const rowId = `${productId || externalId || "prod"}-${variantId}`;

            rows.push({
              rowId,
              id: rowId,
              productId: productId || "-",
              externalId: externalId || "-",
              productName: productName || "-",
              image: resolveWixImage(image) || image || "",
              variantId: variantId,
              originalQuantity: qty,
              editedQuantity: qty,
              inStock: Boolean(inStock),
              choices: variant.choices || {},
              stockStatus: qty <= 0 ? "Out of Stock" : (qty <= 5 ? "Low Stock" : "In Stock"),
              // Legacy / UI properties
              name: productName || "-",
              variant: variantLabel,
              stock: qty,
              status: qty <= 0 ? "Out of Stock" : (qty <= 5 ? "Low Stock" : "In Stock")
            });
          });
        }
      });

      // TASK 14: Debug log - mapped rows
      console.log("[Inventory] mapped rows:", rows);

      setInventoryItems(rows);
      setTotalItems(totalItemsVal);
      setPage(currentPageVal);
      setTotalPages(totalPagesVal);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError" || err.message === "canceled") {
        return; // Request was aborted, ignore error setting
      }
      console.error("[Inventory] Error", err);
      setError("Unable to load inventory. Please try again.");
      setInventoryItems([]);
      setTotalItems(0);
    } finally {
      // Only set loading false if not aborted
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [sellerId, page, search]);

  useEffect(() => {
    const controller = new AbortController();
    loadInventory(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadInventory]);

  // Reset page to 1 on status tab change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Compute pending changed rows
  const changedRows = useMemo(() => {
    return inventoryItems.filter((row) => row.editedQuantity !== row.originalQuantity);
  }, [inventoryItems]);

  useEffect(() => {
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && changedRows.length > 0) {
      console.log("[InventoryPage] Changed Rows detected:", changedRows);
    }
  }, [changedRows]);

  const totalProduct = useMemo(() => {
    return new Set(changedRows.map((row) => row.productId)).size;
  }, [changedRows]);

  const totalVariant = changedRows.length;

  // Calculate stats dynamically based on the current dataset
  const inStockCount = useMemo(() => {
    return inventoryItems.filter((item) => {
      const qty = Number(item.originalQuantity ?? 0);
      return qty > 0 || item.inStock === true;
    }).length;
  }, [inventoryItems]);

  const outOfStockCount = useMemo(() => {
    return inventoryItems.filter((item) => {
      const qty = Number(item.originalQuantity ?? 0);
      return !(qty > 0 || item.inStock === true);
    }).length;
  }, [inventoryItems]);

  const handleQuantityChange = (rowId, nextQuantity) => {
    const quantity = Math.max(0, parseNumber(nextQuantity));
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId || item.id === rowId
          ? {
              ...item,
              editedQuantity: quantity,
              stock: quantity,
              stockStatus:
                quantity <= 0 ? "Out of Stock" :
                quantity <= 5 ? "Low Stock" :
                "In Stock",
              status:
                quantity <= 0 ? "Out of Stock" :
                quantity <= 5 ? "Low Stock" :
                "In Stock"
            }
          : item
      )
    );
  };

  const handleIncrement = handleQuantityChange;

  // Handle local-only decrement
  const handleDecrement = (rowId) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        (item.rowId === rowId || item.id === rowId) && item.editedQuantity > 0
          ? { ...item, editedQuantity: Math.max(0, item.editedQuantity - 1) }
          : item
      )
    );
  };

  // Handle Batch update submission
  const handleUpdateInventory = async () => {
    // Debug logs
    console.log("[Inventory] changed rows:", changedRows);
    console.log("[Inventory] statusFilter:", statusFilter);
    console.log("[Inventory] out of stock changed rows:", changedRows.filter(r => Number(r.originalQuantity) === 0));
    console.log("[Inventory] totalProduct totalVariant:", { totalProduct, totalVariant });

    // TASK 7: Validate before update
    if (changedRows.length === 0) {
      setError("No inventory changes to update");
      setShowConfirmation(false);
      return;
    }

    let validationError = null;
    for (const row of changedRows) {
      const editedQty = Number(row.editedQuantity ?? 0);
      if (editedQty < 0) {
        validationError = "Stock quantity cannot be negative.";
        break;
      }
      if (!row.productId) {
        validationError = "Missing productId for one or more changed items.";
        break;
      }
      if (!row.variantId) {
        validationError = "Missing variantId for one or more changed items.";
        break;
      }
      const delta = editedQty - Number(row.originalQuantity ?? 0);
      if (delta === 0 || Math.abs(delta) <= 0) {
        validationError = "Increment/decrement amount must be greater than 0.";
        break;
      }
    }

    if (validationError) {
      setError(validationError);
      setShowConfirmation(false);
      return;
    }

    setUpdating(true);
    setError(null);
    const resolvedSellerId = sellerId || resolveSellerId();

    try {
      const incrementItems = [];
      const decrementItems = [];

      changedRows.forEach((row) => {
        const oldStock = Number(row.originalQuantity ?? 0);
        const newStock = Number(row.editedQuantity ?? 0);
        const delta = newStock - oldStock;

        const productId = row.productId;
        const variantId =
          row.variantId ||
          row.varientId ||
          "00000000-0000-0000-0000-000000000000";

        if (!productId) {
          console.warn("[Inventory] Missing productId, skipping row:", row);
          return;
        }

        if (delta > 0) {
          incrementItems.push({
            productId,
            variantId,
            incrementBy: delta
          });
        }

        if (delta < 0) {
          decrementItems.push({
            productId,
            variantId,
            decrementBy: Math.abs(delta)
          });
        }
      });

      const updatePromises = [];

      if (incrementItems.length > 0) {
        console.log("[Inventory] increment payload:", {
          updateInfo: incrementItems
        });

        updatePromises.push(
          sellerService.incrementInventory({
            updateInfo: incrementItems
          })
        );
      }

      if (decrementItems.length > 0) {
        console.log("[Inventory] decrement payload:", {
          updateInfo: decrementItems
        });

        updatePromises.push(
          sellerService.decrementInventory({
            updateInfo: decrementItems
          })
        );
      }

      const responses = await Promise.all(updatePromises);

      console.log("[Inventory] update responses:", responses);

      // Verify success condition: response.status === "success"
      const allSuccess = responses.every((res) => res?.status === "success");
      if (!allSuccess) {
        const failedRes = responses.find((res) => res?.status !== "success");
        const errMsg = failedRes?.message?.error || failedRes?.message?.message || "Failed to update some inventory items.";
        throw new Error(errMsg);
      }

      // TASK 9: Refresh after update (Optimistic UI update)
      setInventoryItems((prev) =>
        prev.map((row) => {
          const changedRow = changedRows.find(
            (item) =>
              item.productId === row.productId &&
              (item.variantId === row.variantId || item.id === row.id)
          );

          if (!changedRow) return row;

          const finalQty = changedRow.editedQuantity;

          return {
            ...row,
            originalQuantity: finalQty,
            editedQuantity: finalQty,
            stock: finalQty,
            inventory: finalQty,
            availableStock: finalQty,
            status: finalQty <= 0 ? "Out of Stock" : (finalQty <= 5 ? "Low Stock" : "In Stock"),
            stockStatus: finalQty <= 0 ? "Out of Stock" : (finalQty <= 5 ? "Low Stock" : "In Stock")
          };
        })
      );

      // Successfully updated all changes
      setSuccessMessage("Inventory updated successfully.");
      isRefetchingRef.current = true;
      setShowConfirmation(false);

      // Silent backend sync to prevent manual refresh
      setTimeout(() => {
        loadInventory(null, true);
      }, 300);

      setTimeout(() => {
        loadInventory(null, true);
      }, 1200);
    } catch (err) {
      console.error("[useInventoryViewModel] Batch update failed:", err);
      setError(err.message || "Failed to update some inventory items.");
    } finally {
      setUpdating(false);
    }
  };

  // TASK 10: Fix refresh stale state issue
  const handleRefresh = useCallback(() => {
    setSearchRaw("");
    setSearch("");
    setStatusFilter("in_stock");
    setPage(1);
  }, []);

  // Filter items based on dropdown filters and tab selection
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      // 1. Status filter
      let matchesStatus = true;
      const qty = Number(item.originalQuantity ?? 0);
      const inStock = qty > 0 || item.inStock === true;
      if (statusFilter === "in_stock") {
        matchesStatus = inStock;
      } else if (statusFilter === "out_of_stock") {
        matchesStatus = !inStock;
      }

      // 2. Local search filter (TASK 12: Prefer backend search result)
      const query = (search || "").toLowerCase().trim();
      let matchesSearch = true;
      if (query) {
        matchesSearch = true; // Prefer backend search results completely to avoid double filtering
      }

      return matchesStatus && matchesSearch;
    });
  }, [inventoryItems, statusFilter, search]);

  return {
    inventory,
    filteredItems,
    loading,
    error,
    setError,
    searchRaw,
    handleSearchChange,
    statusFilter,
    setStatusFilter,
    inStockCount,
    outOfStockCount,
    handleIncrement,
    handleDecrement,
    handleRefresh,
    page,
    setPage,
    totalPages,
    totalItems,
    limit: LIMIT,
    
    // Batch updates
    changedRows,
    showConfirmation,
    setShowConfirmation,
    updating,
    successMessage,
    setSuccessMessage,
    handleUpdateInventory,
    totalProduct,
    totalVariant
  };
};
export default useInventoryViewModel;
