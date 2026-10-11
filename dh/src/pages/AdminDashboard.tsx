import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Zap,
  Inbox,
  FolderTree,
  Building2,
  Terminal,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Phone,
  MessageCircle,
  Edit2,
  Search,
  UploadCloud,
  Image as ImageIcon,
  Tractor,
  Calendar,
  MapPin,
  Wrench,
} from "lucide-react";

import {
  fetchAllAdminData,
  fetchDBStatus,
  reconnectDB,
  updateInquiryStatus,
  deleteInquiry,
  updateInventoryItem,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  createStore,
  uploadProductImage,
  fetchAllServiceBookings,
  updateServiceBookingStatus,
  deleteServiceBooking,
  fetchAllMasterServices,
  createMasterService,
  updateMasterService,
  deleteMasterService,
} from "../services/api";

import type {
  AllDataResponse,
  DBStatusResponse,
  MasterProduct,
  InventoryItem,
  InquiryRecord,
  ServiceBookingItem,
  MasterService,
  StoreItem,
} from "../services/api";

interface AdminDashboardProps {
  onSwitchToStorefront: () => void;
}

type TabType =
  | "products"
  | "inventory"
  | "services"
  | "bookings"
  | "queries"
  | "categories"
  | "stores";

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSwitchToStorefront,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [data, setData] = useState<AllDataResponse | null>(null);
  const [services, setServices] = useState<MasterService[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBookingItem[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [productSearch, setProductSearch] = useState("");
  const [selectedInventoryStore, setSelectedInventoryStore] = useState<
    number | "all"
  >("all");
  const [queryStatusFilter, setQueryStatusFilter] = useState<string>("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("all");

  // Inline Inventory Edit State
  const [editingInventoryId, setEditingInventoryId] = useState<number | null>(
    null,
  );
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editAvailable, setEditAvailable] = useState<boolean>(true);

  // Add Product State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category_id: 1,
    sku: "",
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit Product State
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: number;
    title: string;
    description: string;
    category_id: number;
    sku: string;
    image_url: string;
  } | null>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Dynamic Service Modal State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState<{
    title: string;
    model: string;
    description: string;
    rate_per_acre: number;
    rate_unit: string;
    coverage_mode: "ALL_HUBS" | "NEARBY_ONLY" | "SPECIFIC_HUBS";
    max_distance_km: number;
    image_url: string;
    tag: string;
    specs: string;
    is_active: boolean;
    selected_store_ids: number[];
    custom_rates: Record<string, number>;
  }>({
    title: "",
    model: "",
    description: "",
    rate_per_acre: 1000,
    rate_unit: "per acre",
    coverage_mode: "ALL_HUBS",
    max_distance_km: 30,
    image_url: "",
    tag: "Available",
    specs: '["Certified Operator Included", "High Fuel Efficiency"]',
    is_active: true,
    selected_store_ids: [],
    custom_rates: {},
  });

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    icon: "Sprout",
  });

  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({
    store_name: "",
    city_id: 1,
    address: "",
    phone: "+91 ",
  });

  const [dbStatus, setDbStatus] = useState<DBStatusResponse | null>(null);
  const [showDBModal, setShowDBModal] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, status, srvList, bookings] = await Promise.all([
        fetchAllAdminData(),
        fetchDBStatus().catch(() => null),
        fetchAllMasterServices().catch(() => []),
        fetchAllServiceBookings().catch(() => []),
      ]);
      setData(res);
      if (status) setDbStatus(status);
      setServices(srvList || []);
      setServiceBookings(bookings || []);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr?.response?.data?.error ||
          apiErr?.message ||
          "Failed to load backend database.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleReconnectDB = async () => {
    setIsReconnecting(true);
    try {
      const result = await reconnectDB();
      if (result.success) {
        showToast("success", result.message);
      } else {
        showToast(
          "error",
          result.message || "Could not connect to external MySQL",
        );
      }
      const newStatus = await fetchDBStatus();
      setDbStatus(newStatus);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error ||
          apiErr?.message ||
          "Connection attempt failed",
      );
    } finally {
      setIsReconnecting(false);
    }
  };

  const handleStatusChange = async (queryId: number, newStatus: string) => {
    try {
      await updateInquiryStatus(queryId, newStatus);
      showToast("success", `Inquiry #${queryId} updated to ${newStatus}`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to update status",
      );
    }
  };

  const handleDeleteQuery = async (queryId: number) => {
    if (!confirm(`Delete inquiry #${queryId}?`)) return;
    try {
      await deleteInquiry(queryId);
      showToast("success", `Inquiry #${queryId} deleted`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to delete inquiry",
      );
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: number,
    newStatus: string,
  ) => {
    try {
      await updateServiceBookingStatus(bookingId, newStatus);
      showToast("success", `Booking #${bookingId} marked as ${newStatus}`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to update booking status",
      );
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm(`Delete machinery booking #${bookingId}?`)) return;
    try {
      await deleteServiceBooking(bookingId);
      showToast("success", `Booking #${bookingId} removed`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to delete booking",
      );
    }
  };

  // Service Management Handlers
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceForm({
      title: "",
      model: "",
      description: "",
      rate_per_acre: 1000,
      rate_unit: "per acre",
      coverage_mode: "ALL_HUBS",
      max_distance_km: 30,
      image_url: "",
      tag: "Available",
      specs: '["Certified Operator Included", "High Fuel Efficiency"]',
      is_active: true,
      selected_store_ids: (data?.data?.stores || []).map(
        (s: StoreItem) => s.id,
      ),
      custom_rates: {},
    });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service: MasterService) => {
    setEditingServiceId(service.id);
    const selectedIds = (service.hub_allocations || [])
      .filter((h) => h.is_available === 1)
      .map((h) => h.store_id);

    const ratesObj: Record<string, number> = {};
    (service.hub_allocations || []).forEach((h) => {
      if (h.custom_rate !== null) {
        ratesObj[h.store_id] = h.custom_rate;
      }
    });

    setServiceForm({
      title: service.title,
      model: service.model || "",
      description: service.description || "",
      rate_per_acre: service.rate_per_acre,
      rate_unit: service.rate_unit || "per acre",
      coverage_mode: service.coverage_mode || "ALL_HUBS",
      max_distance_km: service.max_distance_km || 30,
      image_url: service.image_url || "",
      tag: service.tag || "Available",
      specs: JSON.stringify(service.specs || []),
      is_active: service.is_active === 1,
      selected_store_ids: selectedIds,
      custom_rates: ratesObj,
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedSpecs: string[] = [];
      try {
        parsedSpecs = JSON.parse(serviceForm.specs);
      } catch {
        parsedSpecs = serviceForm.specs.split(",").map((s) => s.trim());
      }

      const payload = {
        title: serviceForm.title,
        model: serviceForm.model,
        description: serviceForm.description,
        rate_per_acre: Number(serviceForm.rate_per_acre),
        rate_unit: serviceForm.rate_unit,
        coverage_mode: serviceForm.coverage_mode,
        max_distance_km: Number(serviceForm.max_distance_km),
        image_url: serviceForm.image_url,
        tag: serviceForm.tag,
        specs: parsedSpecs,
        is_active: serviceForm.is_active,
        selected_store_ids: serviceForm.selected_store_ids,
        custom_rates: serviceForm.custom_rates,
      };

      if (editingServiceId) {
        await updateMasterService(editingServiceId, payload);
        showToast("success", `Service "${serviceForm.title}" updated.`);
      } else {
        await createMasterService(payload);
        showToast(
          "success",
          `Service "${serviceForm.title}" created successfully.`,
        );
      }

      setShowServiceModal(false);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to save service",
      );
    }
  };

  const handleDeleteService = async (service: MasterService) => {
    if (!confirm(`Delete service "${service.title}" and its hub allocations?`))
      return;
    try {
      await deleteMasterService(service.id);
      showToast("success", `Service "${service.title}" deleted.`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to delete service",
      );
    }
  };

  const handleSaveInventory = async (id: number) => {
    try {
      await updateInventoryItem(id, {
        price: Number(editPrice),
        stock: Number(editStock),
        is_available: editAvailable ? 1 : 0,
      });
      showToast("success", "Store price & inventory updated");
      setEditingInventoryId(null);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to update inventory",
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setNewProduct((prev) => ({ ...prev, image_url: uploadedUrl }));
      showToast("success", "Image uploaded successfully!");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to upload image",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingEditImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      setEditingProduct((prev) =>
        prev ? { ...prev, image_url: uploadedUrl } : null,
      );
      showToast("success", "New image uploaded successfully!");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to upload image",
      );
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      showToast("success", "Master product created and synced across stores");
      setShowAddProductModal(false);
      setNewProduct({
        title: "",
        description: "",
        category_id: 1,
        sku: "",
        image_url: "",
      });
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to create product",
      );
    }
  };

  const handleOpenEditProduct = (prod: MasterProduct) => {
    const matchedCategory = (data?.data?.categories || []).find(
      (c) => c.name.toLowerCase() === prod.category_name?.toLowerCase(),
    );

    setEditingProduct({
      id: prod.id,
      title: prod.title,
      description: prod.description || "",
      sku: prod.sku,
      category_id: matchedCategory ? matchedCategory.id : 1,
      image_url: prod.image_url || "",
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await updateProduct(Number(editingProduct.id), {
        title: editingProduct.title.trim(),
        description: editingProduct.description || "",
        sku: editingProduct.sku.trim(),
        category_id: Number(editingProduct.category_id),
        image_url: editingProduct.image_url || "",
      });

      showToast(
        "success",
        `Product "${editingProduct.title}" updated successfully!`,
      );
      setShowEditProductModal(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error ||
          apiErr?.message ||
          "Failed to update product",
      );
    }
  };

  const handleDeleteProduct = async (prod: MasterProduct) => {
    if (
      !confirm(
        `Permanently delete "${prod.title}" (SKU: ${prod.sku}) and all regional outlet stock rows?`,
      )
    ) {
      return;
    }

    try {
      await deleteProduct(prod.id);
      showToast("success", `Product "${prod.title}" deleted.`);
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to delete product",
      );
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      showToast("success", "Category created successfully");
      setShowAddCategoryModal(false);
      setNewCategory({ name: "", slug: "", icon: "Sprout" });
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to create category",
      );
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStore(newStore);
      showToast("success", "Store outlet added with initialized stock");
      setShowAddStoreModal(false);
      setNewStore({ store_name: "", city_id: 1, address: "", phone: "+91 " });
      await loadData();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      showToast(
        "error",
        apiErr?.response?.data?.error || "Failed to create store",
      );
    }
  };

  const productsList: MasterProduct[] = data?.data?.products || [];
  const inventoryList: InventoryItem[] = data?.data?.inventory || [];
  const queriesList: InquiryRecord[] = data?.data?.queries || [];
  const categoriesList = data?.data?.categories || [];
  const storesList: StoreItem[] = data?.data?.stores || [];

  const filteredQueries = queriesList.filter((q) => {
    if (queryStatusFilter === "all") return true;
    return q?.status?.toLowerCase() === queryStatusFilter.toLowerCase();
  });

  const filteredBookings = serviceBookings.filter((b) => {
    if (bookingStatusFilter === "all") return true;
    return b?.status?.toLowerCase() === bookingStatusFilter.toLowerCase();
  });

  const filteredProducts = productsList.filter((p) => {
    if (!productSearch.trim()) return true;
    const search = productSearch.toLowerCase();
    return (
      p?.title?.toLowerCase().includes(search) ||
      p?.sku?.toLowerCase().includes(search) ||
      p?.category_name?.toLowerCase().includes(search)
    );
  });

  const filteredInventory = inventoryList.filter((i) => {
    if (selectedInventoryStore === "all") return true;
    return i?.store_id === Number(selectedInventoryStore);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border ${
            notification.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-700"
              : "bg-red-950 text-red-200 border-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-outfit text-base font-bold tracking-tight text-white">
                  Dehati Sansar Admin
                </h1>
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono">
                  Enterprise Inventory Engine
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Multi-Store Agricultural Inventory, Machinery &amp; Inquiries
                Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowDBModal(true)}
              className={`flex items-center gap-2 text-xs border px-3 py-1.5 rounded-xl font-mono transition-all cursor-pointer ${
                dbStatus?.isRealMySQL
                  ? "bg-emerald-950/80 border-emerald-600 text-emerald-300 hover:bg-emerald-900"
                  : "bg-amber-950/60 border-amber-600/70 text-amber-300 hover:bg-amber-900/80"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.isRealMySQL
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-amber-400"
                }`}
              />
              <span>
                {dbStatus?.isRealMySQL
                  ? `Live MySQL: ${dbStatus.database || "Connected"}`
                  : "💾 Local DB Active"}
              </span>
            </button>

            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`}
              />
            </button>

            <button
              onClick={onSwitchToStorefront}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <span>Storefront View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4">
          <div className="p-4 bg-red-950/80 border border-red-700 text-red-200 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Database Connection Error: {error}</span>
            </div>
            <button
              onClick={() => void loadData()}
              className="underline font-semibold hover:text-white cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Metric Summary */}
      {data && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Master Products
              </span>
              <span className="text-base font-bold text-white font-mono">
                {data?.counts?.products ?? productsList.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Live Services
              </span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {services.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Rental Bookings
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {serviceBookings.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Inquiries
              </span>
              <span className="text-base font-bold text-white font-mono">
                {data?.counts?.queries ?? queriesList.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Active Outlets
              </span>
              <span className="text-base font-bold text-white font-mono">
                {data?.counts?.stores ?? storesList.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[11px] block">
                Categories
              </span>
              <span className="text-base font-bold text-white font-mono">
                {data?.counts?.categories ?? categoriesList.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "products"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Master Products</span>
            <span className="text-[10px] opacity-80 font-mono">
              ({productsList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inventory"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Store Stock &amp; Prices</span>
            <span className="text-[10px] opacity-80 font-mono">
              ({inventoryList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "services"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Agricultural Services</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono">
              {services.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bookings"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Tractor className="w-4 h-4 text-amber-300" />
            <span>Rental Bookings</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">
              {serviceBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("queries")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "queries"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Customer Queries</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">
              {queriesList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "categories"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "stores"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Stores &amp; Outlets</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* ============================================================== */}
        {/* TAB 1: MASTER PRODUCTS                                         */}
        {/* ============================================================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Master Agricultural Products Catalog
                </h2>
                <p className="text-xs text-slate-400">
                  Global catalog synced with store inventories.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search SKU or Title..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">SKU &amp; Category</th>
                      <th className="py-3 px-4">Available Hubs</th>
                      <th className="py-3 px-4">Price Range (₹)</th>
                      <th className="py-3 px-4">Total Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-emerald-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white text-xs block truncate max-w-xs">
                                {p.title}
                              </span>
                              <span className="text-[11px] text-slate-400 block line-clamp-1 max-w-xs">
                                {p.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className="font-mono text-[11px] text-amber-300 font-semibold block">
                              {p.sku}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 inline-block">
                              {p.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="text-emerald-400 font-medium">
                            {p.available_stores_count} /{" "}
                            {storesList.length || 4} Outlets
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-white">
                          ₹{p.min_price} – ₹{p.max_price}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              p.total_stock > 100
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-amber-950 text-amber-300 border border-amber-800"
                            }`}
                          >
                            {p.total_stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              title="Edit product details & photo"
                              className="p-1.5 bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 rounded-lg border border-slate-700 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => void handleDeleteProduct(p)}
                              title="Delete master product"
                              className="p-1.5 bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-400 rounded-lg border border-slate-700 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: STORE INVENTORY                                         */}
        {/* ============================================================== */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Store Inventory &amp; Price Management
                </h2>
                <p className="text-xs text-slate-400">
                  Update local Mandi prices, stock levels, and availability
                  flags.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Outlet:</span>
                <select
                  value={selectedInventoryStore}
                  onChange={(e) =>
                    setSelectedInventoryStore(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="all">
                    All Outlets ({inventoryList.length} SKUs)
                  </option>
                  {storesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.store_name} ({s.city_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Store Outlet</th>
                      <th className="py-3 px-4">Product / SKU</th>
                      <th className="py-3 px-4">Store Price (₹)</th>
                      <th className="py-3 px-4">Stock Qty</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredInventory.map((item) => {
                      const isEditing = editingInventoryId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-semibold text-white block">
                                {item.store_name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                📍 {item.city_name} · {item.store_phone}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-semibold text-slate-200 block truncate max-w-xs">
                                {item.product_title}
                              </span>
                              <span className="font-mono text-[10px] text-amber-300">
                                {item.product_sku} · {item.category_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) =>
                                  setEditPrice(Number(e.target.value))
                                }
                                className="w-24 bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                              />
                            ) : (
                              <span className="text-white font-semibold tabular-nums">
                                ₹{item.price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) =>
                                  setEditStock(Number(e.target.value))
                                }
                                className="w-20 bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                              />
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-medium tabular-nums ${item.stock > 50 ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"}`}
                              >
                                {item.stock} in stock
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editAvailable}
                                  onChange={(e) =>
                                    setEditAvailable(e.target.checked)
                                  }
                                  className="rounded text-emerald-600 h-4 w-4"
                                />
                                <span>Available</span>
                              </label>
                            ) : (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.is_available === 1 ? "bg-emerald-900/60 text-emerald-300 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-900"}`}
                              >
                                {item.is_available === 1
                                  ? "Available"
                                  : "Disabled"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() =>
                                    void handleSaveInventory(item.id)
                                  }
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingInventoryId(null)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingInventoryId(item.id);
                                  setEditPrice(item.price);
                                  setEditStock(item.stock);
                                  setEditAvailable(item.is_available === 1);
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3 text-emerald-400" />
                                <span>Edit</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DYNAMIC AGRICULTURAL SERVICES & HUB ALLOCATIONS         */}
        {/* ============================================================== */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Agricultural Machinery &amp; Services Management
                </h2>
                <p className="text-xs text-slate-400">
                  Configure rental services across 'All Locations', 'Nearby
                  Radius', or specific regional mandi hubs with custom rates.
                </p>
              </div>

              <button
                onClick={handleOpenAddService}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((srv) => {
                const activeHubCount = (srv.hub_allocations || []).filter(
                  (h) => h.is_available === 1,
                ).length;

                return (
                  <div
                    key={srv.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                            {srv.coverage_mode === "ALL_HUBS"
                              ? "🌐 All Locations"
                              : srv.coverage_mode === "NEARBY_ONLY"
                                ? `📍 Nearby Only (≤ ${srv.max_distance_km} km)`
                                : `📌 ${activeHubCount} Selected Hubs`}
                          </span>
                          <h3 className="font-bold text-white text-base mt-0.5">
                            {srv.title}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono block">
                            {srv.model || "Standard Machinery"}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            srv.is_active === 1
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-red-950 text-red-300 border-red-800"
                          }`}
                        >
                          {srv.is_active === 1 ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {srv.description}
                      </p>

                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Base Price:</span>
                        <span className="text-amber-400 font-bold">
                          ₹{Number(srv.rate_per_acre).toLocaleString("en-IN")}{" "}
                          {srv.rate_unit}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditService(srv)}
                        className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Edit Hubs &amp; Rate</span>
                      </button>

                      <button
                        onClick={() => void handleDeleteService(srv)}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MACHINERY & SERVICE RENTAL BOOKINGS                      */}
        {/* ============================================================== */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Harvester &amp; Machinery Rental Bookings (`service_bookings`)
                </h2>
                <p className="text-xs text-slate-400">
                  Manage machinery dispatches, farmer dates, operator
                  assignments, and live status.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-hidden"
                >
                  <option value="all">
                    All Bookings ({serviceBookings.length})
                  </option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In-Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Booking ID &amp; Machinery</th>
                      <th className="py-3 px-4">Farmer Details</th>
                      <th className="py-3 px-4">Scheduled Dates &amp; Area</th>
                      <th className="py-3 px-4">Village / Mandi Hub</th>
                      <th className="py-3 px-4">Est. Total (₹)</th>
                      <th className="py-3 px-4">Rental Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-slate-500"
                        >
                          <Tractor className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          No machinery rental bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs font-bold text-amber-400 block">
                              #{b.id} · {b.service_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {b.model_name || "Standard Equipment"}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">
                              {b.farmer_name}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400 block">
                              {b.farmer_phone}
                            </span>
                            <div className="flex gap-2 mt-1">
                              <a
                                href={`tel:${b.farmer_phone}`}
                                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded"
                              >
                                <Phone className="w-2.5 h-2.5 text-emerald-400" />{" "}
                                Call
                              </a>
                              <a
                                href={`https://wa.me/${b.farmer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                  `Namaste ${b.farmer_name}, regards from Dehati Sansar Machinery Yard. Regarding your rental request for ${b.service_name}: `,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800"
                              >
                                <MessageCircle className="w-2.5 h-2.5" />{" "}
                                WhatsApp
                              </a>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>
                                {new Date(b.start_date).toLocaleDateString()} –{" "}
                                {new Date(b.end_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-amber-300 font-bold mt-0.5">
                              {b.farm_acres} Acres · {b.crop_type}
                            </div>
                            {b.requires_operator === 1 && (
                              <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                + Operator Included
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[11px]">
                            <div className="text-slate-300 truncate max-w-xs">
                              {b.village_address}
                            </div>
                            <div className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{b.city_name || "Central Hub"}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                            ₹{Number(b.estimated_cost).toLocaleString("en-IN")}
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                void handleUpdateBookingStatus(
                                  b.id,
                                  e.target.value,
                                )
                              }
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                                b.status === "Pending"
                                  ? "bg-amber-950 text-amber-300 border-amber-800"
                                  : b.status === "Confirmed"
                                    ? "bg-sky-950 text-sky-300 border-sky-800"
                                    : b.status === "In-Progress"
                                      ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                                      : b.status === "Completed"
                                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                        : "bg-red-950 text-red-300 border-red-800"
                              }`}
                            >
                              <option value="Pending">🟡 Pending</option>
                              <option value="Confirmed">🔵 Confirmed</option>
                              <option value="In-Progress">
                                🟣 In-Progress
                              </option>
                              <option value="Completed">🟢 Completed</option>
                              <option value="Cancelled">🔴 Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => void handleDeleteBooking(b.id)}
                              title="Delete booking entry"
                              className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: QUERIES                                                 */}
        {/* ============================================================== */}
        {activeTab === "queries" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Customer &amp; Farmer Inquiries
                </h2>
                <p className="text-xs text-slate-400">
                  Direct inquiries routed to regional mandi representatives.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter Status:</span>
                <select
                  value={queryStatusFilter}
                  onChange={(e) => setQueryStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-1.5 text-white focus:outline-hidden"
                >
                  <option value="all">
                    All Inquiries ({queriesList.length})
                  </option>
                  <option value="new">New Inquiries</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredQueries.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 p-8">
                  <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    No customer queries found
                  </p>
                </div>
              ) : (
                filteredQueries.map((q) => (
                  <div
                    key={q.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xs transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                          #{q.id}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {q.customer_name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                            <span className="text-emerald-400">
                              {q.customer_phone}
                            </span>
                            <span>·</span>
                            <span>{q.created_at}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={q.status}
                          onChange={(e) =>
                            void handleStatusChange(q.id, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            q.status === "New"
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : q.status === "Contacted"
                                ? "bg-sky-950 text-sky-300 border-sky-800"
                                : q.status === "Quoted"
                                  ? "bg-indigo-950 text-indigo-300 border-indigo-800"
                                  : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          }`}
                        >
                          <option value="New">🟡 New</option>
                          <option value="Contacted">🔵 Contacted</option>
                          <option value="Quoted">🟣 Quoted</option>
                          <option value="Closed">🟢 Closed</option>
                        </select>

                        <button
                          onClick={() => void handleDeleteQuery(q.id)}
                          title="Delete inquiry"
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-[11px] text-slate-500 block mb-1">
                          Target Product
                        </span>
                        <div className="font-semibold text-white truncate">
                          {q.product_title}
                        </div>
                        <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                          SKU: {q.product_sku}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-[11px] text-slate-500 block mb-1">
                          Assigned Mandi Outlet
                        </span>
                        <div className="font-semibold text-white truncate">
                          {q.store_name}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          📍 {q.city_name} · Ph: {q.store_phone}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-[11px] text-slate-500 block mb-1">
                          Quick Contact Actions
                        </span>
                        <div className="flex gap-2">
                          <a
                            href={`tel:${q.customer_phone}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/${q.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Namaste ${q.customer_name}, regards from Dehati Sansar (${q.store_name}). Regarding inquiry for ${q.product_title}: `,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                        Inquiry Message:
                      </span>
                      <p className="leading-relaxed">{q.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: CATEGORIES                                              */}
        {/* ============================================================== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Agricultural Categories
                </h2>
                <p className="text-xs text-slate-400">
                  Taxonomy across seeds, nutrition, and machinery.
                </p>
              </div>

              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                        Slug: {cat.slug}
                      </span>
                      <h4 className="font-semibold text-sm text-white mt-0.5">
                        {cat.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                      Icon: {cat.icon}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Products Linked:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {cat.product_count ?? 0} SKUs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: STORES & OUTLETS                                        */}
        {/* ============================================================== */}
        {activeTab === "stores" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">
                  Regional Store Network
                </h2>
                <p className="text-xs text-slate-400">
                  Physical distribution hubs holding inventory.
                </p>
              </div>

              <button
                onClick={() => setShowAddStoreModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Store Outlet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storesList.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        📍 {s.city_name} City
                      </span>
                      <h4 className="font-semibold text-sm text-white mt-0.5">
                        {s.store_name}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      ID #{s.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {s.address}
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400">{s.phone}</span>
                    <span className="text-slate-400">
                      {s.in_stock_count ?? 12} items ready
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT DYNAMIC AGRICULTURAL SERVICE                 */}
      {/* ============================================================== */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-outfit">
                  {editingServiceId
                    ? "Edit Agricultural Service"
                    : "Add New Agricultural Service"}
                </h3>
                <span className="text-xs text-slate-400">
                  Configure location availability ('All', 'Nearby Radius', or
                  specific hub checkmarks).
                </span>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => void handleSaveService(e)}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Multi-Crop Combine Harvester"
                    value={serviceForm.title}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, title: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Machinery Model / Specs
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Deere Heavy 4x4 Track"
                    value={serviceForm.model}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, model: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.rate_per_acre}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        rate_per_acre: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Price Unit
                  </label>
                  <input
                    type="text"
                    value={serviceForm.rate_unit}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        rate_unit: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Harvest Season"
                    value={serviceForm.tag}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, tag: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Service highlights, operator terms, grain retention..."
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  value={serviceForm.image_url}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      image_url: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              {/* 🌟 COVERAGE MODE RADIO SELECTOR */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Location Coverage Mode *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "ALL_HUBS", label: "🌐 All Mandi Hubs" },
                    { key: "NEARBY_ONLY", label: "📍 Nearby Radius Only" },
                    { key: "SPECIFIC_HUBS", label: "📌 Specific Hubs Only" },
                  ].map((mode) => (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() =>
                        setServiceForm({
                          ...serviceForm,
                          coverage_mode: mode.key as any,
                        })
                      }
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                        serviceForm.coverage_mode === mode.key
                          ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Nearby Radius Selected */}
              {serviceForm.coverage_mode === "NEARBY_ONLY" && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Maximum Dispatch Radius (KM from Hub)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.max_distance_km}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        max_distance_km: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    placeholder="e.g. 35"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Farmers further than this radius from the selected hub will
                    see dispatch unavailable.
                  </span>
                </div>
              )}

              {/* 🌟 HUB CHECKBOXES & LOCALIZED PRICING */}
              {serviceForm.coverage_mode === "SPECIFIC_HUBS" && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Available Mandi Outlets &amp; Custom Rates (Optional)
                  </label>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {storesList.map((store) => {
                      const isChecked = serviceForm.selected_store_ids.includes(
                        store.id,
                      );

                      return (
                        <div
                          key={store.id}
                          className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl"
                        >
                          <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setServiceForm({
                                    ...serviceForm,
                                    selected_store_ids: [
                                      ...serviceForm.selected_store_ids,
                                      store.id,
                                    ],
                                  });
                                } else {
                                  setServiceForm({
                                    ...serviceForm,
                                    selected_store_ids:
                                      serviceForm.selected_store_ids.filter(
                                        (id) => id !== store.id,
                                      ),
                                  });
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-700"
                            />
                            <span>
                              {store.store_name} ({store.city_name})
                            </span>
                          </label>

                          {isChecked && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                ₹ Rate:
                              </span>
                              <input
                                type="number"
                                placeholder={`Base ₹${serviceForm.rate_per_acre}`}
                                value={serviceForm.custom_rates?.[store.id] ?? ''}
                                onChange={(e) =>
                                  setServiceForm({
                                    ...serviceForm,
                                    custom_rates: {
                                      ...serviceForm.custom_rates,
                                      [store.id]: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={serviceForm.is_active}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-slate-700"
                />
                <label
                  htmlFor="isActiveCheck"
                  className="text-xs text-slate-300 cursor-pointer font-medium"
                >
                  Service is active and available on storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {editingServiceId ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-outfit mb-1">
              Add New Agricultural Master Product
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Saves in `products` table and syncs default store inventories.
            </p>

            <form
              onSubmit={(e) => void handleCreateProduct(e)}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pioneer 3396 Hybrid Maize Seeds (5 Kg)"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PNR-MZ-3396"
                    value={newProduct.sku}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sku: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        category_id: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Specifications, grain dosage, or application details..."
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  Product Image (Device File or Web URL)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium cursor-pointer transition shrink-0">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>
                      {uploadingImage ? "Uploading..." : "Upload Device Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleFileUpload(e)}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      value={newProduct.image_url}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          image_url: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Create Product &amp; Init Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-outfit">
                  Update Agricultural Product
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Product ID #{editingProduct.id} · SKU: {editingProduct.sku}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => void handleUpdateProductSubmit(e)}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sku: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  Update Product Photo
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium cursor-pointer transition shrink-0">
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>
                      {uploadingEditImage ? "Uploading..." : "Upload New Photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleEditFileUpload(e)}
                      className="hidden"
                      disabled={uploadingEditImage}
                    />
                  </label>

                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      value={editingProduct.image_url}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          image_url: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingEditImage}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-outfit mb-1">
              Add New Category
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Creates a category row in MySQL.
            </p>

            <form
              onSubmit={(e) => void handleCreateCategory(e)}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Irrigation &amp; Drip"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. irrigation-drip"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Store */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-outfit mb-1">
              Add Store / Mandi Outlet
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Initializes default stock for all products at this hub.
            </p>

            <form
              onSubmit={(e) => void handleCreateStore(e)}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dehati Sansar Kisan Hub - Nagpur"
                  value={newStore.store_name}
                  onChange={(e) =>
                    setNewStore({ ...newStore, store_name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  City Location *
                </label>
                <select
                  value={newStore.city_id}
                  onChange={(e) =>
                    setNewStore({
                      ...newStore,
                      city_id: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {(data?.data?.cities || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Cotton Mandi Yard"
                  value={newStore.address}
                  onChange={(e) =>
                    setNewStore({ ...newStore, address: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newStore.phone}
                  onChange={(e) =>
                    setNewStore({ ...newStore, phone: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: DB Diagnostics */}
      {showDBModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-300">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-outfit">
                    Real Database Connection
                  </h3>
                  <p className="text-xs text-slate-400">MySQL Server Status</p>
                </div>
              </div>
              <button
                onClick={() => setShowDBModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl border bg-slate-950 space-y-2 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                    dbStatus?.isRealMySQL
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : "bg-amber-950 text-amber-300 border border-amber-700"
                  }`}
                >
                  {dbStatus?.isRealMySQL
                    ? "● Live MySQL Connected"
                    : "● Local Engine Active"}
                </span>
              </div>
              {dbStatus?.isRealMySQL && (
                <div className="text-xs font-mono space-y-1 pt-1 text-slate-300">
                  <div>
                    <span className="text-slate-500">Host:</span>{" "}
                    {dbStatus.host}:{dbStatus.port || 3306}
                  </div>
                  <div>
                    <span className="text-slate-500">Database:</span>{" "}
                    {dbStatus.database}
                  </div>
                  <div>
                    <span className="text-slate-500">User:</span>{" "}
                    {dbStatus.user}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDBModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => void handleReconnectDB()}
                disabled={isReconnecting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isReconnecting ? "animate-spin" : ""}`}
                />
                <span>{isReconnecting ? "Testing..." : "Test & Connect"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
