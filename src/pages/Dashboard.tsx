import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Bike, CreditCard, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { data: rentals = [] } = useQuery({
    queryKey: ["rentals"],
    queryFn: () => api.getAllRentals(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.getAllPayments(),
  });

  const { data: bikes = [] } = useQuery({
    queryKey: ["bikes"],
    queryFn: () => api.getAllBikes(),
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your rentals and bikes</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bikes</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bikes.length}</div>
              <p className="text-xs text-muted-foreground">
                {bikes.filter(b => b.isAvailable).length} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rentals.filter(r => r.status === "ONGOING").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {rentals.length} total rentals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                LKR {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.length} payments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rentals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="rentals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rentals</CardTitle>
                <CardDescription>View and manage all rental bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {rentals.length === 0 ? (
                  <p className="text-center text-muted-foreground">No rentals yet</p>
                ) : (
                  <div className="space-y-4">
                    {rentals.map((rental) => (
                      <div
                        key={rental._id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">Rental #{rental._id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rental.rentalStart).toLocaleDateString()} - 
                            {new Date(rental.rentalEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">LKR {rental.totalPrice}</p>
                          <p className="mt-1">
                            {getStatusBadge(rental.status, "rental")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center text-muted-foreground">No payments yet</p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">Payment #{payment._id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">{payment.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">LKR {payment.amount}</p>
                          <p className="mt-1">
                            {getStatusBadge(payment.status, "payment")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;