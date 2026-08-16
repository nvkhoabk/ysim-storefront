export interface GigagoApiEnvelope<TResult, TExtra = unknown> {
  code: number;
  message: string;
  totalRecords: number;
  result: TResult | null;
  extra: TExtra | null;
}

export interface GigagoPackage {
  ggg_plan_id: string;
  apn: string;
  price: number;
  name: string;
  package_description: string;
  hotspot: string;
  network_type: string;
  phone_number: string;
  topup_extension: string;
  data: string;
  validity: string;
  countries: string;
  operator: string;
  parent_group_id: string;
  parent_group_name: string;
}

export interface GigagoPackageFilters {
  country?: string;
  region_type?: "ALL" | "LOCAL" | "MUL";
}

export interface GigagoCreateOrderItem {
  ggg_plan_id: string;
  amount: number;
}

export interface GigagoCreatePartnerOrderInput {
  request_id: string;
  orders: GigagoCreateOrderItem[];
  metadata: {
    note?: string;
    url_notify: string;
  };
}

export interface GigagoCreateOrderExtra {
  request_id: string;
  agency_order_id: number;
  code: string;
  notes?: string;
  status: number;
  order_status: string;
}

export interface GigagoAgencyOrder {
  id: string;
  total_price: number;
  notes: string;
  currency: string;
  total_esims: string;
  request_id: string;
  order_detail: string;
  total_esim_completed: number;
  order_date: string;
  agency_id: number;
  agency_name: string;
  user_id: number;
  order_status: number;
  order_status_name: string;
}

export interface GigagoDeliveredEsim {
  id: number;
  order_id: string;
  agency_id: number;
  iccid: string;
  currency: string;
  phone_number: string;
  channel_notes: string;
  request_id: string;
  status: number;
  status_name: string;
  price: number;
  ggg_plan_id: string;
  data: string;
  validity: string;
  user_id: number;
  username: string;
  order_date: string;
  qr_code: string;
  short_link: string;
}

export interface GigagoOrderQueryInput {
  requestId: string;
  page?: number;
  pageSize?: number;
}
