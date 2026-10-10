import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import {
  MapPin,
  Search,
  Filter,
  CheckCircle,
  Home,
  IndianRupee,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import {
  rentalLifecycleService,
  RentalListing,
} from "@/services/rentalLifecycle.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export default function RentalsMarketplacePage() {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedListing, setSelectedListing] = useState<RentalListing | null>(null);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantOccupation, setApplicantOccupation] = useState("");
  const [applicantMessage, setApplicantMessage] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
  });

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedCity]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== "ALL") params.category = selectedCategory;
      if (selectedCity) params.city = selectedCity;
      if (search) params.search = search;
      const data = await rentalLifecycleService.listPublicListings(params);
      setListings(data);
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleOpenApply = (listing: RentalListing) => {
    if (!currentUser) {
      if (window.confirm("You must log in to submit a rental application. Would you like to log in now?")) {
        navigate("/login?redirect=/rentals");
      }
      return;
    }
    setSelectedListing(listing);
    setApplicantName(currentUser.name || "");
    setApplicantPhone(currentUser.mobile || "");
    setAppSuccess(false);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setSubmittingApp(true);
    try {
      await rentalLifecycleService.submitApplication({
        listingId: selectedListing.id,
        name: applicantName,
        phone: applicantPhone,
        occupation: applicantOccupation,
        message: applicantMessage,
      });
      setAppSuccess(true);
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed to submit application",
      });
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Rentals Marketplace
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Discover Verified Homes & Spaces
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore flats, PG rooms, commercial shops, and office spaces directly from verified owners on RentMate.
        </p>

        {/* Search & Filter Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm flex flex-col md:flex-row gap-2.5"
        >
          <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by locality, building name, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
            />
          </div>

          <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200 md:w-52">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="City (e.g. Mumbai)"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full py-2.5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm"
            />
          </div>

          <Button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Search
          </Button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { id: "ALL", label: "All Properties" },
            { id: "RESIDENTIAL", label: "Residential (Flats/PG)" },
            { id: "COMMERCIAL", label: "Commercial (Shops/Offices)" },
            { id: "INDUSTRIAL", label: "Industrial / Warehouses" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-20 p-6 bg-white border border-slate-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Rental Listings Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              There are currently no listings matching your search filters. Try clearing your filters or search keywords.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <Card
                key={item.id}
                hoverEffect
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition flex flex-col group shadow-xs"
              >
                {/* Header Badge & Rent Banner */}
                <div className="h-44 bg-gradient-to-tr from-slate-100 to-blue-50/70 border-b border-slate-100 relative p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-blue-700 border border-blue-100 shadow-xs">
                      {item.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 flex items-center">
                      <IndianRupee className="w-5 h-5 text-emerald-600" />
                      {item.monthlyRent.toLocaleString()}
                      <span className="text-xs text-slate-500 font-normal ml-1">/month</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Deposit: ₹{item.securityDeposit.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                      {item.title}
                    </h3>

                    <div className="flex items-center text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
                      <span className="truncate">
                        {item.property?.address}, {item.property?.city}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 text-xs">
                      {item.unit && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                          Unit {item.unit.unitNumber}
                        </span>
                      )}
                      {item.furnishing && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                          {item.furnishing.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    {item.amenities && item.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.amenities.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-blue-600" />
                            <span>{a}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {item.unit?.type || "Standard Unit"}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleOpenApply(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 font-semibold shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply to Rent</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModalOpen && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {appSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Your application for <span className="text-blue-600 font-semibold">{selectedListing.title}</span> has been forwarded to the property owner. You can check your application in your Tenant Portal.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/tenant/my-rentals">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Go to Tenant Portal
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setApplyModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Rental Application
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Apply for {selectedListing.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Rent: ₹{selectedListing.monthlyRent.toLocaleString()}/mo • Deposit: ₹{selectedListing.securityDeposit.toLocaleString()}
                  </p>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer"
                        value={applicantOccupation}
                        onChange={(e) => setApplicantOccupation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message to Landlord
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Family size, move-in preferences, lease duration..."
                      value={applicantMessage}
                      onChange={(e) => setApplicantMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setApplyModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingApp}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingApp ? "Submitting..." : "Send Application"}</span>
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </div>
  );
}
