import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingDialogProps {
  bikeId: string;
  pricePerDay: number;
  bikeName: string;
}


export const BookingDialog = ({ bikeId, pricePerDay, bikeName }: BookingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState<number>(24);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRentalMutation = useMutation({
    mutationFn: (data: { bikeId: string; hours: number }) => api.createRental(data),
    onSuccess: () => {
      toast({
        title: "Booking Successful!",
        description: "Your rental has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      setOpen(false);
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to book a bike.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (hours < 1) {
      toast({
        title: "Invalid Hours",
        description: "Please enter at least 1 hour.",
        variant: "destructive",
      });
      return;
    }

    createRentalMutation.mutate({ bikeId, hours });
  };

  const totalPrice = Math.ceil((hours / 24) * pricePerDay);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <CreditCard className="mr-2 h-5 w-5" />
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {bikeName}</DialogTitle>
          <DialogDescription>
            Enter the number of hours you want to rent this bike
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Rental Duration (hours)</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="hours"
                type="number"
                min="1"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="pl-10"
                placeholder="Enter hours"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {(hours / 24).toFixed(1)} days
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span>Price per day:</span>
              <span className="font-medium">LKR {pricePerDay}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2">
              <span className="font-semibold">Total Price:</span>
              <span className="text-lg font-bold text-primary">
                LKR {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleBooking}
          disabled={createRentalMutation.isPending}
          className="w-full"
        >
          {createRentalMutation.isPending ? "Processing..." : "Confirm Booking"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};