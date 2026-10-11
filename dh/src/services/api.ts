import axios from "axios";

const API = axios.create({
  baseURL: "https://dehati-sansar-api.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface MasterProduct {
  id: number;
  title: string;
  description: string;
  sku: string;
  category_name: string;
  image_url?: string;
  available_stores_count: number;
  min_price: number;
  max_price: number;
  total_stock: number;
}

export interface InventoryItem {
  id: number;
  store_id: number;
  store_name: string;
  store_phone: string;
  city_name: string;
  product_title: string;
  product_sku: string;
  category_name: string;
  price: number;
  stock: number;
  is_available: number;
}

export interface InquiryRecord {
  id: number;
  customer_name: string;
  customer_phone: string;
  product_title: string;
  product_sku: string;
  store_name: string;
  city_name: string;
  store_phone: string;
  message: string;
  status: string;
  created_at: string;
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  product_count?: number;
}

export interface StoreItem {
  id: number;
  store_name: string;
  city_name: string;
  city_id: number;
  address: string;
  phone: string;
  in_stock_count?: number;
}

export interface CityItem {
  id: number;
  name: string;
}

export interface AllDataResponse {
  counts: {
    products: number;
    inventory: number;
    queries: number;
    stores: number;
    categories: number;
    cities: number;
  };
  data: {
    products: MasterProduct[];
    inventory: InventoryItem[];
    queries: InquiryRecord[];
    categories: CategoryItem[];
    stores: StoreItem[];
    cities: CityItem[];
  };
}

export interface DBStatusResponse {
  isRealMySQL: boolean;
  database?: string;
  host?: string;
  port?: number;
  user?: string;
  lastConnectedAt?: string;
  errorMessage?: string;
  envDetected?: {
    hasHost: boolean;
    hasUser: boolean;
    hasPassword: boolean;
    hasDatabase: boolean;
    hasDatabaseUrl: boolean;
  };
}

export interface DBLocation {
  store_id: number;
  store_name: string;
  address: string;
  phone: string;
  city_id: number;
  city_name: string;
  lat: number;
  lng: number;
}

export interface StorefrontProduct {
  inventory_id: number;
  product_id: number;
  title: string;
  sku: string;
  category_name: string;
  description: string;
  price: number;
  stock: number;
  is_available: number;
  store_id: number;
  store_name: string;
  store_phone: string;
  city_name: string;
  image_url?: string;
}

export const fetchAllAdminData = async (): Promise<AllDataResponse> => {
  const res = await API.get<AllDataResponse>("/admin/all-data");
  return res.data;
};

export const fetchDBStatus = async (): Promise<DBStatusResponse> => {
  const res = await API.get<DBStatusResponse>("/admin/db-status");
  return res.data;
};

export const reconnectDB = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const res = await API.get<DBStatusResponse>("/admin/db-status");
  return {
    success: res.data.isRealMySQL,
    message: res.data.isRealMySQL
      ? `Connected to MySQL: ${res.data.database}`
      : res.data.errorMessage || "Failed to connect to MySQL",
  };
};

export const updateInquiryStatus = async (
  queryId: number,
  status: string,
): Promise<void> => {
  await API.patch(`/inquiries/${queryId}`, { status });
};

export const deleteInquiry = async (queryId: number): Promise<void> => {
  await API.delete(`/inquiries/${queryId}`);
};

export const updateInventoryItem = async (
  id: number,
  payload: { price: number; stock: number; is_available: number },
): Promise<void> => {
  await API.patch(`/inventory/${id}`, payload);
};

export const createProduct = async (product: {
  title: string;
  description: string;
  category_id: number;
  sku: string;
  image_url: string;
}): Promise<void> => {
  await API.post("/products", product);
};

// 🌟 UPDATE MASTER PRODUCT
export const updateProduct = async (
  id: number,
  product: {
    title: string;
    description: string;
    category_id: number;
    sku: string;
    image_url: string;
  },
): Promise<void> => {
  await API.put(`/products/${id}`, product);
};

// 🌟 DELETE MASTER PRODUCT
export const deleteProduct = async (id: number): Promise<void> => {
  await API.delete(`/products/${id}`);
};

export const createCategory = async (category: {
  name: string;
  slug: string;
  icon: string;
}): Promise<void> => {
  await API.post("/products/categories", category);
};

export const createStore = async (store: {
  store_name: string;
  city_id: number;
  address: string;
  phone: string;
}): Promise<void> => {
  await API.post("/products/stores", store);
};

export const fetchLocationsFromDB = async (): Promise<DBLocation[]> => {
  const res = await API.get<DBLocation[]>("/products/locations");
  return res.data;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await API.post<{ imageUrl: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.imageUrl;
};

export const fetchStorefrontProducts = async (): Promise<
  StorefrontProduct[]
> => {
  const res = await API.get<any[]>("/inventory");
  return res.data.map((item) => ({
    inventory_id: item.id,
    product_id: item.product_id || item.id,
    title: item.product_title,
    sku: item.product_sku,
    category_name: item.category_name,
    description: item.description || "",
    price: Number(item.price),
    stock: item.stock,
    is_available: item.is_available,
    store_id: item.store_id,
    store_name: item.store_name,
    store_phone: item.store_phone,
    city_name: item.city_name,
    image_url: item.image_url || "",
  }));
};

export const submitProductInquiry = async (payload: {
  customer_name: string;
  customer_phone: string;
  product_id: number;
  store_id: number;
  message: string;
}): Promise<{ success: boolean; id: number }> => {
  const res = await API.post("/inquiries", payload);
  return res.data;
};

export interface ServiceBookingItem {
  id: number;
  service_name: string;
  model_name?: string;
  farmer_name: string;
  farmer_phone: string;
  start_date: string;
  end_date: string;
  farm_acres: number;
  crop_type: string;
  village_address: string;
  store_id: number;
  store_name?: string;
  city_name?: string;
  store_phone?: string;
  requires_operator: number;
  estimated_cost: number;
  status: "Pending" | "Confirmed" | "In-Progress" | "Completed" | "Cancelled";
  notes?: string;
  created_at: string;
}

export const submitServiceBooking = async (payload: {
  service_name: string;
  model_name?: string;
  farmer_name: string;
  farmer_phone: string;
  start_date: string;
  end_date: string;
  farm_acres: number;
  crop_type?: string;
  village_address: string;
  store_id: number;
  requires_operator: boolean;
  estimated_cost: number;
}): Promise<{ success: boolean; booking_id: number }> => {
  const res = await API.post("/service-bookings", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const fetchAllServiceBookings = async (): Promise<
  ServiceBookingItem[]
> => {
  const res = await API.get("/service-bookings");
  return res.data;
};

export const updateServiceBookingStatus = async (
  id: number,
  status: string,
): Promise<void> => {
  await API.patch(`/service-bookings/${id}/status`, { status });
};

export const deleteServiceBooking = async (id: number): Promise<void> => {
  await API.delete(`/service-bookings/${id}`);
};

export interface ServiceHubAllocation {
  store_id: number;
  store_name: string;
  city_name: string;
  city_id: number;
  is_available: number;
  custom_rate: number | null;
}

export interface MasterService {
  id: number;
  title: string;
  slug: string;
  model: string | null;
  description: string;
  rate_per_acre: number;
  rate_unit: string;
  coverage_mode: "ALL_HUBS" | "NEARBY_ONLY" | "SPECIFIC_HUBS";
  max_distance_km: number;
  image_url: string;
  tag: string;
  specs: string[];
  is_active: number;
  hub_allocations: ServiceHubAllocation[];
}

export const fetchAllMasterServices = async (): Promise<MasterService[]> => {
  const res = await API.get<MasterService[]>("/services");
  return res.data;
};

export const createMasterService = async (payload: {
  title: string;
  slug?: string;
  model?: string;
  description?: string;
  rate_per_acre: number;
  rate_unit?: string;
  coverage_mode: "ALL_HUBS" | "NEARBY_ONLY" | "SPECIFIC_HUBS";
  max_distance_km?: number;
  image_url?: string;
  tag?: string;
  specs?: string[];
  is_active?: boolean;
  selected_store_ids: number[];
  custom_rates?: Record<string, number>;
}): Promise<{ success: boolean; service_id: number }> => {
  const res = await API.post("/services", payload);
  return res.data;
};

export const updateMasterService = async (
  id: number,
  payload: Partial<Omit<MasterService, "is_active">> & {
    is_active?: boolean;
    selected_store_ids?: number[];
    custom_rates?: Record<string, number>;
  },
): Promise<{ success: boolean }> => {
  const res = await API.put(`/services/${id}`, payload);
  return res.data;
};

export const deleteMasterService = async (
  id: number,
): Promise<{ success: boolean }> => {
  const res = await API.delete(`/services/${id}`);
  return res.data;
};
