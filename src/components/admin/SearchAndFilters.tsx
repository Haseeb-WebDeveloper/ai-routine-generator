'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { PRODUCT_TYPES, SKIN_TYPES, SKIN_CONCERNS, GENDERS, BUDGETS, TEXTURES, USE_TIMES, CATEGORIES, AGE_RANGES } from '@/constants/product'

interface SearchAndFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: any
  setFilters: (filters: any) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  clearFilters: () => void
  handleFilterChange: (key: string, value: any) => void
  handleArrayFilterChange: (key: string, value: string, checked: boolean) => void
  filteredProductsCount: number
  totalProductsCount: number
}

export default function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  clearFilters,
  handleFilterChange,
  handleArrayFilterChange,
  filteredProductsCount,
  totalProductsCount
}: SearchAndFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filters</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products by name, brand, or instructions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Budget</Label>
                <Select
                  value={filters.budget}
                  onValueChange={(value) => handleFilterChange('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="All Budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    {BUDGETS.map((budget) => (
                      <SelectItem key={budget} value={budget}>
                        {budget}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => handleFilterChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Texture */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Texture</Label>
                <Select
                  value={filters.texture}
                  onValueChange={(value) => handleFilterChange('texture', value)}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="All Textures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Textures</SelectItem>
                    {TEXTURES.map((texture) => (
                      <SelectItem key={texture} value={texture}>
                        {texture}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    step="0.01"
                    value={filters.priceRange.min}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                    className="w-20"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    placeholder="Max"
                    type="number"
                    step="0.01"
                    value={filters.priceRange.max}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Fragrance Free */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fragrance Free</Label>
                <Select
                  value={filters.fragranceFree === null ? 'all' : filters.fragranceFree.toString()}
                  onValueChange={(value) => handleFilterChange('fragranceFree', value === 'all' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alcohol Free */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Alcohol Free</Label>
                <Select
                  value={filters.alcoholFree === null ? 'all' : filters.alcoholFree.toString()}
                  onValueChange={(value) => handleFilterChange('alcoholFree', value === 'all' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue className='cursor-pointer' placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi-select filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Skin Types */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skin Types</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {SKIN_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`filter_skin_${type}`}
                        checked={filters.skinTypes.includes(type)}
                        onCheckedChange={(checked) => handleArrayFilterChange('skinTypes', type, checked as boolean)}
                      />
                      <Label htmlFor={`filter_skin_${type}`} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skin Concerns */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skin Concerns</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {SKIN_CONCERNS.map((concern) => (
                    <div key={concern} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`filter_concern_${concern}`}
                        checked={filters.skinConcerns.includes(concern)}
                        onCheckedChange={(checked) => handleArrayFilterChange('skinConcerns', concern, checked as boolean)}
                      />
                      <Label htmlFor={`filter_concern_${concern}`} className="text-sm">
                        {concern}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Use Time</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {USE_TIMES.map((time) => (
                    <div key={time} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`filter_time_${time}`}
                        checked={filters.useTime.includes(time)}
                        onCheckedChange={(checked) => handleArrayFilterChange('useTime', time, checked as boolean)}
                      />
                      <Label htmlFor={`filter_time_${time}`} className="text-sm">
                        {time}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Ranges */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age Ranges</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {AGE_RANGES.map((age) => (
                    <div key={age} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`filter_age_${age}`}
                        checked={filters.ageRanges.includes(age)}
                        onCheckedChange={(checked) => handleArrayFilterChange('ageRanges', age, checked as boolean)}
                      />
                      <Label htmlFor={`filter_age_${age}`} className="text-sm">
                        {age}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">
                Showing {filteredProductsCount} of {totalProductsCount} products
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
