import React, { useEffect, useState } from "react";
import {
  X,
  Plus,
  Building2,
  Share2,
  Layers,
} from "lucide-react";
import {
  rentalLifecycleService,
  Unit,
} from "@/services/rentalLifecycle.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/app/hooks";
import { canAccess } from "@/lib/permissions";
import { DataTablePagination } from "@/components/ui/DataTablePagination";
import type { Property } from "@/types";

interface Props {
  property: Property;
  onClose: () => void;
}

export default function PropertyUnitsModal({ property, onClose }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const canCreateUnit = canAccess(user, "unit.create") || canAccess(user, "property.update");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Add Unit Form State
  const [isAdding, setIsAdding] = useState(false);
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [unitType, setUnitType] = useState("FLAT_2BHK");
  const [rentAmount, setRentAmount] = useState(property.rent || 15000);
  const [depositAmount, setDepositAmount] = useState(30000);
  const [furnishing, setFurnishing] = useState("SEMI_FURNISHED");
  const [savingUnit, setSavingUnit] = useState(false);

  // Quick Publish Modal
  const [publishingUnit, setPublishingUnit] = useState<Unit | null>(null);
  const [listingTitle, setListingTitle] = useState("");
  const [category, setCategory] = useState("RESIDENTIAL");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadUnits();
  }, [property.id]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await rentalLifecycleService.listUnits(property.id);
      setUnits(data);
    } catch (err) {
      console.error("Failed to load units", err);
    } finally {
      setLoading(false);
    }
  };

  const paginatedUnits = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return units.slice(start, start + pageSize);
  }, [units, page, pageSize]);

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUnit(true);
    try {
      const created = await rentalLifecycleService.createUnit({
        propertyId: property.id,
        unitNumber,
        floor,
        type: unitType,
        rentAmount,
        depositAmount,
        furnishing,
        status: "VACANT",
      });
      setIsAdding(false);
      setUnitNumber("");
      if (created) {
        setUnits((prev) => [...prev, created]);
      }
      await loadUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create unit");
    } finally {
      setSavingUnit(false);
    }
  };

  const handleOpenPublish = (unit: Unit) => {
    setPublishingUnit(unit);
    setListingTitle(`${property.title} - ${unit.unitNumber} (${unit.type.replace("_", " ")})`);
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingUnit) return;
    setPublishing(true);
    try {
      await rentalLifecycleService.createListing({
        unitId: publishingUnit.id,
        title: listingTitle,
        category,
        monthlyRent: publishingUnit.rentAmount,
        securityDeposit: publishingUnit.depositAmount,
        furnishing: publishingUnit.furnishing,
        amenities: ["Water Supply", "Power Backup", "Security"],
      });
      setUnits((prev) =>
        prev.map((u) => (u.id === publishingUnit.id ? { ...u, status: "LISTED" } : u))
      );
      setPublishingUnit(null);
      await loadUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to publish listing");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold">
              <Layers className="w-4 h-4" />
              Multi-Unit Management
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{property.title}</h2>
            <p className="text-xs text-slate-500">
              {property.address}, {property.city}
            </p>
          </div>

          {!isAdding && canCreateUnit && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Unit / Flat</span>
            </Button>
          )}
        </div>

        {/* Add Unit Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateUnit}
            className="mb-8 p-5 bg-slate-50 rounded-2xl border border-blue-200 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900">Create New Unit</h4>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit / Flat Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A-101, Room 4"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="FLAT_1BHK">1 BHK Flat</option>
                  <option value="FLAT_2BHK">2 BHK Flat</option>
                  <option value="FLAT_3BHK">3 BHK Flat</option>
                  <option value="STUDIO">Studio Apartment</option>
                  <option value="ROOM">Single Room / PG</option>
                  <option value="SHOP">Commercial Shop</option>
                  <option value="OFFICE">Office Space</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing</label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FULLY_FURNISHED">Fully-Furnished</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingUnit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {savingUnit ? "Saving..." : "Save Unit"}
              </Button>
            </div>
          </form>
        )}

        {/* Units List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              No units have been added to this property yet. Click "Add Unit / Flat" above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-3">
              {paginatedUnits.map((u) => {
                const isOccupied = u.status === "OCCUPIED";
                const isListed = u.status === "LISTED";

                return (
                  <div
                    key={u.id}
                    className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">Unit {u.unitNumber}</span>
                        <span className="text-xs text-slate-500">Floor {u.floor}</span>
                        <Badge
                          tone={
                            isOccupied
                              ? "purple"
                              : isListed
                              ? "blue"
                              : "green"
                          }
                        >
                          {u.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Type: <strong className="text-slate-700">{u.type.replace("_", " ")}</strong></span>
                        <span>Rent: <strong className="text-slate-700">₹{u.rentAmount.toLocaleString()}</strong></span>
                        <span>Deposit: <strong className="text-slate-700">₹{u.depositAmount.toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.status === "VACANT" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPublish(u)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Publish to Marketplace</span>
                        </Button>
                      )}
                      {isListed && (
                        <span className="text-xs text-blue-700 font-semibold px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                          ✓ Active in Marketplace
                        </span>
                      )}
                      {isOccupied && (
                        <span className="text-xs text-slate-700 font-semibold px-3 py-1 bg-slate-200 rounded-lg">
                          Occupied by Lease
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DataTablePagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={units.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 12, 24, 50]}
              apiEndpoint={`GET /api/v1/units?propertyId=${property.id}`}
              className="rounded-2xl border border-slate-200 bg-white mt-3"
            />
          </div>
        )}

        {/* Publish to Marketplace Sub-Modal */}
        {publishingUnit && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setPublishingUnit(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Publish Unit {publishingUnit.unitNumber}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Make this unit publicly discoverable in the RentMate Rental Marketplace.
              </p>

              <form onSubmit={handlePublishListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={listingTitle}
                    onChange={(e) => setListingTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="RESIDENTIAL">Residential (Flats/PG)</option>
                    <option value="COMMERCIAL">Commercial (Shops/Offices)</option>
                    <option value="INDUSTRIAL">Industrial / Warehouse</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPublishingUnit(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={publishing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    {publishing ? "Publishing..." : "Confirm & Publish"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
