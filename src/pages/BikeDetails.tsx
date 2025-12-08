import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Calendar, Gauge, ArrowLeft } from "lucide-react";
import { BookingDialog } from "@/components/BookingDialog";

const BikeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bike, isLoading } = useQuery({
    queryKey: ["bike", id],
    queryFn: () => api.getBikeById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl">Bike not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/bikes")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bikes
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={bike.images || "/placeholder.svg"}
              alt={`${bike.brand} ${bike.modelBike}`}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold">
                  {bike.brand} {bike.modelBike}
                </h1>
                <Badge variant={bike.isAvailable ? "default" : "secondary"}>
                  {bike.isAvailable
                    ? "Available for Rent"
                    : "Currently Rented"}
                </Badge>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    LKR {bike.pricePerDay}
                  </span>
                  <span className="text-muted-foreground">/day</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Year</span>
                    </div>
                    <p className="text-lg font-semibold">{bike.year}</p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Engine</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {bike.capacity}cc
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Number Plate
                    </p>
                    <p className="text-lg font-semibold">
                      {bike.numberPlate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ REAL BOOKING LOGIC */}
            {bike.isAvailable ? (
              <BookingDialog
                bikeId={bike._id}
                pricePerDay={bike.pricePerDay}
                bikeName={`${bike.brand} ${bike.modelBike}`}
              />
            ) : (
              <Button size="lg" className="w-full" disabled>
                Not Available
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeDetails;
