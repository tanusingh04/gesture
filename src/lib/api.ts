// Use proxy in development, or direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api');

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async signUp(data: { email: string; password: string; name: string; phone?: string }) {
    return this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signIn(data: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Products
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async getProduct(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async getProductByBarcode(barcode: string) {
    return this.request<any>(`/products/barcode/${barcode}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(data: { items: any[]; address: any; paymentMethod: string }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async requestReturnRefund(orderId: string, reason: string, items?: any[]) {
    return this.request<any>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason, items }),
    });
  }

  // Payment (COD only)
  async getPaymentStatus(orderId: string) {
    return this.request<any>(`/payment/status/${orderId}`);
  }

  // Address
  async validateAddress(data: { pincode?: string; latitude?: number; longitude?: number; address?: any }) {
    return this.request<any>('/address/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkPincode(pincode: string) {
    return this.request<any>(`/address/check/${pincode}`);
  }

  // Owner
  async getDashboard() {
    return this.request<any>('/owner/dashboard');
  }

  async getOwnerOrders(params?: { status?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.request<any[]>(`/owner/orders?${query.toString()}`);
  }

  // OTP
  async sendOTP(phone: string) {
    return this.request<{ success: boolean; message: string; otp?: string }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone: string, otp: string) {
    return this.request<{ success: boolean; message: string }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  }
}

export const api = new ApiClient();

