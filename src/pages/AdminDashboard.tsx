import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, Bike, Rental, Payment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

import {
  Bike as BikeIcon,
  DollarSign,
  Users,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  CalendarDays,
  Clock,
  Target,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BikeFormData {
  modelBike: string;
  brand: string;
  year: string;
  capacity: string;
  pricePerDay: string;
  numberPlate: string;
  isAvailable: boolean;
  image: File | null;
}

interface DeleteConfirmation {
  isOpen: boolean;
  type: "bike" | "rental" | "payment" | null;
  id: string;
  title: string;
  description: string;
}

interface PaymentModal {
  isOpen: boolean;
  rental: Rental | null;
}

const initialBikeForm: BikeFormData = {
  modelBike: "",
  brand: "",
  year: new Date().getFullYear().toString(),
  capacity: "",
  pricePerDay: "",
  numberPlate: "",
  isAvailable: true,
  image: null,
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const AdminDashboard = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBikes: 0,
    totalRentals: 0,
    totalRevenue: 0,
    activeRentals: 0,
  });

  const [showBikeModal, setShowBikeModal] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [bikeForm, setBikeForm] = useState<BikeFormData>(initialBikeForm);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    type: null,
    id: "",
    title: "",
    description: "",
  });

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({
    isOpen: false,
    rental: null,
  });
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "ONLINE">("CASH");
  const [processingPayment, setProcessingPayment] = useState(false);

  // Chart data states
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [rentalTrendData, setRentalTrendData] = useState<any[]>([]);
  const [bikePerformanceData, setBikePerformanceData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [statusDistributionData, setStatusDistributionData] = useState<any[]>([]);
  const [dailyRevenueData, setDailyRevenueData] = useState<any[]>([]);
  const [capacityDistributionData, setCapacityDistributionData] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rentals.length > 0 && payments.length > 0 && bikes.length > 0) {
      prepareChartData();
    }
  }, [rentals, payments, bikes]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bikesRes, rentalsRes, paymentsRes] = await Promise.all([
        api.getAllBikes(),
        api.getAllRentals(),
        api.getAllPayments(),
      ]);

      setBikes(bikesRes || []);
      setRentals(rentalsRes || []);
      setPayments(paymentsRes || []);

      const totalRevenue = (paymentsRes || [])
        .filter((p: Payment) => p.status === "PAID")
        .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
      const activeRentals = (rentalsRes || []).filter(
        (r: Rental) => r.status === "ONGOING"
      ).length;

      setStats({
        totalBikes: (bikesRes || []).length,
        totalRentals: (rentalsRes || []).length,
        totalRevenue,
        activeRentals,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error Loading Data",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    // Prepare daily revenue data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date,
        revenue: 0,
        rentals: 0
      };
    });

    payments.forEach(payment => {
      if (payment.status === "PAID" && payment.paidAt) {
        const paymentDate = new Date(payment.paidAt);
        last7Days.forEach(day => {
          if (
            paymentDate.getDate() === day.fullDate.getDate() &&
            paymentDate.getMonth() === day.fullDate.getMonth() &&
            paymentDate.getFullYear() === day.fullDate.getFullYear()
          ) {
            day.revenue += payment.amount || 0;
          }
        });
      }
    });

    rentals.forEach(rental => {
      if (rental.createdAt) {
        const rentalDate = new Date(rental.createdAt);
        last7Days.forEach(day => {
          if (
            rentalDate.getDate() === day.fullDate.getDate() &&
            rentalDate.getMonth() === day.fullDate.getMonth() &&
            rentalDate.getFullYear() === day.fullDate.getFullYear()
          ) {
            day.rentals += 1;
          }
        });
      }
    });

    setDailyRevenueData(last7Days.map(day => ({
      name: day.date,
      revenue: Math.round(day.revenue),
      rentals: day.rentals
    })));

    // Prepare rental trend data for last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date,
        revenue: 0,
        rentals: 0
      };
    });

    payments.forEach(payment => {
      if (payment.status === "PAID" && payment.paidAt) {
        const paymentDate = new Date(payment.paidAt);
        last6Months.forEach(month => {
          if (
            paymentDate.getMonth() === month.fullDate.getMonth() &&
            paymentDate.getFullYear() === month.fullDate.getFullYear()
          ) {
            month.revenue += payment.amount || 0;
          }
        });
      }
    });

    rentals.forEach(rental => {
      if (rental.createdAt) {
        const rentalDate = new Date(rental.createdAt);
        last6Months.forEach(month => {
          if (
            rentalDate.getMonth() === month.fullDate.getMonth() &&
            rentalDate.getFullYear() === month.fullDate.getFullYear()
          ) {
            month.rentals += 1;
          }
        });
      }
    });

    setRentalTrendData(last6Months.map(month => ({
      name: month.month,
      revenue: Math.round(month.revenue),
      rentals: month.rentals
    })));

    // Prepare bike performance data
    const bikePerformance = bikes.map(bike => {
      const bikeRentals = rentals.filter(r => 
        typeof r.bikeId === "object" && r.bikeId._id === bike._id
      );
      
      const revenue = bikeRentals.reduce((sum, rental) => {
        const payment = payments.find(p => p.rentalId === rental._id && p.status === "PAID");
        return sum + (payment?.amount || 0);
      }, 0);

      return {
        name: bike.modelBike.substring(0, 15) + (bike.modelBike.length > 15 ? '...' : ''),
        revenue: Math.round(revenue),
        rentals: bikeRentals.length,
        utilization: bikeRentals.length,
        fullName: bike.modelBike
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    setBikePerformanceData(bikePerformance);

    // Prepare payment method data
    const paymentMethods = ["CASH", "CARD", "ONLINE"];
    const methodData = paymentMethods.map(method => ({
      name: method,
      value: payments.filter(p => p.method === method && p.status === "PAID").length,
      revenue: payments
        .filter(p => p.method === method && p.status === "PAID")
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }));

    setPaymentMethodData(methodData);

    // Prepare status distribution data
    const statusTypes = ["ONGOING", "COMPLETED"];
    const statusData = statusTypes.map(status => ({
      name: status,
      value: rentals.filter(r => r.status === status).length,
      fill: status === "COMPLETED" ? "#00C49F" : 
            status === "ONGOING" ? "#0088FE" : 
            "#FF8042"
    }));

    setStatusDistributionData(statusData);

    // Prepare capacity distribution data
    const capacityGroups = [
      { range: "0-250cc", min: 0, max: 250 },
      { range: "251-500cc", min: 251, max: 500 },
      { range: "501-750cc", min: 501, max: 750 },
      { range: "751-1000cc", min: 751, max: 1000 },
      { range: "1000+ cc", min: 1001, max: Infinity }
    ];

    const capacityData = capacityGroups.map(group => {
      const bikesInRange = bikes.filter(bike => 
        bike.capacity >= group.min && bike.capacity <= group.max
      );
      return {
        name: group.range,
        count: bikesInRange.length,
        percentage: bikes.length > 0 ? Math.round((bikesInRange.length / bikes.length) * 100) : 0
      };
    }).filter(item => item.count > 0);

    setCapacityDistributionData(capacityData);
  };

  const handleOpenAddBike = () => {
    setEditingBike(null);
    setBikeForm(initialBikeForm);
    setImagePreview(null);
    setShowBikeModal(true);
  };

  const handleOpenEditBike = (bike: Bike) => {
    setEditingBike(bike);
    setBikeForm({
      modelBike: bike.modelBike,
      brand: bike.brand,
      year: bike.year.toString(),
      capacity: bike.capacity.toString(),
      pricePerDay: bike.pricePerDay.toString(),
      numberPlate: bike.numberPlate,
      isAvailable: bike.isAvailable,
      image: null,
    });
    setImagePreview(bike.images || null);
    setShowBikeModal(true);
  };

  const handleBikeFormChange = (field: keyof BikeFormData, value: string | boolean | File | null) => {
    setBikeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBikeFormChange("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!bikeForm.modelBike.trim()) {
      toast({ title: "Validation Error", description: "Model is required", variant: "destructive" });
      return false;
    }
    if (!bikeForm.brand.trim()) {
      toast({ title: "Validation Error", description: "Brand is required", variant: "destructive" });
      return false;
    }
    if (!bikeForm.year || isNaN(Number(bikeForm.year))) {
      toast({ title: "Validation Error", description: "Valid year is required", variant: "destructive" });
      return false;
    }
    if (!bikeForm.capacity || isNaN(Number(bikeForm.capacity))) {
      toast({ title: "Validation Error", description: "Valid capacity is required", variant: "destructive" });
      return false;
    }
    if (!bikeForm.pricePerDay || isNaN(Number(bikeForm.pricePerDay))) {
      toast({ title: "Validation Error", description: "Valid price is required", variant: "destructive" });
      return false;
    }
    if (!bikeForm.numberPlate.trim()) {
      toast({ title: "Validation Error", description: "Number plate is required", variant: "destructive" });
      return false;
    }
    if (!editingBike && !bikeForm.image) {
      toast({ title: "Validation Error", description: "Image is required for new bikes", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitBike = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("modelBike", bikeForm.modelBike.trim());
      formData.append("brand", bikeForm.brand.trim());
      formData.append("year", bikeForm.year);
      formData.append("capacity", bikeForm.capacity);
      formData.append("pricePerDay", bikeForm.pricePerDay);
      formData.append("numberPlate", bikeForm.numberPlate.trim());
      formData.append("isAvailable", bikeForm.isAvailable.toString());
      
      if (bikeForm.image) {
        formData.append("images", bikeForm.image);
      }

      if (editingBike) {
        await api.updateBike(editingBike._id, formData);
        toast({
          title: "Success",
          description: "Bike updated successfully",
        });
      } else {
        await api.createBike(formData);
        toast({
          title: "Success",
          description: "New bike added successfully",
        });
      }

      setShowBikeModal(false);
      setBikeForm(initialBikeForm);
      setImagePreview(null);
      loadData();
    } catch (error: any) {
      console.error("Error saving bike:", error);
      toast({
        title: "Error",
        description: error.message || (editingBike ? "Failed to update bike" : "Failed to add bike"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete confirmation handlers
  const openDeleteConfirmation = (type: "bike" | "rental" | "payment", id: string, itemName: string) => {
    const descriptions = {
      bike: `This will permanently delete the bike "${itemName}" from your inventory. This action cannot be undone.`,
      rental: `This will permanently delete this rental record. This action cannot be undone.`,
      payment: `This will permanently delete this payment record. This action cannot be undone.`,
    };

    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}?`,
      description: descriptions[type],
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.type || !deleteConfirmation.id) return;

    try {
      switch (deleteConfirmation.type) {
        case "bike":
          await api.deleteBike(deleteConfirmation.id);
          toast({
            title: "Bike Deleted",
            description: "The bike has been removed from your inventory.",
          });
          break;
        case "rental":
          await api.deleteRental(deleteConfirmation.id);
          toast({
            title: "Rental Deleted",
            description: "The rental record has been removed.",
          });
          break;
        case "payment":
          await api.deletePayment(deleteConfirmation.id);
          toast({
            title: "Payment Deleted",
            description: "The payment record has been removed.",
          });
          break;
      }
      loadData();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: `Failed to delete ${deleteConfirmation.type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmation({ isOpen: false, type: null, id: "", title: "", description: "" });
    }
  };

  // Rental status and payment handlers
  const handleUpdateRentalStatus = async (id: string, status: string) => {
    try {
      await api.updateRentalStatus(id, status);
      toast({
        title: "Status Updated",
        description: `Rental marked as ${status.toLowerCase()}.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update rental status.",
        variant: "destructive",
      });
    }
  };

  const openPaymentModal = (rental: Rental) => {
    setPaymentModal({ isOpen: true, rental });
    setPaymentMethod("CASH");
  };

  const handleCompleteWithPayment = async () => {
    if (!paymentModal.rental) return;

    setProcessingPayment(true);
    try {
      // First create the payment
      await api.createPayment({
        rentalId: paymentModal.rental._id,
        amount: paymentModal.rental.totalPrice,
        method: paymentMethod,
      });

      // Then update rental status to completed
      await api.updateRentalStatus(paymentModal.rental._id, "COMPLETED");

      toast({
        title: "Payment Recorded",
        description: `Payment of $${paymentModal.rental.totalPrice} has been recorded and rental marked as completed.`,
      });

      setPaymentModal({ isOpen: false, rental: null });
      loadData();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string, type: "rental" | "payment") => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      ONGOING: { variant: "default", className: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
      COMPLETED: { variant: "default", className: "bg-green-500/20 text-green-600 border-green-500/30" },
      CANCELLED: { variant: "destructive", className: "bg-red-500/20 text-red-600 border-red-500/30" },
      PAID: { variant: "default", className: "bg-green-500/20 text-green-600 border-green-500/30" },
      PENDING: { variant: "secondary", className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
      FAILED: { variant: "destructive", className: "bg-red-500/20 text-red-600 border-red-500/30" },
    };
    const config = variants[status] || { variant: "outline" as const, className: "" };
    return (
      <Badge variant="outline" className={config.className}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your bike rental business</p>
        </div>

        {/* Stats Grid - Your existing cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
              <BikeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBikes}</div>
              <p className="text-xs text-muted-foreground">Available for rent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRentals}</div>
              <p className="text-xs text-muted-foreground">Currently ongoing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRentals}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From paid rentals</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Added Charts Only */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold">Analytics Dashboard</h2>
          
          {/* First Row of Charts */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            {/* Daily Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Revenue (Last 7 Days)
                </CardTitle>
                <CardDescription>Revenue and rentals per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") return [`$${value}`, "Revenue"];
                          return [value, "Rentals"];
                        }}
                        labelStyle={{ color: '#333' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        name="Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rentals" 
                        stroke="#82ca9d" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        name="Rentals"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Monthly Trends (Last 6 Months)
                </CardTitle>
                <CardDescription>Revenue and rental trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rentalTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") return [`$${value}`, "Revenue"];
                          return [value, "Rentals"];
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rentals" 
                        stackId="2"
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

            {/* Payment Methods Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods Distribution
                </CardTitle>
                <CardDescription>Payment methods used by customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          if (name === "value") return [value, "Transactions"];
                          return [`$${value}`, "Revenue"];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <br />

            {/* Rental Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Rental Status Distribution
                </CardTitle>
                <CardDescription>Current status of all rentals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Management Tabs - Your existing tabs */}
        <Tabs defaultValue="bikes" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="bikes" className="gap-2">
              <BikeIcon className="h-4 w-4" />
              Bikes
            </TabsTrigger>
            <TabsTrigger value="rentals" className="gap-2">
              <Calendar className="h-4 w-4" />
              Rentals
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Bikes Tab */}
          <TabsContent value="bikes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bike Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Add, edit, and manage your bike inventory</p>
                </div>
                <Button onClick={handleOpenAddBike} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Bike
                </Button>
              </CardHeader>
              <CardContent>
                {bikes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BikeIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold">No bikes yet</h3>
                    <p className="text-sm text-muted-foreground">Add your first bike to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Number Plate</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Price/Day</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bikes.map((bike) => (
                          <TableRow key={bike._id}>
                            <TableCell>
                              <img
                                src={bike.images || "/placeholder.svg"}
                                alt={bike.modelBike}
                                className="h-10 w-14 rounded object-cover"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{bike.modelBike}</TableCell>
                            <TableCell>{bike.brand}</TableCell>
                            <TableCell className="font-mono text-sm">{bike.numberPlate}</TableCell>
                            <TableCell>{bike.year}</TableCell>
                            <TableCell>{bike.capacity}cc</TableCell>
                            <TableCell className="font-semibold">${bike.pricePerDay}</TableCell>
                            <TableCell>
                              <Badge variant={bike.isAvailable ? "default" : "secondary"}>
                                {bike.isAvailable ? "Available" : "Rented"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditBike(bike)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => openDeleteConfirmation("bike", bike._id, bike.modelBike)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            <Card>
              <CardHeader>
                <CardTitle>Rental Management</CardTitle>
                <p className="text-sm text-muted-foreground">View and manage all rental bookings</p>
              </CardHeader>
              <CardContent>
                {rentals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold">No rentals yet</h3>
                    <p className="text-sm text-muted-foreground">Rentals will appear here when customers book bikes</p>
                  </div>
                ) : (
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Bike</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rentals.map((rental) => (
                          <TableRow key={rental._id}>
                            <TableCell>
                              {typeof rental.userId === "object" ? rental.userId?.email : "N/A"}
                            </TableCell>
                            <TableCell className="font-medium">
                              {typeof rental.bikeId === "object" ? rental.bikeId?.modelBike : "N/A"}
                            </TableCell>
                            <TableCell>{formatDate(rental.rentalStart)}</TableCell>
                            <TableCell>{formatDate(rental.rentalEnd)}</TableCell>
                            <TableCell>{rental.totalHours}h</TableCell>
                            <TableCell className="font-semibold">${rental.totalPrice}</TableCell>
                            <TableCell>{getStatusBadge(rental.status, "rental")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {rental.status === "ONGOING" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600 hover:text-green-600 hover:bg-green-100"
                                      onClick={() => openPaymentModal(rental)}
                                      title="Complete & Add Payment"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => openDeleteConfirmation("rental", rental._id, "")}
                                  title="Delete Rental"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <p className="text-sm text-muted-foreground">Track all payment transactions</p>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <DollarSign className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold">No payments yet</h3>
                    <p className="text-sm text-muted-foreground">Payments will appear here when processed</p>
                  </div>
                ) : (
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Paid At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment._id}>
                            <TableCell className="font-mono text-sm">
                              {payment._id.slice(-8).toUpperCase()}
                            </TableCell>
                            <TableCell className="font-semibold">${payment.amount}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.method}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status, "payment")}</TableCell>
                            <TableCell>
                              {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openDeleteConfirmation("payment", payment._id, "")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Bike Modal */}
      <Dialog open={showBikeModal} onOpenChange={setShowBikeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBike ? "Edit Bike" : "Add New Bike"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBike} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modelBike">Model *</Label>
                <Input
                  id="modelBike"
                  value={bikeForm.modelBike}
                  onChange={(e) => handleBikeFormChange("modelBike", e.target.value)}
                  placeholder="e.g., CBR 600RR"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={bikeForm.brand}
                  onChange={(e) => handleBikeFormChange("brand", e.target.value)}
                  placeholder="e.g., Honda"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={bikeForm.year}
                  onChange={(e) => handleBikeFormChange("year", e.target.value)}
                  placeholder="e.g., 2023"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (cc) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={bikeForm.capacity}
                  onChange={(e) => handleBikeFormChange("capacity", e.target.value)}
                  placeholder="e.g., 600"
                  min="50"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Price per Day ($) *</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  value={bikeForm.pricePerDay}
                  onChange={(e) => handleBikeFormChange("pricePerDay", e.target.value)}
                  placeholder="e.g., 50"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberPlate">Number Plate *</Label>
                <Input
                  id="numberPlate"
                  value={bikeForm.numberPlate}
                  onChange={(e) => handleBikeFormChange("numberPlate", e.target.value)}
                  placeholder="e.g., ABC-1234"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Bike Image {!editingBike && "*"}</Label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-muted-foreground/25 px-4 py-3 transition-colors hover:border-primary">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {bikeForm.image ? bikeForm.image.name : "Choose file"}
                  </span>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-20 rounded object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isAvailable" className="cursor-pointer">Available for Rent</Label>
                <p className="text-sm text-muted-foreground">Toggle bike availability</p>
              </div>
              <Switch
                id="isAvailable"
                checked={bikeForm.isAvailable}
                onCheckedChange={(checked) => handleBikeFormChange("isAvailable", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBikeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBike ? "Update Bike" : "Add Bike"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && setDeleteConfirmation({ isOpen: false, type: null, id: "", title: "", description: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {deleteConfirmation.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmation.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      <Dialog open={paymentModal.isOpen} onOpenChange={(open) => !open && setPaymentModal({ isOpen: false, rental: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Complete Rental & Record Payment
            </DialogTitle>
          </DialogHeader>
          {paymentModal.rental && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bike:</span>
                  <span className="font-medium">
                    {typeof paymentModal.rental.bikeId === "object" ? paymentModal.rental.bikeId.modelBike : "N/A"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">
                    {typeof paymentModal.rental.userId === "object" ? paymentModal.rental.userId.email : "N/A"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{paymentModal.rental.totalHours} hours</span>
                </div>
                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">${paymentModal.rental.totalPrice}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: "CASH" | "CARD" | "ONLINE") => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentModal({ isOpen: false, rental: null })}>
                  Cancel
                </Button>
                <Button onClick={handleCompleteWithPayment} disabled={processingPayment}>
                  {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete & Record Payment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;