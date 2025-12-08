import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { BikeCard } from "@/components/BikeCard";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

const Bikes = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bikes = [], isLoading } = useQuery({
    queryKey: ["bikes", searchQuery],
    queryFn: () => searchQuery ? api.searchBikes(searchQuery) : api.getAllBikes(),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Browse Our Fleet</h1>
          <p className="text-muted-foreground">Find the perfect bike for your next adventure</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bikes by model or brand..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : bikes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-muted-foreground">No bikes found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bikes.map((bike) => (
              <BikeCard key={bike._id} bike={bike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bikes;
