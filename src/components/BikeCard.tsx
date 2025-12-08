import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bike } from "@/lib/api";
import { Calendar, Gauge } from "lucide-react";

interface BikeCardProps {
  bike: Bike;
}

export const BikeCard = ({ bike }: BikeCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={bike.images || "/placeholder.svg"}
          alt={`${bike.brand} ${bike.modelBike}`}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Badge 
          className="absolute right-3 top-3" 
          variant={bike.isAvailable ? "default" : "secondary"}
        >
          {bike.isAvailable ? "Available" : "Rented"}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{bike.brand} {bike.modelBike}</h3>
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{bike.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            <span>{bike.capacity}cc</span>
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold text-primary">
          LKR {bike.pricePerDay}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={`/bikes/${bike._id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
