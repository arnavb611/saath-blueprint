import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, MapPin, Star, IndianRupee, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface ServiceFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  availability: 'all' | 'available' | 'busy';
  sortBy: 'rating' | 'price_low' | 'price_high' | 'reviews';
}

interface ServiceFiltersProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  locations: string[];
}

const ServiceFiltersComponent = ({ filters, onFiltersChange, locations }: ServiceFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: ServiceFilters = {
      location: '',
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
      availability: 'all',
      sortBy: 'rating',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.location !== '',
    filters.minPrice > 0 || filters.maxPrice < 5000,
    filters.minRating > 0,
    filters.availability !== 'all',
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter & Sort</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Location */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Location
            </label>
            <Select
              value={localFilters.location}
              onValueChange={(value) => setLocalFilters({ ...localFilters, location: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              Price Range: ₹{localFilters.minPrice} - ₹{localFilters.maxPrice}
            </label>
            <div className="px-2">
              <Slider
                value={[localFilters.minPrice, localFilters.maxPrice]}
                onValueChange={([min, max]) => setLocalFilters({ ...localFilters, minPrice: min, maxPrice: max })}
                min={0}
                max={5000}
                step={100}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: parseInt(e.target.value) || 0 })}
                className="w-1/2"
              />
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: parseInt(e.target.value) || 5000 })}
                className="w-1/2"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Star className="w-4 h-4 text-muted-foreground" />
              Minimum Rating
            </label>
            <Select
              value={localFilters.minRating.toString()}
              onValueChange={(value) => setLocalFilters({ ...localFilters, minRating: parseFloat(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any rating</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="3.5">3.5+ stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Availability
            </label>
            <Select
              value={localFilters.availability}
              onValueChange={(value: 'all' | 'available' | 'busy') => setLocalFilters({ ...localFilters, availability: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available Now</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sort By</label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value: 'rating' | 'price_low' | 'price_high' | 'reviews') => setLocalFilters({ ...localFilters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={handleReset} className="flex-1 gap-2">
            <X className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceFiltersComponent;
