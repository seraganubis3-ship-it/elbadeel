'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { useSession } from 'next-auth/react';
import { parseNationalId } from '@/lib/nationalIdParser';
import {
  PREDEFINED_FINES,
  calculateActualFineAmounts,
  calculateFineExpenses,
  calculateLostReportForServices,
  Fine,
} from '@/constants/fines';
import { calculateEstimatedDeliveryDate } from '@/lib/delivery-date';
import { formatWorkDate } from '@/lib/workDateHelper';
import { useToast } from '@/components/Toast';
import { Service, ServiceVariant, Category, Customer, initialFormData } from './types';
import { offlineManager } from '@/lib/offline-manager';

const normalizeSearchValue = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

const compareServiceOrder = (a: Service, b: Service) =>
  (a.orderIndex ?? Number.MAX_SAFE_INTEGER) - (b.orderIndex ?? Number.MAX_SAFE_INTEGER) ||
  a.name.localeCompare(b.name, 'ar');

export function useCreateOrder() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  // Stable refs for functions that change too often
  const showErrorRef = useRef(showError);
  const showSuccessRef = useRef(showSuccess);
  const showWarningRef = useRef(showWarning);

  useEffect(() => {
    showErrorRef.current = showError;
    showSuccessRef.current = showSuccess;
    showWarningRef.current = showWarning;
  }, [showError, showSuccess, showWarning]);

  // Services and Categories
  const [, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);

  // Customer
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [suggestedUser, setSuggestedUser] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  // Dependent search
  const [suggestedDependent, setSuggestedDependent] = useState<{ id: string; name: string } | null>(
    null
  );
  const [dependentSearchResults, setDependentSearchResults] = useState<
    { id: string; name: string }[]
  >([]);
  const [showDependentDropdown, setShowDependentDropdown] = useState(false);
  const [searchingDependent, setSearchingDependent] = useState(false);
  const [dependentSuggestion, setDependentSuggestion] = useState(''); // Ghost Text for Dependent
  const [suggestion, setSuggestion] = useState(''); // 👻 Ghost Text Suggestion (Customer)

  // Service search
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Attachments
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Serial number
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formSerialProvider, setFormSerialProvider] = useState<'AL_BADEL' | 'AL_WAFI'>('AL_BADEL');
  const [serialValid, setSerialValid] = useState<null | { ok: boolean; msg: string }>(null);
  const serialValidateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Phone duplicate detection
  const [phoneConflict, setPhoneConflict] = useState<Customer | null>(null);
  const phoneCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fines
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [finesList, setFinesList] = useState<Fine[]>(PREDEFINED_FINES);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showFinesDropdown, setShowFinesDropdown] = useState(false);
  const [finesSearchTerm, setFinesSearchTerm] = useState('');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');
  const [manualServices, setManualServices] = useState<{ [key: string]: number }>({});

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const hasFetchedRef = useRef(false);
  const submissionLockRef = useRef(false);

  // Form data
  const [formData, setFormData] = useState(initialFormData);

  // Computed required documents from selected service
  const requiredDocuments = useMemo(() => {
    if (!selectedService?.documents) return [];
    return selectedService.documents.filter(doc => doc.required).map(doc => doc.title);
  }, [selectedService]);

  const orderedServices = useMemo(() => {
    return [...services].sort(compareServiceOrder);
  }, [services]);

  // Filter services based on search term while keeping the admin services order.
  const filteredServices = useMemo(() => {
    const searchTerm = normalizeSearchValue(serviceSearchTerm);
    if (!searchTerm) return orderedServices;

    return orderedServices
      .map(service => {
        const name = normalizeSearchValue(service.name);
        const slug = normalizeSearchValue(service.slug);

        if (name.startsWith(searchTerm)) return { service, rank: 0 };
        if (slug.startsWith(searchTerm)) return { service, rank: 1 };
        if (name.includes(searchTerm)) return { service, rank: 2 };
        if (slug.includes(searchTerm)) return { service, rank: 3 };

        return null;
      })
      .filter((item): item is { service: Service; rank: number } => item !== null)
      .sort((a, b) => a.rank - b.rank || compareServiceOrder(a.service, b.service))
      .map(item => item.service);
  }, [orderedServices, serviceSearchTerm]);

  // Reset serial when variant changes
  useEffect(() => {
    setSerialValid(null);
    setFormSerialNumber('');
  }, [selectedVariant?.id]);

  // Validate serial live
  const validateSerialLive = useCallback(
    (value: string) => {
      setFormSerialNumber(value);
      setSerialValid(null);
      if (serialValidateTimeout.current) clearTimeout(serialValidateTimeout.current);
      if (!value || !selectedVariant?.id) return;
      serialValidateTimeout.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            variantId: selectedVariant!.id,
            serial: value,
            provider: formSerialProvider,
          });
          const res = await fetch(`/api/admin/forms/validate-serial?${params.toString()}`, {
            credentials: 'include',
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            setSerialValid({ ok: true, msg: 'رقم الاستمارة متاح' });
          } else {
            setSerialValid({ ok: false, msg: data.message || 'غير صالح' });
          }
        } catch {
          setSerialValid({ ok: false, msg: 'تعذر التحقق الآن' });
        }
      }, 400);
    },
    [selectedVariant, formSerialProvider]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortController) abortController.abort();
    };
  }, [abortController]);

  // Fetch services and categories on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchInitialData = async () => {
      try {
        const prefetchRes = await fetch('/api/admin/offline/prefetch');
        if (prefetchRes.ok) {
          const prefetchData = await prefetchRes.json();
          if (prefetchData.success) {
            await offlineManager.savePrefetchedData(prefetchData.data);
            setServices(prefetchData.data.services);
            setFinesList(prefetchData.data.fines);
            setCategories([]); // Note: categories structure might need adjustment if needed
          }
        } else {
          // Fallback to offline storage if prefetch fails
          const offlineServices = await offlineManager.getServices();
          const offlineFines = await offlineManager.getFines();
          if (offlineServices.length > 0) setServices(offlineServices);
          if (offlineFines.length > 0) setFinesList(offlineFines);
        }
      } catch (error) {
        // Fallback to offline storage on network error
        const offlineServices = await offlineManager.getServices();
        const offlineFines = await offlineManager.getFines();
        if (offlineServices.length > 0) setServices(offlineServices);
        if (offlineFines.length > 0) setFinesList(offlineFines);
        showWarningRef.current(
          'أنت تعمل الآن في وضع الأوفلاين',
          'فشل الاتصال بالخادم، تم تحميل البيانات من الذاكرة المحلية.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle escape key for address modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddressModal) {
        setShowAddressModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddressModal]);

  // Search customer
  const searchCustomer = useCallback(
    (name: string) => {
      setCustomer(prev => (prev && prev.name !== name ? null : prev));
      if (abortController) abortController.abort();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (name.length >= 1) {
        const timeout = setTimeout(async () => {
          const controller = new AbortController();
          setAbortController(controller);
          setSearching(true);
          try {
            if (typeof window !== 'undefined' && !navigator.onLine) {
              const localResults = await offlineManager.searchCustomers(name);
              if (localResults.length > 0) {
                setSearchResults(localResults);
                setSuggestedUser(localResults[0]);
                setShowSearchDropdown(true);
                const bestMatch = localResults[0].name;
                if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
                  setSuggestion(bestMatch);
                } else {
                  setSuggestion('');
                }
              } else {
                setSearchResults([]);
                setSuggestedUser(null);
                setShowSearchDropdown(false);
                setSuggestion('');
              }
              return;
            }

            const params = new URLSearchParams();
            if (name) params.append('name', name);
            const response = await fetch(`/api/admin/users/search?${params.toString()}`, {
              signal: controller.signal,
            });
            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data.users) && data.users.length > 0) {
                setSearchResults(data.users);
                setSuggestedUser(data.users[0]);
                setShowSearchDropdown(true);

                // Update local cache with fresh data
                for (const user of data.users) {
                  await offlineManager.upsertCustomer(user);
                }

                // Calculate Ghost Text Suggestion
                const bestMatch = data.users[0].name;
                if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
                  setSuggestion(bestMatch);
                } else {
                  setSuggestion('');
                }
              } else {
                // If server returns no results, try local search as fallback
                const localResults = await offlineManager.searchCustomers(name);
                if (localResults.length > 0) {
                  setSearchResults(localResults);
                  setSuggestedUser(localResults[0]);
                  setShowSearchDropdown(true);
                  const bestMatch = localResults[0].name;
                  if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
                    setSuggestion(bestMatch);
                  }
                } else {
                  setSearchResults([]);
                  setSuggestedUser(null);
                  setShowSearchDropdown(false);
                }
              }
            } else {
              // If server request fails, use local results
              const localResults = await offlineManager.searchCustomers(name);
              if (localResults.length > 0) {
                setSearchResults(localResults);
                setSuggestedUser(localResults[0]);
                setShowSearchDropdown(true);
                const bestMatch = localResults[0].name;
                if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
                  setSuggestion(bestMatch);
                }
              }
            }
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              // On error, try local search as fallback
              const localResults = await offlineManager.searchCustomers(name);
              if (localResults.length > 0) {
                setSearchResults(localResults);
                setSuggestedUser(localResults[0]);
                setShowSearchDropdown(true);
                const bestMatch = localResults[0].name;
                if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
                  setSuggestion(bestMatch);
                }
              }
            }
          } finally {
            setSearching(false);
            setAbortController(null);
          }
        }, 300);
        searchTimeoutRef.current = timeout;
      } else {
        setSuggestedUser(null);
        setSearchResults([]);
        setShowSearchDropdown(false);
        setCustomer(null);
        setSearching(false);
        setSuggestion('');
      }
    },
    [abortController]
  );

  // Check if phone already exists for a different customer
  const checkPhoneExists = useCallback(
    async (phone: string) => {
      if (phone.length !== 11) {
        setPhoneConflict(null);
        return;
      }
      try {
        const res = await fetch(`/api/admin/users/search?name=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users) && data.users.length > 0) {
            const match = data.users.find((u: any) => u.phone?.replace(/\D/g, '') === phone);
            if (match && match.id !== customer?.id) {
              setPhoneConflict(match);
              return;
            }
          }
        }
      } catch {}
      setPhoneConflict(null);
    },
    [customer]
  );

  // Trigger phone check whenever phone changes
  useEffect(() => {
    if (phoneCheckTimeout.current) clearTimeout(phoneCheckTimeout.current);
    if (formData.customerPhone.length === 11) {
      if (customer && customer.phone?.replace(/\D/g, '') !== formData.customerPhone) {
        setCustomer(null);
      }
      // Don't flag if we already selected this customer
      if (customer && customer.phone?.replace(/\D/g, '') === formData.customerPhone) {
        setPhoneConflict(null);
        return;
      }
      phoneCheckTimeout.current = setTimeout(() => checkPhoneExists(formData.customerPhone), 400);
    } else {
      setPhoneConflict(null);
    }
    return () => {
      if (phoneCheckTimeout.current) clearTimeout(phoneCheckTimeout.current);
    };
  }, [formData.customerPhone, customer, checkPhoneExists]);

  const dismissPhoneConflict = useCallback(() => {
    setPhoneConflict(null);
  }, []);

  // Select customer
  const selectCustomer = useCallback((cust: Customer) => {
    setCustomer(cust);

    let formattedBirthDate = '';
    if (cust.birthDate) {
      const date = new Date(cust.birthDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedBirthDate = `${day}/${month}/${year}`;
    }

    setFormData(prev => ({
      ...prev,
      customerName: cust.name || '',
      customerPhone: cust.phone || '',
      additionalPhone: cust.additionalPhone || '',
      customerEmail: cust.email || '',
      address: cust.address || '',
      governorate: cust.governorate || '',
      city: cust.city || '',
      district: cust.district || '',
      street: cust.street || '',
      buildingNumber: cust.buildingNumber || '',
      apartmentNumber: cust.apartmentNumber || '',
      landmark: cust.landmark || '',
      birthDate: formattedBirthDate,
      idNumber: cust.idNumber || '',
      fatherName: cust.fatherName || '',
      motherName: cust.motherName || '',

      gender: cust.gender ? cust.gender.toUpperCase() : '',
      wifeName: cust.wifeName || '',
      age:
        formattedBirthDate && formattedBirthDate.length === 10
          ? (() => {
              const [day, month, year] = formattedBirthDate.split('/');
              if (day && month && year) {
                const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return Math.floor(
                  (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                ).toString();
              }
              return '';
            })()
          : '',
    }));
    setShowSearchDropdown(false);
    setPhoneConflict(null);
    setSearchResults([]);
    setSuggestion('');
  }, []);

  // Select service
  const selectService = useCallback((service: Service) => {
    setSelectedService(service);
    setServiceSearchTerm(service.name);
    setShowServiceDropdown(false);
    setSelectedVariant(null);
  }, []);

  // Calculate total
  const calculateTotal = useCallback(() => {
    if (!selectedVariant) return 0;
    let total = selectedVariant.priceCents * formData.quantity;

    // Photography fee
    if (formData.photographyLocation === 'dandy_mall') total += 200 * 100;
    else if (formData.photographyLocation === 'civil_registry_haram') total += 50 * 100;
    else if (formData.photographyLocation === 'home_photography') total += 200 * 100;

    // Delivery fee
    if (formData.deliveryType === 'ADDRESS') total += formData.deliveryFee * 100;

    // Fines
    total += calculateActualFineAmounts(selectedFines);
    total += calculateFineExpenses(selectedFines);
    total += calculateLostReportForServices(selectedFines);

    // Manual services
    const manualServicesTotal = Object.values(manualServices).reduce(
      (sum, amount) => sum + amount * 100,
      0
    );
    total += manualServicesTotal;

    // Other fees
    total += formData.otherFees * 100;

    // Passport Surcharge: 200 EGP for Agouza, Zayed, 6 October (Normal/Urgent only)
    const isPassportService =
      selectedService?.slug?.toLowerCase().includes('passport') ||
      selectedService?.name?.toLowerCase().includes('passport') ||
      selectedService?.name?.includes('جواز');

    if (
      isPassportService &&
      selectedVariant &&
      (selectedVariant.name.includes('عادي') || selectedVariant.name.includes('سريع'))
    ) {
      const station = formData.policeStation?.trim();
      if (['العجوزة', 'الشيخ زايد', '6 أكتوبر'].includes(station)) {
        total += 20000;
      }
    }

    // Discount
    const discountAmount = parseFloat(formData.discount) || 0;
    total -= discountAmount * 100;

    return Math.max(0, total);
  }, [
    selectedVariant,
    formData.quantity,
    formData.photographyLocation,
    formData.deliveryType,
    formData.deliveryFee,
    selectedFines,
    manualServices,
    formData.otherFees,
    formData.discount,
    formData.policeStation,
    selectedService?.slug,
    selectedService?.name,
  ]);

  // Update remaining amount
  useEffect(() => {
    const total = calculateTotal();
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const remaining = Math.max(0, total - paidAmount * 100);
    setFormData(prev => ({ ...prev, remainingAmount: remaining / 100 }));
  }, [formData.paidAmount, calculateTotal]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const finesContainer = target.closest('.fines-dropdown-container');
      const servicesContainer = target.closest('.services-dropdown-container');
      const mainServiceContainer = target.closest('.service-selection-dropdown-container');

      if (finesContainer || servicesContainer || mainServiceContainer) return;

      setShowFinesDropdown(false);
      setShowServicesDropdown(false);
      setShowServiceDropdown(false);

      setFinesSearchTerm('');
      setServicesSearchTerm('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (hasFetchedRef.current) return;
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        const allServices: Service[] = [];
        data.categories.forEach((category: Category) => {
          allServices.push(...category.services);
        });
        setServices(allServices);
        hasFetchedRef.current = true;
      } else {
        showErrorRef.current('خطأ في جلب البيانات', `فشل في جلب الفئات: ${response.status}`);
      }
    } catch (error) {
      showErrorRef.current('خطأ في الاتصال', 'فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, []); // Stable dependencies

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle variant change
  const handleVariantChange = useCallback(
    (variantId: string) => {
      if (!selectedService) return;
      const variant = selectedService.variants.find(v => v.id === variantId);
      setSelectedVariant(variant || null);

      if (variant) {
        const estimatedDate = calculateEstimatedDeliveryDate(new Date(), variant.etaDays);
        setFormData(prev => ({
          ...prev,
          deliveryDate: formatWorkDate(estimatedDate),
        }));
      }
    },
    [selectedService]
  );

  // Handle fine toggle
  const handleFineToggle = useCallback(
    (fineId: string) => {
      setSelectedFines(prev => {
        let newSelectedFines;
        if (prev.includes(fineId)) {
          newSelectedFines = prev.filter(id => id !== fineId);
          // Clear manual price if exists when deselecting
          setManualServices(mPrev => {
            const mNew = { ...mPrev };
            delete mNew[fineId];
            return mNew;
          });
        } else {
          newSelectedFines = [...prev, fineId];
        }
        // Auto-select مصاريف غرامة
        const hasActualFines = newSelectedFines.some(id => {
          const fine = finesList.find(f => f.id === id);
          return fine?.category === 'غرامات' && id !== 'fine_004';
        });
        if (hasActualFines && !newSelectedFines.includes('service_001')) {
          newSelectedFines = [...newSelectedFines, 'service_001'];
        } else if (!hasActualFines && newSelectedFines.includes('service_001')) {
          newSelectedFines = newSelectedFines.filter(id => id !== 'service_001');
        }
        return newSelectedFines;
      });
    },
    [finesList]
  );

  // Handle manual service change
  const handleManualServiceChange = useCallback((serviceId: string, amount: number) => {
    setManualServices(prev => ({ ...prev, [serviceId]: amount }));
  }, []);

  const removeManualService = useCallback((serviceId: string) => {
    setManualServices(prev => {
      const newState = { ...prev };
      delete newState[serviceId];
      return newState;
    });
  }, []);

  // Handle National ID change
  const handleNationalIdChange = useCallback((idNumber: string) => {
    setFormData(prev => ({ ...prev, idNumber }));
    if (idNumber.length === 14) {
      const parsedData = parseNationalId(idNumber);
      if (parsedData.isValid) {
        const age = parsedData.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(parsedData.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : '';

        let formattedBirthDate = '';
        if (parsedData.birthDate) {
          const date = new Date(parsedData.birthDate);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          formattedBirthDate = `${day}/${month}/${year}`;
        }

        setFormData(prev => ({
          ...prev,
          birthDate: formattedBirthDate || prev.birthDate,
          governorate: parsedData.governorate || prev.governorate,
          gender: parsedData.gender || prev.gender,
          age: age.toString(),
        }));
      }
    }
  }, []);

  // Search dependent
  const searchDependent = useCallback(async (name: string) => {
    if (!name || name.length < 1) {
      setDependentSearchResults([]);
      setSuggestedDependent(null);
      setShowDependentDropdown(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchingDependent(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: name });
        const response = await fetch(`/api/admin/dependents/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.dependents) && data.dependents.length > 0) {
            setDependentSearchResults(data.dependents);
            setSuggestedDependent(data.dependents[0]);
            setShowDependentDropdown(data.dependents.length > 1);

            // Compute Ghost Text for Dependent
            const bestMatch = data.dependents[0].name;
            if (bestMatch.toLowerCase().startsWith(name.toLowerCase())) {
              setDependentSuggestion(bestMatch);
            } else {
              setDependentSuggestion('');
            }
          } else {
            setDependentSearchResults([]);
            setSuggestedDependent(null);
            setShowDependentDropdown(false);
            setDependentSuggestion('');
          }
        }
      } catch {
        setDependentSearchResults([]);
        setSuggestedDependent(null);
        setShowDependentDropdown(false);
        setDependentSuggestion('');
      } finally {
        setSearchingDependent(false);
      }
    }, 300);
  }, []);

  // Select dependent
  const selectDependent = useCallback((dependent: { id: string; name: string }) => {
    setFormData(prev => ({ ...prev, customerFollowUp: dependent.name }));
    setSuggestedDependent(dependent);
    setShowDependentDropdown(false);
  }, []);

  // Save new dependent
  const saveNewDependent = useCallback(async (name: string) => {
    if (!name.trim()) return;
    try {
      const response = await fetch('/api/admin/dependents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestedDependent(data.dependent);
        setShowDependentDropdown(false);
      }
    } catch {}
  }, []);

  // Handle save attachment
  const handleSaveAttachment = useCallback(
    async (name: string, file: File | null) => {
      if (!name.trim()) {
        showError('خطأ في الإدخال', 'يرجى إدخال اسم المرفق');
        return;
      }

      try {
        if (file) {
          const formDataUpload = new FormData();
          formDataUpload.append('files', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          });
          if (response.ok) {
            const data = await response.json();
            if (data.files && data.files.length > 0) {
              const uploadedFile = data.files[0];
              setFormData(prev => ({
                ...prev,
                attachedDocuments: [...(prev.attachedDocuments || []), name.trim()],
                uploadedDocuments: [
                  ...(prev.uploadedDocuments || []),
                  {
                    originalName: uploadedFile.originalName,
                    filename: uploadedFile.filename,
                    filePath: uploadedFile.filename, // Store Key (not signed URL) for DB
                    fileSize: uploadedFile.fileSize,
                    fileType: uploadedFile.fileType,
                  },
                ],
              }));
              setUploadedFiles(prev => [...prev, file]);
              showSuccess('تم رفع المرفق بنجاح! 📁', `تم رفع "${name.trim()}" مع الملف`);
            } else {
              showError('فشل في رفع الملف', 'لم يتم استرجاع معلومات الملف');
            }
          } else {
            const error = await response.json();
            showError('فشل في رفع الملف', error.error || 'حدث خطأ أثناء رفع الملف');
            return;
          }
        } else {
          setFormData(prev => ({
            ...prev,
            attachedDocuments: [...(prev.attachedDocuments || []), name.trim()],
          }));
          showSuccess('تم إضافة المرفق بنجاح! 📄', `تم إضافة "${name.trim()}" إلى قائمة المرفقات`);
        }
      } catch {}
    },
    [showSuccess, showError]
  );

  // Handle remove attachment
  const handleRemoveAttachment = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attachedDocuments: (prev.attachedDocuments || []).filter((_, i) => i !== index),
      uploadedDocuments: (prev.uploadedDocuments || []).filter((_, i) => i !== index),
    }));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle update customer name
  const handleUpdateCustomerName = useCallback(async () => {
    if (!customer || !formData.customerName.trim()) {
      showWarning('اسم العميل مطلوب', 'يرجى إدخال اسم العميل أولاً');
      return;
    }
    try {
      const response = await fetch('/api/admin/users/update-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: customer.id, newName: formData.customerName.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.user);
        showSuccess('تم تحديث اسم العميل بنجاح! ✅', 'تم حفظ اسم العميل في النظام');
      } else {
        const error = await response.json();
        showError('فشل في تحديث اسم العميل', error.error || 'حدث خطأ أثناء تحديث اسم العميل');
      }
    } catch {}
  }, [customer, formData.customerName, showSuccess, showError, showWarning]);

  // Get current work date
  const getCurrentWorkDate = useCallback(() => {
    if (session?.user) {
      const user = session.user as any;
      if (hasPermission(user, 'CREATE_ORDER')) {
        const sessionWorkDate = user.workDate;
        const localWorkDate =
          typeof window !== 'undefined' ? localStorage.getItem('adminWorkDate') : null;
        return sessionWorkDate || localWorkDate;
      }
    }
    return null;
  }, [session]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setSelectedService(null);
    setSelectedVariant(null);
    setCustomer(null);
    setSuggestedUser(null);
    setSuggestedDependent(null);
    setDependentSearchResults([]);
    setSearchResults([]);
    setSelectedFines([]);
    setManualServices({});
    setUploadedFiles([]);
    // But since we are setting individual fields below, let's keep it consistent
    // Actually, setFormData(initialFormData) is called at the top of handleReset
    // setFormData(initialFormData); // Line 700 already does this.

    // Just ensuring we don't have stale state if we rely on uploadedFiles state (which is separate from formData, strangely)
    // uploadedFiles state seems to be for visual "File" objects, while formData has string names.
    // formData.uploadedDocuments will be cleared by setFormData(initialFormData).
    setUploadedFiles([]);
    setAttachmentName('');
    setAttachmentFile(null);
    setFormSerialNumber('');
    setSerialValid(null);
    setServiceSearchTerm('');
    setFinesSearchTerm('');
    setServicesSearchTerm('');
    setSuggestion('');
    setDependentSuggestion('');
    setShowSuccessModal(false);
    setCreatedOrderId(null);
    submissionLockRef.current = false;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submissionLockRef.current) return;

      if (!selectedService || !selectedVariant) {
        showWarning('الخدمة مطلوبة', 'يرجى اختيار الخدمة ونوعها أولاً');
        return;
      }
      // 1. GLOBAL VALIDATION
      if (!formData.customerName.trim()) {
        showWarning('اسم العميل مطلوب', 'يرجى إدخال اسم العميل');
        return;
      }
      if (!formData.customerPhone.trim()) {
        showWarning('رقم الهاتف مطلوب', 'يرجى إدخال رقم الهاتف');
        return;
      }

      if (formData.customerPhone.length !== 11) {
        showWarning('رقم الهاتف غير صحيح', 'يجب أن يتكون رقم الهاتف من 11 رقم');
        return;
      }

      if (formData.idNumber && formData.idNumber.length !== 14) {
        showWarning('الرقم القومي غير صحيح', 'يجب أن يتكون الرقم القومي من 14 رقم');
        return;
      }

      // ⚠️ Note: Phone conflict (existing account) is now handled gracefully in the API
      // by linking the order to the existing account without overwriting the User name.
      // So we no longer block submission here.

      const hasIdNumber = formData.idNumber && formData.idNumber.length === 14;
      const hasBirthDate = formData.birthDate && formData.birthDate.trim().length > 0;

      // Allow skipping ID/BirthDate for specific certificates (Death, Marriage, Divorce)
      const serviceName = selectedService.name;
      const isFlexibleCertificate =
        serviceName.includes('وفاة') ||
        serviceName.includes('زواج') ||
        serviceName.includes('طلاق');

      if (!isFlexibleCertificate && !hasIdNumber && !hasBirthDate) {
        showWarning('بيانات ناقصة', 'يرجى إدخال الرقم القومي (14 رقم) أو تاريخ الميلاد على الأقل');
        return;
      }

      // Mandatory Form Serial for ID Cards (بطاقة)
      if (serviceName.includes('بطاقة')) {
        if (!formSerialNumber.trim()) {
          showWarning('رقم الاستمارة مطلوب', 'يرجى إدخال رقم الاستمارة لطلبات البطاقة');
          return;
        }
        if (serialValid && !serialValid.ok) {
          showWarning(
            'رقم الاستمارة غير صحيح',
            serialValid.msg || 'يرجى التأكد من صحة رقم الاستمارة وملاءمته لهذا النوع'
          );
          return;
        }
      }

      if (serviceName.includes('ميلاد')) {
        // تاريخ الميلاد مطلوب لاستخراج شهادة الميلاد
        if (!formData.birthDate?.trim()) {
          showWarning('نقص في البيانات', 'تاريخ الميلاد مطلوب لاستخراج شهادة الميلاد');
          return;
        }
        // اسم الأم مطلوب فقط إذا لم يكن هناك رقم قومي
        if (!hasIdNumber && !formData.motherName?.trim()) {
          showWarning(
            'نقص في البيانات',
            'اسم الأم مطلوب لاستخراج شهادة الميلاد (أو أدخل الرقم القومي)'
          );
          return;
        }
      }

      // Mandatory "Relation" (الصفة) for specific services
      const isRelationMandatory =
        serviceName.includes('كمبيوتر') ||
        serviceName.includes('مميكن') ||
        serviceName.includes('تصديق') ||
        serviceName.includes('بيان زواج و طلاق');

      if (isRelationMandatory && !formData.title?.trim()) {
        showWarning('بيانات ناقصة', 'يرجى إدخال الصفة لهذه الخدمة');
        return;
      }

      if (serviceName.includes('وفاة')) {
        if (!formData.deathDate?.trim()) {
          showWarning('نقص في البيانات', 'تاريخ الوفاة مطلوب لاستخراج شهادة الوفاة');
          return;
        }
        if (!formData.deceasedName?.trim()) {
          showWarning('نقص في البيانات', 'اسم المتوفي مطلوب لاستخراج شهادة الوفاة');
          return;
        }
      }

      if (serviceName.includes('زواج') || serviceName.includes('طلاق')) {
        if (!formData.wifeName?.trim()) {
          showWarning('نقص في البيانات', 'اسم الزوج/الزوجة مطلوب');
          return;
        }
      }

      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.customerPhone)) {
        showWarning('رقم الهاتف غير صحيح', 'يرجى إدخال رقم هاتف صحيح');
        return;
      }
      if (formData.customerEmail && formData.customerEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.customerEmail)) {
          showWarning('البريد الإلكتروني غير صحيح', 'يرجى إدخال بريد إلكتروني صحيح');
          return;
        }
      }

      submissionLockRef.current = true;
      const submissionId = offlineManager.generateOfflineId();
      let orderCreated = false;
      setSubmitting(true);
      try {
        const orderData = {
          offlineId: submissionId,
          userId: customer?.id,
          serviceId: selectedService?.id,
          variantId: selectedVariant?.id,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          additionalPhone: formData.additionalPhone,
          customerEmail: formData.customerEmail,
          address: formData.address,
          governorate: formData.governorate,
          city: formData.city,
          district: formData.district,
          street: formData.street,
          buildingNumber: formData.buildingNumber,
          apartmentNumber: formData.apartmentNumber,
          landmark: formData.landmark,
          notes: formData.notes,
          adminNotes: formData.adminNotes,
          deliveryType: formData.deliveryType,
          deliveryFee: formData.deliveryFee,
          discount: parseFloat(formData.discount) || 0,
          totalCents: calculateTotal(),
          birthDate: formData.birthDate,
          fatherName: formData.fatherName,
          idNumber: formData.idNumber,
          motherName: formData.motherName,

          gender: formData.gender,
          wifeName: formData.wifeName,
          paymentMethod: formData.paymentMethod,
          paidAmount: (parseFloat(formData.paidAmount) || 0) * 100,
          remainingAmount: formData.remainingAmount * 100,
          photographyLocation: formData.photographyLocation,
          photographyDate: formData.photographyDate,
          title: formData.title,
          quantity: formData.quantity,
          marriageDate: formData.marriageDate,
          divorceDate: formData.divorceDate,
          deathDate: formData.deathDate,
          deceasedName: formData.deceasedName,
          customerFollowUp: formData.customerFollowUp,
          wifeMotherName: formData.wifeMotherName,
          serviceDetails: formData.translationLanguage
            ? `${formData.serviceDetails || ''}\n\nلغة الترجمة: ${formData.translationLanguage}`.trim()
            : formData.serviceDetails,
          otherFees: formData.otherFees,
          attachedDocuments: formData.attachedDocuments,
          uploadedDocuments: formData.uploadedDocuments, // Pass detailed file info
          hasAttachments: formData.hasAttachments,
          originalDocuments: formData.originalDocuments,
          policeStation: formData.policeStation,
          pickupLocation: formData.pickupLocation,
          selectedFines: selectedFines,
          finesDetails: selectedFines
            .filter(id => {
              const fine = finesList.find(f => f.id === id);
              return fine?.category === 'غرامات';
            })
            .map(fineId => {
              const fine = finesList.find(f => f.id === fineId);
              return { id: fineId, name: fine?.name || '', amount: fine?.amountCents || 0 };
            }),
          servicesDetails: selectedFines
            .filter(id => {
              const fine = finesList.find(f => f.id === id);
              return fine?.category === 'خدمات اضافية';
            })
            .map(serviceId => {
              const service = finesList.find(f => f.id === serviceId);
              const manualAmount = manualServices[serviceId] || 0;
              return {
                id: serviceId,
                name: service?.name || '',
                amount:
                  serviceId === 'service_001'
                    ? calculateActualFineAmounts(selectedFines)
                    : manualAmount * 100,
              };
            }),
          formSerialNumber,
          formSerialProvider,
          workDate: getCurrentWorkDate(),
        };

        let response;
        try {
          response = await fetch('/api/admin/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });
        } catch (fetchErr) {
          // Network error - go to offline mode
          await offlineManager.saveOfflineOrder({
            ...orderData,
            createdAt: new Date().toISOString(),
          });

          orderCreated = true;

          // Index customer for immediate offline search
          await offlineManager.upsertCustomer({
            id: customer?.id,
            name: orderData.customerName,
            phone: orderData.customerPhone,
            email: orderData.customerEmail,
            idNumber: orderData.idNumber,
            gender: orderData.gender,
            birthDate: orderData.birthDate,
            fatherName: orderData.fatherName,
            motherName: orderData.motherName,
            wifeName: orderData.wifeName,
          });

          setCreatedOrderId(submissionId);
          setShowSuccessModal(true);
          showWarning(
            'تم الحفظ محلياً',
            'تعذر الاتصال بالخادم، تم حفظ الطلب في ذاكرة المتصفح وسيتم رفعه تلقائياً عند عودة النت.'
          );
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const orderId = data.order.id;
          orderCreated = true;
          setCreatedOrderId(orderId);
          setShowSuccessModal(true);

          // Index customer for immediate search if they just got created/updated
          if (data.order.user) {
            await offlineManager.upsertCustomer({
              ...data.order.user,
              id: data.order.user.id || data.order.userId, // Ensure ID is present
            });
          }

          // Optionally trigger a sync for any other pending orders
          offlineManager.syncOrders().catch(() => {});
        } else {
          const errorData = await response.json();
          showError(
            'فشل في إنشاء الطلب',
            errorData.error || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى'
          );
        }
      } catch {
      } finally {
        if (!orderCreated) submissionLockRef.current = false;
        setSubmitting(false);
      }
    },
    [
      selectedService,
      selectedVariant,
      formData,
      customer,
      selectedFines,
      manualServices,
      formSerialNumber,
      calculateTotal,
      getCurrentWorkDate,
      serialValid,
      finesList,
      showWarning,
      showError,
      formSerialProvider,
    ]
  );

  return {
    // Session
    session,
    router,

    // Toast
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,

    // Services
    services,
    filteredServices,
    selectedService,
    setSelectedService,
    selectedVariant,
    setSelectedVariant,
    serviceSearchTerm,
    showServiceDropdown,
    setServiceSearchTerm,
    setShowServiceDropdown,
    selectService,
    handleVariantChange,

    // Customer
    customer,
    suggestedUser,
    searchResults,
    showSearchDropdown,
    searching,
    setShowSearchDropdown,
    searchCustomer,
    selectCustomer,

    // Dependent
    suggestedDependent,
    dependentSearchResults,
    showDependentDropdown,
    searchingDependent,
    setShowDependentDropdown,
    searchDependent,
    selectDependent,
    saveNewDependent,
    suggestion,

    // Loading
    loading,
    submitting,

    // Modals
    showAttachmentModal,
    setShowAttachmentModal,
    showAddressModal,
    setShowAddressModal,

    // Attachments
    uploadedFiles,
    attachmentName,
    attachmentFile,
    setAttachmentName,
    setAttachmentFile,
    handleSaveAttachment,
    handleRemoveAttachment,

    // Serial
    formSerialNumber,
    setFormSerialNumber,
    formSerialProvider,
    setFormSerialProvider,
    serialValid,
    validateSerialLive,

    // Fines
    finesList,
    selectedFines,
    setSelectedFines,
    showServicesDropdown,
    showFinesDropdown,
    finesSearchTerm,
    servicesSearchTerm,
    manualServices,
    setShowServicesDropdown,
    setShowFinesDropdown,
    setFinesSearchTerm,
    setServicesSearchTerm,
    handleFineToggle,
    handleManualServiceChange,
    removeManualService,

    // Form
    formData,
    setFormData,
    handleNationalIdChange,
    handleUpdateCustomerName,
    requiredDocuments,
    calculateTotal,
    dependentSuggestion, // Exported for UI
    phoneConflict,
    dismissPhoneConflict,
    handleSubmit,
    handleReset,
    showSuccessModal,
    setShowSuccessModal,
    createdOrderId,
    clearCustomer: () => {
      setCustomer(null);
      setSuggestion('');
      setSuggestedUser(null);
      setFormData(prev => ({
        ...prev,
        additionalPhone: '',
        customerEmail: '',
        address: '',
        governorate: '',
        city: '',
        district: '',
        street: '',
        buildingNumber: '',
        apartmentNumber: '',
        landmark: '',
        birthDate: '',
        idNumber: '',
        fatherName: '',
        motherName: '',
        gender: '',
        wifeName: '',
        age: '',
      }));
    },
  };
}
