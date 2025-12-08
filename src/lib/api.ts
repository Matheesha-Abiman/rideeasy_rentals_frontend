const API_BASE_URL = "https://rideeasy-rentals-backend.vercel.app/api/v1";

export interface AuthResponse {
  message: string;
  data: {
    email: string;
    roles: string[];
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface Bike {
  _id: string;
  modelBike: string;
  brand: string;
  year: number;
  capacity: number;
  pricePerDay: number;
  isAvailable: boolean;
  numberPlate: string;
  images: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Rental {
  _id: string;
  bikeId:
    | string
    | { _id: string; modelBike: string; brand: string; images: string };
  userId:
    | string
    | { _id: string; email: string; firstname: string; lastname: string };
  rentalStart: string;
  rentalEnd: string;
  totalHours: number;
  totalPrice: number;
  status: "ONGOING" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  rentalId: string | { _id: string; totalPrice: number };
  user?: string;
  amount: number;
  method: "CASH" | "CARD" | "ONLINE";
  status: "PAID" | "PENDING" | "FAILED";
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ApiClient {
  private getAuthHeader() {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    return response.json();
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    return response.json();
  }

  // Bikes
  async getAllBikes(): Promise<Bike[]> {
    const response = await fetch(`${API_BASE_URL}/bike/getAll`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch bikes");
    const json = await response.json();
    return json.data;
  }

  async getBikeById(id: string): Promise<Bike> {
    const response = await fetch(`${API_BASE_URL}/bike/${id}`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch bike");
    const json = await response.json();
    return json.data;
  }

  async searchBikes(query: string): Promise<Bike[]> {
    const response = await fetch(
      `${API_BASE_URL}/bike?search=${encodeURIComponent(query)}`,
      {
        headers: this.getAuthHeader(),
      }
    );
    if (!response.ok) throw new Error("Failed to search bikes");
    const json = await response.json();
    return json.data;
  }

  async createBike(formData: FormData): Promise<Bike> {
    const response = await fetch(`${API_BASE_URL}/bike/create`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to create bike");
    const json = await response.json();
    return json.data;
  }

  async updateBike(id: string, formData: FormData): Promise<Bike> {
    const response = await fetch(`${API_BASE_URL}/bike/update/${id}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to update bike");
    const json = await response.json();
    return json.data;
  }

  async deleteBike(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/bike/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete bike");
  }

  // Rentals
  async getAllRentals(): Promise<Rental[]> {
    const response = await fetch(`${API_BASE_URL}/rental/getAll`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch rentals");
    const json = await response.json();
    return json.data;
  }

  async getRentalById(id: string): Promise<Rental> {
    const response = await fetch(`${API_BASE_URL}/rental/${id}`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch rental");
    const json = await response.json();
    return json.data;
  }

  async createRental(data: {
    bikeId: string;
    rentalStart: string;
    rentalEnd: string;
  }): Promise<Rental> {
    const response = await fetch(`${API_BASE_URL}/rental/create`, {
      method: "POST",
      headers: {
        ...this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create rental");
    const json = await response.json();
    return json.data;
  }

  async updateRentalStatus(id: string, status: string): Promise<Rental> {
    const response = await fetch(`${API_BASE_URL}/rental/status/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update rental status");
    const json = await response.json();
    return json.data;
  }

  async deleteRental(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rental/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete rental");
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payment/getAll`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch payments");
    const json = await response.json();
    return json.data;
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payment/${id}`, {
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch payment");
    const json = await response.json();
    return json.data;
  }

  async createPayment(data: {
    rentalId: string;
    amount: number;
    method: "CASH" | "CARD" | "ONLINE";
  }): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/payment/create`, {
      method: "POST",
      headers: {
        ...this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create payment");
    const json = await response.json();
    return json.data;
  }

  async deletePayment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/payment/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete payment");
  }
}

export const api = new ApiClient();
