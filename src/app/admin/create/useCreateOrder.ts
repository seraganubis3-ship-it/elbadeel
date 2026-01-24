'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { parseNationalId } from '@/lib/nationalIdParser';
import {
  PREDEFINED_FINES,
  calculateActualFineAmounts,
  calculateFineExpenses,
  calculateLostReportForServices,
} from '@/constants/fines';
import { useToast } from '@/components/Toast';
import {
  Service,
  ServiceVariant,
  Category,
  Customer,
  FormData as OrderFormData,
  initialFormData,
} from './types';

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
  const [suggestion, setSuggestion] = useState(''); // 👻 Ghost Text Suggestion

  // Service search
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Attachments
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Serial number
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [serialValid, setSerialValid] = useState<null | { ok: boolean; msg: string }>(null);
  const serialValidateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fines
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showFinesDropdown, setShowFinesDropdown] = useState(false);
  const [finesSearchTerm, setFinesSearchTerm] = useState('');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');
  const [manualServices, setManualServices] = useState<{ [key: string]: number }>({});

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const hasFetchedRef = useRef(false);

  // Form data
  const [formData, setFormData] = useState(initialFormData);

  // Computed required documents from selected service
  const requiredDocuments = useMemo(() => {
    if (!selectedService?.documents) return [];
    return selectedService.documents.filter(doc => doc.required).map(doc => doc.title);
  }, [selectedService]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm.trim()) return services;
    const searchLower = serviceSearchTerm.toLowerCase();
    return services.filter(
      service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.slug.toLowerCase().includes(searchLower)
    );
  }, [services, serviceSearchTerm]);

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
          const params = new URLSearchParams({ variantId: selectedVariant!.id, serial: value });
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
    [selectedVariant?.id]
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

    const fetchServicesAndCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.categories) {
            setCategories(data.categories);
            // Flatten all services from all categories
            const allServices = data.categories.flatMap((cat: Category) => cat.services || []);
            setServices(allServices);
            console.log('✅ Loaded services:', allServices.length);
          }
        } else {
          showErrorRef.current?.('خطأ في الاتصال', 'فشل في تحميل الخدمات');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        showErrorRef.current?.('خطأ في الاتصال', 'فشل في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchServicesAndCategories();
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
      if (abortController) abortController.abort();
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (name.length >= 1) {
        const timeout = setTimeout(async () => {
          const controller = new AbortController();
          setAbortController(controller);
          setSearching(true);
          try {
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

                // Calculate Ghost Text Suggestion
                const bestMatch = data.users[0].name;
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
            }
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              // Handle search error silently
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
      fatherName: (cust as any).fatherName || '',
      idNumber: (cust as any).idNumber || '',
      motherName: (cust as any).motherName || '',
      nationality: (cust as any).nationality || '',
      wifeName: (cust as any).wifeName || '',
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
    setSearchResults([]);
    setSuggestion('');
  }, []);

  // Handle key down for suggestion
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && suggestion) {
        const topMatch = searchResults[0];
        if (topMatch) {
          e.preventDefault();
          selectCustomer(topMatch);
        }
      }
    },
    [suggestion, searchResults, selectCustomer]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle variant change
  const handleVariantChange = useCallback(
    (variantId: string) => {
      if (!selectedService) return;
      const variant = selectedService.variants.find(v => v.id === variantId);
      setSelectedVariant(variant || null);
    },
    [selectedService]
  );

  // Handle fine toggle
  const handleFineToggle = useCallback((fineId: string) => {
    setSelectedFines(prev => {
      let newSelectedFines;
      if (prev.includes(fineId)) {
        newSelectedFines = prev.filter(id => id !== fineId);
      } else {
        newSelectedFines = [...prev, fineId];
      }
      // Auto-select مصاريف غرامة
      const hasActualFines = newSelectedFines.some(id => {
        const fine = PREDEFINED_FINES.find(f => f.id === id);
        return fine?.category === 'غرامات' && id !== 'fine_004';
      });
      if (hasActualFines && !newSelectedFines.includes('service_001')) {
        newSelectedFines = [...newSelectedFines, 'service_001'];
      } else if (!hasActualFines && newSelectedFines.includes('service_001')) {
        newSelectedFines = newSelectedFines.filter(id => id !== 'service_001');
      }
      return newSelectedFines;
    });
  }, []);

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
          } else {
            setDependentSearchResults([]);
            setSuggestedDependent(null);
            setShowDependentDropdown(false);
          }
        }
      } catch {
        setDependentSearchResults([]);
        setSuggestedDependent(null);
        setShowDependentDropdown(false);
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
  const handleSaveAttachment = useCallback(async () => {
    if (!attachmentName.trim()) {
      showError('خطأ في الإدخال', 'يرجى إدخال اسم المرفق');
      return;
    }

    try {
      if (attachmentFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('files', attachmentFile);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            attachedDocuments: [...(prev.attachedDocuments || []), attachmentName.trim()],
          }));
          setUploadedFiles(prev => [...prev, attachmentFile]);
          showSuccess('تم رفع المرفق بنجاح! 📁', `تم رفع "${attachmentName.trim()}" مع الملف`);
        } else {
          const error = await response.json();
          showError('فشل في رفع الملف', error.error || 'حدث خطأ أثناء رفع الملف');
          return;
        }
      } else {
        setFormData(prev => ({
          ...prev,
          attachedDocuments: [...(prev.attachedDocuments || []), attachmentName.trim()],
        }));
        showSuccess(
          'تم إضافة المرفق بنجاح! 📄',
          `تم إضافة "${attachmentName.trim()}" إلى قائمة المرفقات`
        );
      }
      setAttachmentName('');
      setAttachmentFile(null);
      setShowAttachmentModal(false);
    } catch {}
  }, [attachmentName, attachmentFile, showSuccess, showError]);

  // Handle remove attachment
  const handleRemoveAttachment = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      attachedDocuments: (prev.attachedDocuments || []).filter((_, i) => i !== index),
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
      if (user.role === 'ADMIN') {
        const sessionWorkDate = user.workDate;
        const localWorkDate =
          typeof window !== 'undefined' ? localStorage.getItem('adminWorkDate') : null;
        return sessionWorkDate || localWorkDate;
      }
    }
    return null;
  }, [session]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedService || !selectedVariant) {
        showWarning('الخدمة مطلوبة', 'يرجى اختيار الخدمة ونوعها أولاً');
        return;
      }
      if (!formData.customerName.trim()) {
        showWarning('اسم العميل مطلوب', 'يرجى إدخال اسم العميل');
        return;
      }
      if (!formData.customerPhone.trim()) {
        showWarning('رقم الهاتف مطلوب', 'يرجى إدخال رقم الهاتف');
        return;
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

      setSubmitting(true);
      try {
        const orderData = {
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
          nationality: formData.nationality,
          wifeName: formData.wifeName,
          paymentMethod: formData.paymentMethod,
          paidAmount: (parseFloat(formData.paidAmount) || 0) * 100,
          remainingAmount: formData.remainingAmount * 100,
          photographyLocation: formData.photographyLocation,
          photographyDate: formData.photographyDate,
          quantity: formData.quantity,
          marriageDate: formData.marriageDate,
          divorceDate: formData.divorceDate,
          wifeMotherName: formData.wifeMotherName,
          serviceDetails: formData.serviceDetails,
          otherFees: formData.otherFees,
          attachedDocuments: formData.attachedDocuments,
          hasAttachments: formData.hasAttachments,
          originalDocuments: formData.originalDocuments,
          policeStation: formData.policeStation,
          pickupLocation: formData.pickupLocation,
          selectedFines: selectedFines,
          finesDetails: selectedFines
            .filter(id => {
              const fine = PREDEFINED_FINES.find(f => f.id === id);
              return fine?.category === 'غرامات';
            })
            .map(fineId => {
              const fine = PREDEFINED_FINES.find(f => f.id === fineId);
              return { id: fineId, name: fine?.name || '', amount: fine?.amountCents || 0 };
            }),
          servicesDetails: selectedFines
            .filter(id => {
              const fine = PREDEFINED_FINES.find(f => f.id === id);
              return fine?.category === 'خدمات اضافية';
            })
            .map(serviceId => {
              const service = PREDEFINED_FINES.find(f => f.id === serviceId);
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
          workDate: getCurrentWorkDate(),
        };

        const response = await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const data = await response.json();
          const orderId = data.order.id;
          showSuccess('تم إنشاء الطلب بنجاح! 🎉', `تم إنشاء الطلب #${orderId} بنجاح`);
          setTimeout(() => {
            const shouldPrint = window.confirm('هل تريد طباعة إيصال؟');
            if (shouldPrint) {
              router.push(`/admin/orders/${orderId}/receipt`);
            } else {
              router.push(`/admin/orders/${orderId}`);
            }
          }, 1500);
        } else {
          const errorData = await response.json();
          showError(
            'فشل في إنشاء الطلب',
            errorData.error || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى'
          );
        }
      } catch {
      } finally {
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
      showWarning,
      showError,
      showSuccess,
      router,
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
    handleKeyDown,

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
    serialValid,
    validateSerialLive,

    // Fines
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
    handleSubmit,
  };
}
