"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";
import { upsertContactWithVerification } from "@/lib/api";
import AddressInput from "@/components/AddressInput";
import PhoneInput from "@/components/PhoneInput";
import AutocompleteInput from "@/components/AutocompleteInput";
import { AddressSuggestion } from "@/lib/addressService";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop";

export default function AddPropertyForm({
  onCreate,
  propertyId,
  onClose,
  onShowBetaRequest,
}: {
  onCreate: (p: Omit<Property, 'id'>) => void;
  propertyId?: string;
  onClose?: () => void;
  onShowBetaRequest?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [sendVerification, setSendVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    fullAddress: ""
  });

  // Parse address components from OpenCage result
  const parseAddressComponents = (suggestion: AddressSuggestion) => {
    const components = suggestion.address_components || [];
    let streetNumber = "";
    let streetName = "";
    let city = "";
    let state = "";
    let zip = "";

    components.forEach(component => {
      const types = component.types || [];
      if (types.includes("street_number")) {
        streetNumber = component.long_name;
      } else if (types.includes("route")) {
        streetName = component.long_name;
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name;
      } else if (types.includes("postal_code")) {
        zip = component.long_name;
      }
    });

    return {
      street: `${streetNumber} ${streetName}`.trim(),
      city,
      state,
      zip
    };
  };

  const handleAddressSuggestion = (suggestion: AddressSuggestion) => {
    const parsed = parseAddressComponents(suggestion);
    setAddressData({
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      fullAddress: suggestion.formatted_address
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !addressData.fullAddress.trim()) {
      alert("Property name and address are required.");
      return;
    }
    
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.zip) {
      alert("Please complete all address fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const context = {
        tenant_name: "—",
        unit: "—",
        address: addressData.fullAddress,
        hotline: "+1-555-0100",
        portal_url: "https://portal.example.com/login",
        property_name: name.trim(),
        tenant_phone: phone.trim() || "+10000000000",
      };

      // Send verification SMS if requested
      if (sendVerification && phone.trim()) {
        try {
          const result = await upsertContactWithVerification(phone.trim(), context, true, propertyId);
          if (result.verification_sent) {
            alert("Verification SMS sent successfully!");
          } else if (result.verification_error) {
            alert(`Failed to send verification SMS: ${result.verification_error}`);
          }
        } catch (error) {
          console.error("Error sending verification SMS:", error);
          alert("Failed to send verification SMS. Please try again.");
        }
      }

      const newProp: Omit<Property, 'id'> = {
        name: name.trim(),
        photo: photo.trim() || DEFAULT_PHOTO,
        phone: phone.trim() || "+10000000000",
        context,
      };

      onCreate(newProp);
      setName("");
      setPhone("");
      setPhoto("");
      setSendVerification(false);
      setAddressData({ street: "", city: "", state: "", zip: "", fullAddress: "" });
    } catch (error) {
      console.error("Error creating property:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create property. Please try again.";
      
      // Check if it's a property limit error
      if (errorMessage.includes("Property limit reached")) {
        // Close the add form and show beta request form
        onClose?.();
        onShowBetaRequest?.();
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = name.trim() && addressData.street && addressData.city && addressData.state && addressData.zip && phone.trim();

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Property Details</h2>
              <p className="text-blue-100">Add a new property to your portfolio</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-1"
              aria-label="Close form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-8 space-y-6">
          {/* Property Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80">
              Property Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Duplex"
              className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              required
            />
            {!name && (
              <div className="flex items-center gap-1 text-red-600 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please enter property name
              </div>
            )}
          </div>

          {/* Address Section - SIMPLIFIED */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground/80">Address Information</label>
            
            {/* Street Address with Autocomplete */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Street Address *
              </label>
              <AutocompleteInput
                value={addressData.street}
                onChange={(value) => setAddressData(prev => ({ ...prev, street: value }))}
                onSuggestionSelect={handleAddressSuggestion}
                placeholder="Start typing your address (e.g. 123 Main St)"
                required
              />
              <p className="text-xs text-gray-500">Type your address and select from the suggestions below</p>
            </div>

            {/* Address Fields - Only show after street address is filled */}
            {addressData.street && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">State</label>
                  <select
                    value={addressData.state}
                    onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  >
                    <option value="">Select State</option>
                    <option value="AL">AL</option>
                    <option value="AK">AK</option>
                    <option value="AZ">AZ</option>
                    <option value="AR">AR</option>
                    <option value="CA">CA</option>
                    <option value="CO">CO</option>
                    <option value="CT">CT</option>
                    <option value="DE">DE</option>
                    <option value="FL">FL</option>
                    <option value="GA">GA</option>
                    <option value="HI">HI</option>
                    <option value="ID">ID</option>
                    <option value="IL">IL</option>
                    <option value="IN">IN</option>
                    <option value="IA">IA</option>
                    <option value="KS">KS</option>
                    <option value="KY">KY</option>
                    <option value="LA">LA</option>
                    <option value="ME">ME</option>
                    <option value="MD">MD</option>
                    <option value="MA">MA</option>
                    <option value="MI">MI</option>
                    <option value="MN">MN</option>
                    <option value="MS">MS</option>
                    <option value="MO">MO</option>
                    <option value="MT">MT</option>
                    <option value="NE">NE</option>
                    <option value="NV">NV</option>
                    <option value="NH">NH</option>
                    <option value="NJ">NJ</option>
                    <option value="NM">NM</option>
                    <option value="NY">NY</option>
                    <option value="NC">NC</option>
                    <option value="ND">ND</option>
                    <option value="OH">OH</option>
                    <option value="OK">OK</option>
                    <option value="OR">OR</option>
                    <option value="PA">PA</option>
                    <option value="RI">RI</option>
                    <option value="SC">SC</option>
                    <option value="SD">SD</option>
                    <option value="TN">TN</option>
                    <option value="TX">TX</option>
                    <option value="UT">UT</option>
                    <option value="VT">VT</option>
                    <option value="VA">VA</option>
                    <option value="WA">WA</option>
                    <option value="WV">WV</option>
                    <option value="WI">WI</option>
                    <option value="WY">WY</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">Zip Code</label>
                  <input
                    type="text"
                    value={addressData.zip}
                    onChange={(e) => setAddressData(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="ZIP Code"
                    maxLength={5}
                    className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Apartment/Unit */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Apartment, Unit, Suite, or Floor # (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Floor 1, Unit 2A"
                className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground/80">Contact Information</label>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Phone Number *
              </label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="(404) 555-0123"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Property Photo URL (Optional)
              </label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://example.com/property-photo.jpg"
                className="w-full px-4 py-3 glass rounded-[19px] bg-input border border-border/50 text-gray-900 text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Verification Section */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Tenant Verification</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Send a welcome SMS to the tenant introducing them to Esto
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendVerification}
                    onChange={(e) => setSendVerification(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-blue-900">
                    Send verification SMS to tenant
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Property"}
            </button>
          </div>
        </form>
    </div>
  );
}