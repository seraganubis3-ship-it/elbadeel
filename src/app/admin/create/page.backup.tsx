'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { parseNationalId } from '@/lib/nationalIdParser';
import {
  PREDEFINED_FINES,
  shouldAddMandatoryFee,
  calculateMandatoryFeeAmount,
  calculateFineExpenses,
  calculateLostReportForServices,
  calculateActualFineAmounts,
} from '@/constants/fines';
import { useToast, ToastContainer } from '@/components/Toast';
interface Service {
  id: string;
  name: string;
  slug: string;
  variants: ServiceVariant[];
}
interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}
interface Category {
  id: string;
  name: string;
  services: Service[];
}
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  additionalPhone?: string;
  address?: string;
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  birthDate?: string;
  fatherName?: string;
  idNumber?: string;
  motherName?: string;
  nationality?: string;
  wifeName?: string;
}
export default function CreateOrderPage() {
  const { data: session } = useSession();
  const [, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ServiceVariant | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
  // const [, _setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [searching, setSearching] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [suggestedUser, setSuggestedUser] = useState<Customer | null>(null);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  // Dependent search states
  const [suggestedDependent, setSuggestedDependent] = useState<{ id: string; name: string } | null>(
    null
  );
  const [dependentSearchResults, setDependentSearchResults] = useState<
    { id: string; name: string }[]
  >([]);
  const [showDependentDropdown, setShowDependentDropdown] = useState(false);
  const [searchingDependent, setSearchingDependent] = useState(false);
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [serialValid, setSerialValid] = useState<null | { ok: boolean; msg: string }>(null);
  const serialValidateTimeout = useRef<NodeJS.Timeout | null>(null);
  // Service search states
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  // Fines states
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showFinesDropdown, setShowFinesDropdown] = useState(false);
  const [finesSearchTerm, setFinesSearchTerm] = useState('');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');
  // Manual services states
  const [manualServices, setManualServices] = useState<{ [key: string]: number }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // Form data
  const [formData, setFormData] = useState({
    // Customer Basic Info
    customerPhone: '',
    additionalPhone: '',
    customerIdNumber: '',
    customerName: '',
    customerEmail: '',
    address: '',
    governorate: '',
    city: '',
    district: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    landmark: '',
    landlinePhone: '',
    // Personal Details
    birthDate: '',
    fatherName: '',
    idNumber: '',
    motherName: '',
    nationality: '',
    wifeName: '',
    wifeMotherName: '',
    marriageDate: '',
    divorceDate: '',
    deathDate: '',
    // Customer Type & Follow-up
    customerFollowUp: '',
    profession: '',
    gender: '',
    // Service Details
    serviceName: '',
    serviceSource: '',
    cardType: '',
    serviceReceipt: 'AFTER',
    age: '',
    deliveryDate: '',
    quantity: 1,
    otherFees: 0,
    discount: '',
    value: 0,
    total: 0,
    paidAmount: '',
    remainingAmount: 0,
    serviceDetails: '',
    photographyLocation: '',
    photographyDate: '',
    underImplementationReason: '',
    // Location Info
    policeStation: '',
    pickupLocation: '',
    // Documents
    originalDocuments: '',
    hasAttachments: false,
    attachedDocuments: [] as string[],
    // Payment
    paymentMethod: 'CASH',
    // Notes
    notes: '',
    adminNotes: '',
    // Delivery
    deliveryType: 'OFFICE',
    deliveryFee: 0,
  });
  useEffect(() => {
    // Reset when variant changes
    setSerialValid(null);
    setFormSerialNumber('');
  }, [selectedVariant?.id]);
  const validateSerialLive = (value: string) => {
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
  };
  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);
  // Handle escape key to close address modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddressModal) {
        setShowAddressModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddressModal]);
  // Enhanced search function with faster debouncing and multiple results
  const searchCustomer = useCallback(
    (name: string) => {
      // Cancel previous request
      if (abortController) {
        abortController.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (name.length >= 1) {
        // Start searching from first character
        const timeout = setTimeout(async () => {
          // Create new abort controller
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
              // Handle multiple results
              if (Array.isArray(data.users) && data.users.length > 0) {
                setSearchResults(data.users);
                setSuggestedUser(data.users[0]); // First result as preview
                setShowSearchDropdown(data.users.length > 1);
              } else if (data.user) {
                setSearchResults([data.user]);
                setSuggestedUser(data.user);
                setShowSearchDropdown(false);
              } else {
                setSearchResults([]);
                setSuggestedUser(null);
                setShowSearchDropdown(false);
              }
              if (!data.user && (!data.users || data.users.length === 0)) {
                setCustomer(null);
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
        }, 50); // Very fast debounce time - almost instant
        searchTimeoutRef.current = timeout;
      } else {
        setSuggestedUser(null);
        setSearchResults([]);
        setShowSearchDropdown(false);
        setCustomer(null);
        setSearching(false);
      }
    },
    [abortController]
  );
  // Function to select a customer from dropdown
  const selectCustomer = useCallback((customer: Customer) => {
    setCustomer(customer);

    // Convert birth date to DD/MM/YYYY format
    let formattedBirthDate = '';
    if (customer.birthDate) {
      const date = new Date(customer.birthDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedBirthDate = `${day}/${month}/${year}`;
    }

    setFormData(prev => ({
      ...prev,
      customerName: customer.name || '',
      customerPhone: customer.phone || '',
      additionalPhone: customer.additionalPhone || '',
      customerEmail: customer.email || '',
      address: customer.address || '',
      governorate: customer.governorate || '',
      city: customer.city || '',
      district: customer.district || '',
      street: customer.street || '',
      buildingNumber: customer.buildingNumber || '',
      apartmentNumber: customer.apartmentNumber || '',
      landmark: customer.landmark || '',
      birthDate: formattedBirthDate,
      fatherName: (customer as any).fatherName || '',
      idNumber: (customer as any).idNumber || '',
      motherName: (customer as any).motherName || '',
      nationality: (customer as any).nationality || '',
      wifeName: (customer as any).wifeName || '',
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
  }, []);
  // Handle service selection
  const selectService = useCallback((service: Service) => {
    setSelectedService(service);
    setServiceSearchTerm(service.name);
    setShowServiceDropdown(false);
    setSelectedVariant(null); // Reset variant when service changes
  }, []);
  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm.trim()) return services;
    return services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [services, serviceSearchTerm]);
  const calculateTotal = useCallback(() => {
    if (!selectedVariant) return 0;
    let total = selectedVariant.priceCents * formData.quantity;
    // Add photography fee
    if (formData.photographyLocation === 'dandy_mall') {
      total += 200 * 100; // 200 جنيه
    } else if (formData.photographyLocation === 'civil_registry_haram') {
      total += 50 * 100; // 50 جنيه
    } else if (formData.photographyLocation === 'home_photography') {
      total += 200 * 100; // 200 جنيه
    }
    // Add delivery fee
    if (formData.deliveryType === 'ADDRESS') {
      total += formData.deliveryFee * 100; // Convert to cents
    }
    // Add actual fine amounts (50 جنيه per fine except محضر فقد) - تحسب مرة واحدة فقط
    const actualFineAmounts = calculateActualFineAmounts(selectedFines);
    total += actualFineAmounts;
    // Add hidden fine expenses (10 جنيه per fine except محضر فقد) - مخفي من العرض
    const fineExpensesAmount = calculateFineExpenses(selectedFines);
    total += fineExpensesAmount;
    // Add lost report amount to services
    const lostReportForServices = calculateLostReportForServices(selectedFines);
    total += lostReportForServices;
    // Add manual services
    const manualServicesTotal = Object.values(manualServices).reduce(
      (sum, amount) => sum + amount * 100,
      0
    );
    total += manualServicesTotal;
    // Add other fees
    total += formData.otherFees * 100; // Convert to cents
    // Apply discount
    const discountAmount = parseFloat(formData.discount) || 0;
    total -= discountAmount * 100; // Convert to cents
    return Math.max(0, total); // Ensure total is not negative
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
  // Calculate remaining amount when paid amount or total changes
  useEffect(() => {
    const total = calculateTotal();
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const remaining = Math.max(0, total - paidAmount * 100); // Convert to cents
    setFormData(prev => ({ ...prev, remainingAmount: remaining / 100 })); // Convert back to currency
  }, [formData.paidAmount, calculateTotal]);
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside both dropdown containers
      const finesContainer = target.closest('.fines-dropdown-container');
      const servicesContainer = target.closest('.services-dropdown-container');
      // If click is inside any dropdown container, don't close
      if (finesContainer || servicesContainer) {
        return;
      }
      // Only close if click is truly outside
      setShowFinesDropdown(false);
      setShowServicesDropdown(false);
      // Clear search terms when closing
      setFinesSearchTerm('');
      setServicesSearchTerm('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        // Flatten all services
        const allServices: Service[] = [];
        data.categories.forEach((category: Category) => {
          allServices.push(...category.services);
        });
        setServices(allServices);
      } else {
        showError('خطأ في جلب البيانات', `فشل في جلب الفئات: ${response.status}`);
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'فشل في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleVariantChange = (variantId: string) => {
    if (!selectedService) return;
    const variant = selectedService.variants.find(v => v.id === variantId);
    setSelectedVariant(variant || null);
  };
  // Handle fine selection
  const handleFineToggle = (fineId: string) => {
    setSelectedFines(prev => {
      let newSelectedFines;
      if (prev.includes(fineId)) {
        // Remove the fine
        newSelectedFines = prev.filter(id => id !== fineId);
      } else {
        // Add the fine
        newSelectedFines = [...prev, fineId];
      }
      // Auto-select "مصاريف غرامة" if any actual fine is selected (except محضر فقد)
      const hasActualFines = newSelectedFines.some(id => {
        const fine = PREDEFINED_FINES.find(f => f.id === id);
        return fine?.category === 'غرامات' && id !== 'fine_004';
      });
      if (hasActualFines && !newSelectedFines.includes('service_001')) {
        // Add مصاريف غرامة if not already selected
        newSelectedFines = [...newSelectedFines, 'service_001'];
      } else if (!hasActualFines && newSelectedFines.includes('service_001')) {
        // Remove مصاريف غرامة if no actual fines are selected
        newSelectedFines = newSelectedFines.filter(id => id !== 'service_001');
      }
      return newSelectedFines;
    });
  };
  // Handle manual service amount change
  const handleManualServiceChange = (serviceId: string, amount: number) => {
    setManualServices(prev => ({
      ...prev,
      [serviceId]: amount,
    }));
  };
  // Handle National ID change and auto-fill data
  const handleNationalIdChange = (idNumber: string) => {
    setFormData(prev => ({ ...prev, idNumber }));
    // Parse National ID if it's 14 digits
    if (idNumber.length === 14) {
      const parsedData = parseNationalId(idNumber);
      if (parsedData.isValid) {
        // Calculate age from birth date
        const age = parsedData.birthDate
          ? Math.floor(
              (new Date().getTime() - new Date(parsedData.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
          : '';

        // Convert birth date to DD/MM/YYYY format
        let formattedBirthDate = '';
        if (parsedData.birthDate) {
          const date = new Date(parsedData.birthDate);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          formattedBirthDate = `${day}/${month}/${year}`;
        }

        // Auto-fill birth date, governorate, gender, and age
        setFormData(prev => ({
          ...prev,
          birthDate: formattedBirthDate || prev.birthDate,
          governorate: parsedData.governorate || prev.governorate,
          gender: parsedData.gender || prev.gender,
          age: age.toString(),
        }));
      }
    }
  };
  // Dependent search function
  const searchDependent = useCallback(async (name: string) => {
    if (!name || name.length < 1) {
      setDependentSearchResults([]);
      setSuggestedDependent(null);
      setShowDependentDropdown(false);
      return;
    }
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchingDependent(true);
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: name });
        const response = await fetch(`/api/admin/dependents/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.dependents) && data.dependents.length > 0) {
            setDependentSearchResults(data.dependents);
            setSuggestedDependent(data.dependents[0]); // First result as preview
            // Show dropdown if multiple results
            if (data.dependents.length > 1) {
              setShowDependentDropdown(true);
            } else {
              setShowDependentDropdown(false);
            }
          } else {
            setDependentSearchResults([]);
            setSuggestedDependent(null);
            setShowDependentDropdown(false);
          }
        } else {
          setDependentSearchResults([]);
          setSuggestedDependent(null);
          setShowDependentDropdown(false);
        }
      } catch (error) {
        // Handle dependent search error
        setDependentSearchResults([]);
        setSuggestedDependent(null);
        setShowDependentDropdown(false);
      } finally {
        setSearchingDependent(false);
      }
    }, 300); // 300ms delay
  }, []);
  // Function to select a dependent from dropdown
  const selectDependent = useCallback((dependent: { id: string; name: string }) => {
    setFormData(prev => ({ ...prev, customerFollowUp: dependent.name }));
    setSuggestedDependent(dependent);
    setShowDependentDropdown(false);
  }, []);
  // Function to save new dependent
  const saveNewDependent = useCallback(async (name: string) => {
    if (!name.trim()) return;
    try {
      const response = await fetch('/api/admin/dependents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestedDependent(data.dependent);
        setShowDependentDropdown(false);
        // Optionally show success message
      } else {
        // Handle dependent save error
      }
    } catch (error) {
      // Handle dependent save error
    }
  }, []);
  // File upload functions

  const handleSaveAttachment = async () => {
    if (!attachmentName.trim()) {
      showError('خطأ في الإدخال', 'يرجى إدخال اسم المرفق');
      return;
    }

    try {
      if (attachmentFile) {
        // رفع ملف مع اسم
        const formData = new FormData();
        formData.append('files', attachmentFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          await response.json();

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
        // إضافة اسم فقط
        setFormData(prev => ({
          ...prev,
          attachedDocuments: [...(prev.attachedDocuments || []), attachmentName.trim()],
        }));

        showSuccess(
          'تم إضافة المرفق بنجاح! 📄',
          `تم إضافة "${attachmentName.trim()}" إلى قائمة المرفقات`
        );
      }

      // إعادة تعيين الـ modal
      setAttachmentName('');
      setAttachmentFile(null);
      setShowAttachmentModal(false);
    } catch (error) {
      // Handle attachment save error
      // showError("خطأ في الاتصال", "حدث خطأ أثناء حفظ المرفق");
    }
  };
  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachedDocuments: (prev.attachedDocuments || []).filter((_, i) => i !== index),
    }));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleUpdateCustomerName = async () => {
    if (!customer || !formData.customerName.trim()) {
      showWarning('اسم العميل مطلوب', 'يرجى إدخال اسم العميل أولاً');
      return;
    }
    try {
      const response = await fetch('/api/admin/users/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: customer.id,
          newName: formData.customerName.trim(),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.user);
        showSuccess('تم تحديث اسم العميل بنجاح! ✅', 'تم حفظ اسم العميل في النظام');
      } else {
        const error = await response.json();
        showError('فشل في تحديث اسم العميل', error.error || 'حدث خطأ أثناء تحديث اسم العميل');
      }
    } catch (error) {
      // Handle customer name update error
      // showError(
      // "خطأ في الاتصال",
      // "حدث خطأ أثناء تحديث اسم العميل. يرجى المحاولة مرة أخرى"
      // );
    }
  };
  // Get current work date
  const getCurrentWorkDate = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    // Validate phone number format
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(formData.customerPhone)) {
      showWarning('رقم الهاتف غير صحيح', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }
    // Validate email if provided
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
            return {
              id: fineId,
              name: fine?.name || '',
              amount: fine?.amountCents || 0,
            };
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
        workDate: getCurrentWorkDate(), // تمرير تاريخ العمل إلى API
      } as any;

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (response.ok) {
        const data = await response.json();
        const orderId = data.order.id;

        showSuccess('تم إنشاء الطلب بنجاح! 🎉', `تم إنشاء الطلب #${orderId} بنجاح`);

        // Show print confirmation with a delay to let the success toast show first
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
    } catch (error) {
      // Handle order creation error
      // showError(
      //   "خطأ في الاتصال",
      //   "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى"
      // );
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
            <div className='flex items-center justify-between'>
              <div className='text-white'>
                <h1 className='text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                  إنشاء طلب جديد
                </h1>
                <p className='text-blue-100 text-xl mb-4'>جاري تحميل البيانات...</p>
              </div>
            </div>
          </div>
        </div>
        {/* Loading */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-center min-h-96'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <p className='text-xl text-gray-600'>جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <div className='flex items-center justify-between'>
            <div className='text-white'>
              <h1 className='text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                إنشاء طلب جديد
              </h1>
              <p className='text-blue-100 text-xl mb-4'>
                إنشاء طلب جديد للعميل مع جميع التفاصيل المطلوبة
              </p>
              <div className='flex items-center space-x-4 space-x-reverse'>
                <div className='w-24 h-1 bg-gradient-to-r from-white to-blue-200 rounded-full'></div>
                <div className='w-16 h-1 bg-gradient-to-r from-blue-200 to-transparent rounded-full'></div>
              </div>
            </div>
            <Link
              href='/admin/orders'
              className='group px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border border-white/20'
            >
              <div className='flex items-center space-x-2 space-x-reverse'>
                <svg
                  className='w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                <span>العودة للطلبات</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      {/* Quick Navigation - Responsive */}
      {/* Desktop: Right sidebar */}
      <div className='fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2'>
        {[
          { id: 'customer-info', icon: '👤', label: 'العميل' },
          { id: 'service-selection', icon: '🔧', label: 'الخدمة' },
          { id: 'documents-section', icon: '📄', label: 'المستندات' },
          { id: 'payment-section', icon: '💳', label: 'الدفع' },
          { id: 'actions-section', icon: '✅', label: 'إجراءات' },
        ].map(item => (
          <button
            key={item.id}
            type='button'
            onClick={() => {
              const element = document.getElementById(item.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className='flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-200'
          >
            <span className='text-lg'>{item.icon}</span>
            <span className='text-xs font-semibold text-gray-700 whitespace-nowrap'>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {/* Mobile/Tablet: Bottom horizontal bar */}
      <div className='fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-2 py-2 safe-area-inset-bottom'>
        <div className='flex justify-around items-center gap-1 max-w-lg mx-auto'>
          {[
            { id: 'customer-info', icon: '👤', label: 'العميل' },
            { id: 'service-selection', icon: '🔧', label: 'الخدمة' },
            { id: 'documents-section', icon: '📄', label: 'مستندات' },
            { id: 'payment-section', icon: '💳', label: 'الدفع' },
            { id: 'actions-section', icon: '✅', label: 'إجراء' },
          ].map(item => (
            <button
              key={item.id}
              type='button'
              onClick={() => {
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className='flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-all duration-150'
            >
              <span className='text-xl'>{item.icon}</span>
              <span className='text-[10px] font-semibold text-gray-600'>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Form */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Section 1: Customer Information */}
          <div
            id='customer-info'
            className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 scroll-mt-24'
          >
            <div className='flex items-center mb-6'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-1'>👤 بيانات العميل</h2>
                <p className='text-gray-600'>معلومات العميل الأساسية</p>
              </div>
            </div>
            {/* Customer Search */}
            <div className='mb-6'>
              <div className='flex items-center mb-4'>
                <div className='w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2'>
                  <svg
                    className='w-4 h-4 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>البحث عن العميل</h3>
              </div>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Name Search */}
                <div>
                  <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                    <svg
                      className='w-4 h-4 text-sky-500 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                    اسم العميل <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative fines-dropdown-container'>
                    <input
                      type='text'
                      value={formData.customerName}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, customerName: value }));
                        // Immediate search for very fast response
                        searchCustomer(value);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && suggestedUser) {
                          e.preventDefault();
                          selectCustomer(suggestedUser);
                        }
                      }}
                      onFocus={() => {
                        if (searchResults.length > 1) {
                          setShowSearchDropdown(true);
                        }
                      }}
                      onBlur={() => {
                        // Very fast hiding dropdown to allow clicking on items
                        setTimeout(() => setShowSearchDropdown(false), 100);
                      }}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                      placeholder='أدخل اسم العميل'
                      required
                    />
                    {searching && (
                      <div className='absolute right-3 top-2.5 text-blue-600'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                      </div>
                    )}
                    {!searching && customer && (
                      <div className='absolute right-3 top-2.5 text-green-600'>✓</div>
                    )}
                    {!searching && !customer && formData.customerName.length >= 3 && (
                      <div className='absolute right-3 top-2.5 text-red-600'>✗</div>
                    )}
                    {/* Ghost preview suggestion */}
                    {!searching &&
                      suggestedUser &&
                      formData.customerName.length >= 1 &&
                      !showSearchDropdown && (
                        <div className='pointer-events-none absolute inset-0 flex items-center'>
                          <span className='px-4 py-3 text-gray-400 select-none'>
                            {formData.customerName}
                            <span className='text-gray-300'>
                              {suggestedUser.name?.slice(formData.customerName.length) || ''}
                            </span>
                          </span>
                        </div>
                      )}
                    {/* Search Results Dropdown */}
                    {showSearchDropdown && searchResults.length > 1 && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-20 overflow-y-auto'>
                        <div className='p-2'>
                          <div className='text-xs text-gray-500 mb-2 px-2'>اختر من النتائج:</div>
                          {searchResults.slice(0, 1).map((result, index) => (
                            <div
                              key={result.id}
                              onClick={() => selectCustomer(result)}
                              className='flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0'
                            >
                              <div className='flex-1'>
                                <div className='font-semibold text-gray-900'>{result.name}</div>
                                <div className='text-sm text-gray-600'>
                                  {result.phone && `📞 ${result.phone}`}
                                  {result.email && ` • ✉️ ${result.email}`}
                                  {result.address && ` • 📍 ${result.address}`}
                                </div>
                                {(result as any).fatherName && (
                                  <div className='text-xs text-gray-500 mt-1'>
                                    والد: {(result as any).fatherName}
                                  </div>
                                )}
                              </div>
                              <div className='text-blue-600 text-sm'>
                                {index === 0 && 'الأول'}
                                {index === 1 && 'الثاني'}
                                {index === 2 && 'الثالث'}
                                {index > 2 && `#${index + 1}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Edit Name */}
                <div>
                  <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                    <svg
                      className='w-4 h-4 text-sky-500 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                      />
                    </svg>
                    تعديل الاسم
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={formData.customerName}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, customerName: e.target.value }))
                      }
                      className='flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                      placeholder='تعديل اسم العميل'
                    />
                    {customer && (
                      <button
                        type='button'
                        onClick={handleUpdateCustomerName}
                        className='px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium shadow-md transition-all duration-200 transform hover:scale-105'
                      >
                        تحديث
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {customer && (
                <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='text-sm text-green-700'>
                    <strong>تم العثور على العميل:</strong> {customer.name}
                    {customer.phone && <span> - {customer.phone}</span>}
                  </div>
                </div>
              )}
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* National ID */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2'
                    />
                  </svg>
                  الرقم القومي
                </label>
                <input
                  type='text'
                  value={formData.idNumber}
                  onChange={e => handleNationalIdChange(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                  placeholder='أدخل الرقم القومي (14 رقم)'
                  maxLength={14}
                />
              </div>
              {/* Customer Phone */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  رقم الهاتف <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  value={formData.customerPhone}
                  onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                  required
                />
              </div>
              {/* Birth Date */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  تاريخ الميلاد
                </label>
                <input
                  type='text'
                  value={formData.birthDate}
                  onChange={e => {
                    let value = e.target.value;
                    // Replace spaces with slashes
                    value = value.replace(/\s/g, '/');

                    // Auto-add slash after day (2 digits)
                    const parts = value.split('/');
                    if (parts.length === 1 && parts[0] && parts[0].length === 2) {
                      value = parts[0] + '/';
                    }

                    // Auto-add slash after month (2 digits)
                    if (parts.length === 2 && parts[1] && parts[1].length === 2) {
                      value = parts[0] + '/' + parts[1] + '/';
                    }

                    setFormData(prev => ({ ...prev, birthDate: value }));

                    // Calculate age if valid date
                    if (value && value.length === 10) {
                      const [day, month, year] = value.split('/');
                      if (day && month && year) {
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        if (!isNaN(date.getTime())) {
                          const age = Math.floor(
                            (new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                          );
                          setFormData(prev => ({ ...prev, age: age.toString() }));
                        }
                      }
                    }
                  }}
                  onKeyDown={e => {
                    // Replace space with slash
                    if (e.key === ' ') {
                      e.preventDefault();
                      const currentValue = formData.birthDate;

                      // Don't add slash if there's already a slash at the end
                      if (!currentValue.endsWith('/')) {
                        const newValue = currentValue + '/';
                        setFormData(prev => ({ ...prev, birthDate: newValue }));
                      }
                    }
                  }}
                  placeholder='dd/mm/yyyy'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Additional Phone */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h8v-14H8v14z'
                    />
                  </svg>
                  رقم هاتف إضافي
                </label>
                <input
                  type='tel'
                  value={formData.additionalPhone}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, additionalPhone: e.target.value }))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                  placeholder='أدخل رقم هاتف إضافي (اختياري)'
                />
              </div>
              {/* Age */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  العمر
                </label>
                <input
                  type='number'
                  value={formData.age}
                  onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Gender */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  نوع العميل
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                >
                  <option value=''>اختر نوع العميل</option>
                  <option value='MALE'>ذكر</option>
                  <option value='FEMALE'>أنثى</option>
                </select>
              </div>
              {/* Customer Email */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                  البريد الإلكتروني
                </label>
                <input
                  type='email'
                  value={formData.customerEmail}
                  onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Address - Single Field with Modal */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 relative z-0'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  عنوان العميل
                </label>
                <button
                  type='button'
                  onClick={() => {
                    setShowAddressModal(true);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowAddressModal(true);
                    }
                  }}
                  aria-haspopup='dialog'
                  aria-expanded={showAddressModal ? 'true' : 'false'}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 cursor-pointer group inline-flex items-center justify-between relative z-10'
                >
                  <span
                    className={[
                      formData.governorate ||
                      formData.city ||
                      formData.district ||
                      formData.street ||
                      formData.buildingNumber ||
                      formData.apartmentNumber ||
                      formData.landmark
                        ? 'text-gray-900'
                        : 'text-gray-500',
                    ].join(' ')}
                  >
                    {[
                      formData.governorate,
                      formData.city,
                      formData.district,
                      formData.street,
                      formData.buildingNumber ? `مبني رقم ${formData.buildingNumber}` : '',
                      formData.apartmentNumber ? `شقة رقم ${formData.apartmentNumber}` : '',
                      formData.landmark ? `بجوار ${formData.landmark}` : '',
                    ]
                      .filter(Boolean)
                      .join(' - ') || 'اضغط لإدخال العنوان التفصيلي'}
                  </span>
                  <svg
                    className='w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
              </div>
              {/* Customer Follow-up */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  تابع العميل
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={formData.customerFollowUp}
                    onChange={e => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, customerFollowUp: value }));
                      // Immediate search for very fast response
                      searchDependent(value);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && suggestedDependent) {
                        selectDependent(suggestedDependent);
                      } else if (e.key === 'Enter' && formData.customerFollowUp.trim()) {
                        // Save new dependent if Enter is pressed and no suggestion
                        saveNewDependent(formData.customerFollowUp);
                      }
                    }}
                    onFocus={() => {
                      if (formData.customerFollowUp.length >= 1) {
                        searchDependent(formData.customerFollowUp);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding dropdown to allow clicking on results
                      setTimeout(() => {
                        setShowDependentDropdown(false);
                      }, 200);
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل تابع العميل'
                  />
                  {/* Loading indicator */}
                  {searchingDependent && (
                    <div className='absolute right-3 top-2.5'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                    </div>
                  )}
                  {/* Status indicators */}
                  {!searchingDependent && suggestedDependent && (
                    <div className='absolute right-3 top-2.5 text-green-600'>✓</div>
                  )}
                  {!searchingDependent &&
                    !suggestedDependent &&
                    formData.customerFollowUp.length >= 2 && (
                      <div className='absolute right-3 top-2.5 text-red-600'>✗</div>
                    )}
                  {/* Ghost preview suggestion */}
                  {!searchingDependent &&
                    suggestedDependent &&
                    formData.customerFollowUp.length >= 1 &&
                    !showDependentDropdown && (
                      <div className='pointer-events-none absolute inset-0 flex items-center'>
                        <span className='px-4 py-3 text-gray-400 select-none'>
                          {formData.customerFollowUp}
                          <span className='text-gray-300'>
                            {suggestedDependent.name?.slice(formData.customerFollowUp.length) || ''}
                          </span>
                        </span>
                      </div>
                    )}
                  {/* Search Results Dropdown */}
                  {showDependentDropdown && dependentSearchResults.length > 1 && (
                    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-32 overflow-y-auto'>
                      <div className='p-2'>
                        <div className='text-xs text-gray-500 mb-2 px-2'>
                          اختر من النتائج ({dependentSearchResults.length} نتيجة):
                        </div>
                        {dependentSearchResults.map(dependent => (
                          <button
                            key={dependent.id}
                            onClick={() => selectDependent(dependent)}
                            className='w-full text-right px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 text-gray-900'
                          >
                            {dependent.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Save new dependent button */}
                  {!searchingDependent &&
                    !suggestedDependent &&
                    formData.customerFollowUp.length >= 2 && (
                      <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50'>
                        <div className='p-2'>
                          <button
                            onClick={() => saveNewDependent(formData.customerFollowUp)}
                            className='w-full text-right px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors duration-150 text-blue-600 font-medium'
                          >
                            + إضافة &quot;{formData.customerFollowUp}&quot; كتابع جديد
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              {/* Profession */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6'
                    />
                  </svg>
                  المهنة
                </label>
                <input
                  type='text'
                  value={formData.profession}
                  onChange={e => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                  placeholder='أدخل المهنة'
                />
              </div>
              {/* Divider between rows */}
              <div className='md:col-span-2'>
                <div className='border-t border-blue-200 my-6'></div>
              </div>
              {/* Mother Name */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  والدة العميل
                </label>
                <input
                  type='text'
                  value={formData.motherName}
                  onChange={e => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Wife Name */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  اسم الزوج
                </label>
                <input
                  type='text'
                  value={formData.wifeName}
                  onChange={e => setFormData(prev => ({ ...prev, wifeName: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Wife Mother Name */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  والدة الزوج
                </label>
                <input
                  type='text'
                  value={formData.wifeMotherName}
                  onChange={e => setFormData(prev => ({ ...prev, wifeMotherName: e.target.value }))}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Marriage Date */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  تاريخ الزواج
                </label>
                <input
                  type='text'
                  value={formData.marriageDate}
                  onChange={e => {
                    let value = e.target.value;
                    // Replace spaces with slashes
                    value = value.replace(/\s/g, '/');

                    // Auto-add slash after day (2 digits)
                    const parts = value.split('/');
                    if (parts.length === 1 && parts[0] && parts[0].length === 2) {
                      value = parts[0] + '/';
                    }

                    // Auto-add slash after month (2 digits)
                    if (parts.length === 2 && parts[1] && parts[1].length === 2) {
                      value = parts[0] + '/' + parts[1] + '/';
                    }

                    setFormData(prev => ({ ...prev, marriageDate: value }));
                  }}
                  onKeyDown={e => {
                    // Replace space with slash
                    if (e.key === ' ') {
                      e.preventDefault();
                      const currentValue = formData.marriageDate;

                      // Don't add slash if there's already a slash at the end
                      if (!currentValue.endsWith('/')) {
                        const newValue = currentValue + '/';
                        setFormData(prev => ({ ...prev, marriageDate: newValue }));
                      }
                    }
                  }}
                  placeholder='dd/mm/yyyy'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Divorce Date */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  تاريخ الطلاق
                </label>
                <input
                  type='text'
                  value={formData.divorceDate}
                  onChange={e => {
                    let value = e.target.value;
                    // Replace spaces with slashes
                    value = value.replace(/\s/g, '/');

                    // Auto-add slash after day (2 digits)
                    const parts = value.split('/');
                    if (parts.length === 1 && parts[0] && parts[0].length === 2) {
                      value = parts[0] + '/';
                    }

                    // Auto-add slash after month (2 digits)
                    if (parts.length === 2 && parts[1] && parts[1].length === 2) {
                      value = parts[0] + '/' + parts[1] + '/';
                    }

                    setFormData(prev => ({ ...prev, divorceDate: value }));
                  }}
                  onKeyDown={e => {
                    // Replace space with slash
                    if (e.key === ' ') {
                      e.preventDefault();
                      const currentValue = formData.divorceDate;

                      // Don't add slash if there's already a slash at the end
                      if (!currentValue.endsWith('/')) {
                        const newValue = currentValue + '/';
                        setFormData(prev => ({ ...prev, divorceDate: newValue }));
                      }
                    }
                  }}
                  placeholder='dd/mm/yyyy'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
              {/* Death Date */}
              <div>
                <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                  <svg
                    className='w-4 h-4 text-sky-500 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  تاريخ الوفاة
                </label>
                <input
                  type='text'
                  value={formData.deathDate}
                  onChange={e => {
                    let value = e.target.value;
                    // Replace spaces with slashes
                    value = value.replace(/\s/g, '/');

                    // Auto-add slash after day (2 digits)
                    const parts = value.split('/');
                    if (parts.length === 1 && parts[0] && parts[0].length === 2) {
                      value = parts[0] + '/';
                    }

                    // Auto-add slash after month (2 digits)
                    if (parts.length === 2 && parts[1] && parts[1].length === 2) {
                      value = parts[0] + '/' + parts[1] + '/';
                    }

                    setFormData(prev => ({ ...prev, deathDate: value }));
                  }}
                  onKeyDown={e => {
                    // Replace space with slash
                    if (e.key === ' ') {
                      e.preventDefault();
                      const currentValue = formData.deathDate;

                      // Don't add slash if there's already a slash at the end
                      if (!currentValue.endsWith('/')) {
                        const newValue = currentValue + '/';
                        setFormData(prev => ({ ...prev, deathDate: newValue }));
                      }
                    }
                  }}
                  placeholder='dd/mm/yyyy'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                />
              </div>
            </div>
            {/* Divider Line */}
            <div className='my-12'>
              <div className='border-t-4 border-gray-300 rounded-full'></div>
            </div>
            {/* Service Selection and Documents - Side by Side */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Service Selection Card */}
              <div
                id='service-selection'
                className='bg-white rounded-2xl shadow-xl border border-gray-100 p-10 hover:shadow-2xl transition-all duration-300 scroll-mt-24'
              >
                <div className='flex items-center mb-6'>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-1'>🔧 اختيار الخدمة</h3>
                    <p className='text-gray-600'>اختيار نوع الخدمة والتفاصيل المطلوبة</p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Service */}
                  <div className='relative service-dropdown-container'>
                    <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                      <svg
                        className='w-4 h-4 text-sky-500 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                        />
                      </svg>
                      الخدمة <span className='text-red-500'>*</span>
                    </label>
                    <div className='relative service-dropdown-container'>
                      <input
                        type='text'
                        value={serviceSearchTerm}
                        onChange={e => {
                          const value = e.target.value;
                          setServiceSearchTerm(value);
                          setShowServiceDropdown(true);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && filteredServices.length > 0) {
                            e.preventDefault();
                            const firstService = filteredServices[0];
                            if (firstService) {
                              setSelectedService(firstService);
                              setServiceSearchTerm(firstService.name);
                              setShowServiceDropdown(false);
                            }
                          }
                        }}
                        onFocus={() => {
                          if (filteredServices.length > 0) {
                            setShowServiceDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Very fast hiding dropdown to allow clicking on items
                          setTimeout(() => setShowServiceDropdown(false), 100);
                        }}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                        placeholder='ابحث عن الخدمة... (مثال: بطاقة)'
                        required
                      />
                      {!selectedService && serviceSearchTerm.length >= 2 && (
                        <div className='absolute right-3 top-2.5 text-blue-600'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                        </div>
                      )}
                      {selectedService && (
                        <div className='absolute right-3 top-2.5 text-green-600'>✓</div>
                      )}
                      {!selectedService &&
                        serviceSearchTerm.length >= 2 &&
                        filteredServices.length === 0 && (
                          <div className='absolute right-3 top-2.5 text-red-600'>✗</div>
                        )}
                      {/* Ghost preview suggestion */}
                      {!selectedService &&
                        filteredServices.length > 0 &&
                        serviceSearchTerm.length >= 1 &&
                        !showServiceDropdown && (
                          <div className='pointer-events-none absolute inset-0 flex items-center'>
                            <span className='px-4 py-3 text-gray-400 select-none'>
                              {serviceSearchTerm}
                              <span className='text-gray-300'>
                                {filteredServices[0]?.name.substring(serviceSearchTerm.length) ||
                                  ''}
                              </span>
                            </span>
                          </div>
                        )}
                      {/* Clear Button */}
                      {serviceSearchTerm && (
                        <button
                          type='button'
                          onClick={() => {
                            setServiceSearchTerm('');
                            setSelectedService(null);
                            setShowServiceDropdown(false);
                          }}
                          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {/* Service Dropdown */}
                    {showServiceDropdown && (
                      <div
                        className='absolute z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-20 overflow-y-auto backdrop-blur-sm'
                        style={{ zIndex: 99999 }}
                      >
                        {filteredServices.length > 0 ? (
                          filteredServices.map(service => (
                            <div
                              key={service.id}
                              onClick={() => selectService(service)}
                              className='px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200'
                            >
                              <div className='text-sm font-normal text-gray-900'>
                                {service.name}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='px-3 py-2 text-gray-500 text-sm text-center'>
                            لا توجد خدمات تطابق البحث
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Variant */}
                  <div>
                    <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                      <svg
                        className='w-4 h-4 text-sky-500 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                        />
                      </svg>
                      نوع الخدمة <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={selectedVariant?.id || ''}
                      onChange={e => handleVariantChange(e.target.value)}
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                      required
                      disabled={!selectedService}
                    >
                      <option value=''>اختر نوع الخدمة</option>
                      {selectedService?.variants.map(variant => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name} - {(variant.priceCents / 100).toFixed(2)} جنيه
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Service Details Section */}
                <div className='mt-4 pt-4 border-t border-gray-300'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Quantity */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
                          />
                        </svg>
                        العدد
                      </label>
                      <input
                        type='number'
                        min='1'
                        value={formData.quantity}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            quantity: parseInt(e.target.value) || 1,
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                        placeholder='أدخل عدد الخدمات المطلوبة'
                      />
                    </div>
                    {/* Form Serial Number */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        رقم الاستمارة
                      </label>
                      <input
                        type='text'
                        value={formSerialNumber}
                        onChange={e => {
                          if (selectedService?.name?.includes('بطاقة')) {
                            validateSerialLive(e.target.value.trim());
                          }
                        }}
                        placeholder={
                          selectedService?.name?.includes('بطاقة')
                            ? 'اكتب رقم الاستمارة إن وجد'
                            : 'متاح لبطاقة رقم قومي فقط'
                        }
                        disabled={!selectedService?.name?.includes('بطاقة')}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400 font-bold ${
                          !selectedService?.name?.includes('بطاقة')
                            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                            : 'bg-white'
                        }`}
                      />
                      {serialValid && selectedService?.name?.includes('بطاقة') && (
                        <div
                          className={`mt-1 text-sm ${serialValid.ok ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {serialValid.msg}
                        </div>
                      )}
                    </div>
                    {/* Photography Location */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                        موقع التصوير
                      </label>
                      <select
                        value={formData.photographyLocation}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, photographyLocation: e.target.value }))
                        }
                        disabled={!selectedService?.name?.includes('بطاقة')}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400 ${
                          !selectedService?.name?.includes('بطاقة')
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'bg-white'
                        }`}
                      >
                        <option value=''>اختر موقع التصوير</option>
                        <option value='dandy_mall'>داندي مول + 200 جنيه</option>
                        <option value='civil_registry_haram'>سجل مدني الهرم + 50 جنيه</option>
                        <option value='home_photography'>تصوير منزلي + 200 جنيه</option>
                      </select>
                    </div>
                    {/* Photography Date */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </svg>
                        تاريخ التصوير
                      </label>
                      <input
                        type='text'
                        value={formData.photographyDate}
                        onChange={e => {
                          let value = e.target.value;
                          // Replace spaces with slashes
                          value = value.replace(/\s/g, '/');

                          // Auto-add slash after day (2 digits)
                          const parts = value.split('/');
                          if (parts.length === 1 && parts[0] && parts[0].length === 2) {
                            value = parts[0] + '/';
                          }

                          // Auto-add slash after month (2 digits)
                          if (parts.length === 2 && parts[1] && parts[1].length === 2) {
                            value = parts[0] + '/' + parts[1] + '/';
                          }

                          setFormData(prev => ({ ...prev, photographyDate: value }));
                        }}
                        onKeyDown={e => {
                          // Replace space with slash
                          if (e.key === ' ') {
                            e.preventDefault();
                            const currentValue = formData.photographyDate;

                            // Don't add slash if there's already a slash at the end
                            if (!currentValue.endsWith('/')) {
                              const newValue = currentValue + '/';
                              setFormData(prev => ({ ...prev, photographyDate: newValue }));
                            }
                          }
                        }}
                        placeholder='dd/mm/yyyy'
                        disabled={!selectedService?.name?.includes('بطاقة')}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400 ${
                          !selectedService?.name?.includes('بطاقة')
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                    {/* Police Station */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                          />
                        </svg>
                        قسم الشرطة
                      </label>
                      <select
                        value={formData.policeStation}
                        onChange={e => {
                          if (
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          ) {
                            setFormData(prev => ({ ...prev, policeStation: e.target.value }));
                          }
                        }}
                        disabled={
                          !(
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          )
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400 font-bold ${
                          !(
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          )
                            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                            : 'bg-white'
                        }`}
                      >
                        <option value=''>اختر قسم الشرطة</option>
                        <option value='FIRST_POLICE_STATION'>قسم أول</option>
                        <option value='SECOND_POLICE_STATION'>قسم ثاني</option>
                        <option value='THIRD_POLICE_STATION'>قسم ثالث</option>
                      </select>
                    </div>
                    {/* Pickup Location */}
                    <div>
                      <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                        <svg
                          className='w-4 h-4 text-sky-500 mr-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                        مكان الاستلام
                      </label>
                      <input
                        type='text'
                        value={formData.pickupLocation}
                        onChange={e => {
                          if (
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          ) {
                            setFormData(prev => ({ ...prev, pickupLocation: e.target.value }));
                          }
                        }}
                        disabled={
                          !(
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          )
                        }
                        placeholder={
                          selectedService?.slug === 'passports' ||
                          (selectedService?.name || '').includes('جواز')
                            ? 'أدخل مكان الاستلام...'
                            : 'متاح لخدمات جواز السفر فقط'
                        }
                        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-400 font-bold ${
                          !(
                            selectedService?.slug === 'passports' ||
                            (selectedService?.name || '').includes('جواز')
                          )
                            ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                            : 'bg-white'
                        }`}
                      />
                    </div>
                  </div>
                  {/* Service Details */}
                  <div className='mt-6'>
                    <label className='flex items-center text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                      <svg
                        className='w-4 h-4 text-sky-500 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                      تفاصيل الخدمة
                    </label>
                    <textarea
                      value={formData.serviceDetails}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))
                      }
                      rows={4}
                      className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                      placeholder='أدخل تفاصيل الخدمة المطلوبة...'
                    />
                  </div>
                </div>
              </div>

              {/* Documents Card */}
              <div
                id='documents-section'
                className='bg-white rounded-2xl shadow-xl border border-gray-100 p-10 hover:shadow-2xl transition-all duration-300 scroll-mt-24'
              >
                <div className='flex items-center mb-6'>
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                      📄 المستندات والمرفقات
                    </h3>
                    <p className='text-gray-600'>رفع المستندات المطلوبة للطلب</p>
                  </div>
                </div>

                {/* Original Documents */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    أصل المستندات المرفقة
                  </label>
                  <textarea
                    value={formData.originalDocuments}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, originalDocuments: e.target.value }))
                    }
                    rows={4}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                    placeholder='أدخل وصف المستندات الأصلية المرفقة...'
                  />
                </div>

                {/* Attachments Section */}
                <div className='mt-4'>
                  <label className='block text-lg font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
                    مرفقات
                  </label>
                  <div className='flex space-x-4 space-x-reverse'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        name='hasAttachments'
                        checked={!formData.hasAttachments}
                        onChange={() => setFormData(prev => ({ ...prev, hasAttachments: false }))}
                        className='mr-2 w-4 h-4 text-blue-600'
                      />
                      <span className='text-gray-900 font-medium'>بدون</span>
                    </label>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='radio'
                        name='hasAttachments'
                        checked={formData.hasAttachments}
                        onChange={() => setFormData(prev => ({ ...prev, hasAttachments: true }))}
                        className='mr-2 w-4 h-4 text-blue-600'
                      />
                      <span className='text-gray-900 font-medium'>مرفقات</span>
                    </label>
                  </div>
                </div>

                {formData.hasAttachments && (
                  <div className='mt-6 space-y-4'>
                    <div className='flex space-x-4 space-x-reverse'>
                      <button
                        type='button'
                        onClick={() => setShowAttachmentModal(true)}
                        className='px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium shadow-md transition-all duration-200 transform hover:scale-105 flex items-center gap-2'
                      >
                        <span>+</span> إضافة مرفق
                      </button>
                    </div>

                    <div className='border rounded-lg p-4 bg-gray-50'>
                      <h4 className='font-medium text-gray-900 mb-2'>المستندات المرفقة</h4>
                      {formData.attachedDocuments.length === 0 ? (
                        <p className='text-gray-500 text-sm'>لا توجد مستندات مرفقة</p>
                      ) : (
                        <div className='space-y-2'>
                          {formData.attachedDocuments.map((doc, index) => {
                            const isUploadedFile = uploadedFiles.some(
                              (_: File, fileIndex: number) => fileIndex === index
                            );
                            return (
                              <div
                                key={index}
                                className='flex items-center justify-between p-2 bg-white rounded border'
                              >
                                <div className='flex items-center gap-2'>
                                  {isUploadedFile ? (
                                    <span className='text-blue-600'>📁</span>
                                  ) : (
                                    <span className='text-purple-600'>📄</span>
                                  )}
                                  <span className='text-sm text-gray-900'>{doc}</span>
                                  {!isUploadedFile && (
                                    <span className='text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded'>
                                      نص
                                    </span>
                                  )}
                                </div>
                                <button
                                  type='button'
                                  onClick={() => handleRemoveAttachment(index)}
                                  className='text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors'
                                >
                                  حذف
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Display - Full Width */}
            {selectedVariant && (
              <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-medium text-gray-900'>سعر الخدمة:</span>
                  <span className='text-2xl font-bold text-blue-600'>
                    {(calculateTotal() / 100).toFixed(2)} جنيه
                  </span>
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  المدة المتوقعة: {selectedVariant.etaDays} يوم
                </div>
                {formData.quantity > 1 && (
                  <div className='text-sm text-gray-500 mt-2'>
                    سعر الوحدة: {(selectedVariant.priceCents / 100).toFixed(2)} جنيه ×{' '}
                    {formData.quantity} ={' '}
                    {((selectedVariant.priceCents / 100) * formData.quantity).toFixed(2)} جنيه
                  </div>
                )}
                {formData.photographyLocation && (
                  <div className='text-sm text-gray-500 mt-2'>
                    {formData.photographyLocation === 'dandy_mall' &&
                      'موقع التصوير: داندي مول + 200 جنيه'}
                    {formData.photographyLocation === 'civil_registry_haram' &&
                      'موقع التصوير: سجل مدني الهرم + 50 جنيه'}
                    {formData.photographyLocation === 'home_photography' &&
                      'موقع التصوير: تصوير منزلي + 200 جنيه'}
                    <div className='text-green-600 font-medium mt-1'>
                      ✓ رسوم التصوير ستضاف تلقائياً للفاتورة
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider Line */}
          <div className='border-t-2 border-gray-300 my-4'></div>

          {/* Payment Options and Order Details */}
          <div
            id='payment-section'
            className='bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all duration-300 scroll-mt-24'
          >
            <div className='flex items-center mb-4'>
              <div>
                <h2 className='text-xl font-bold text-gray-900 mb-1'>💳 خيارات الدفع والطلب</h2>
                <p className='text-sm text-gray-600'>إعدادات الدفع وتفاصيل التسليم</p>
              </div>
            </div>
            {/* Fees and Discounts - Compact Design */}
            <div className='mt-4'>
              <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-base font-bold text-gray-800 flex items-center gap-2'>
                    <div className='w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-4 h-4 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                        />
                      </svg>
                    </div>
                    💰 الرسوم والخصومات
                  </h3>
                  <div className='text-sm text-gray-600 bg-white px-2 py-1 rounded-full border'>
                    إجمالي: {(calculateTotal() / 100).toFixed(2)} جنيه
                  </div>
                </div>
                {/* Dropdown Select Menu */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 ${showFinesDropdown || showServicesDropdown ? 'pb-64' : ''}`}
                >
                  {/* Fines Dropdown */}
                  <div className='relative dropdown-container fines-dropdown-container'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>الغرامات</label>
                    <button
                      type='button'
                      onClick={() => setShowFinesDropdown(!showFinesDropdown)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 text-right flex items-center justify-between'
                    >
                      <span>
                        {selectedFines.filter(id => {
                          const fine = PREDEFINED_FINES.find(f => f.id === id);
                          return fine?.category === 'غرامات';
                        }).length === 0
                          ? 'اختر الغرامات'
                          : `${
                              selectedFines.filter(id => {
                                const fine = PREDEFINED_FINES.find(f => f.id === id);
                                return fine?.category === 'غرامات';
                              }).length
                            } غرامة مختارة`}
                      </span>
                      <div className='flex items-center gap-2'>
                        {selectedFines.filter(id => {
                          const fine = PREDEFINED_FINES.find(f => f.id === id);
                          return fine?.category === 'غرامات';
                        }).length > 0 && (
                          <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                            {
                              selectedFines.filter(id => {
                                const fine = PREDEFINED_FINES.find(f => f.id === id);
                                return fine?.category === 'غرامات';
                              }).length
                            }
                          </span>
                        )}
                        <svg
                          className={`w-5 h-5 transition-transform ${showFinesDropdown ? 'rotate-180' : ''}`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </button>
                    {showFinesDropdown && (
                      <div
                        className='absolute z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto fines-dropdown-container'
                        style={{ zIndex: 99999 }}
                      >
                        <div className='p-3'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-semibold text-gray-800'>اختر الغرامات</h4>
                            <button
                              type='button'
                              onClick={() => {
                                const finesIds = PREDEFINED_FINES.filter(
                                  f => f.category === 'غرامات'
                                ).map(f => f.id);
                                setSelectedFines(prev => prev.filter(id => !finesIds.includes(id)));
                              }}
                              className='text-xs text-red-500 hover:text-red-700 font-medium'
                            >
                              إلغاء الكل
                            </button>
                          </div>
                          {/* Search Input */}
                          <div className='mb-3'>
                            <div className='relative'>
                              <input
                                type='text'
                                placeholder='ابحث في الغرامات...'
                                value={finesSearchTerm}
                                onChange={e => {
                                  setFinesSearchTerm(e.target.value);
                                }}
                                className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
                              />
                              <svg
                                className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                />
                              </svg>
                            </div>
                          </div>
                          <div className='space-y-2'>
                            {PREDEFINED_FINES.filter(
                              fine =>
                                fine.category === 'غرامات' &&
                                fine.name.toLowerCase().includes(finesSearchTerm.toLowerCase())
                            ).map(fine => {
                              const isSelected = selectedFines.includes(fine.id);
                              return (
                                <div
                                  key={fine.id}
                                  className='flex items-center space-x-3 cursor-pointer hover:bg-red-50 p-2 rounded-lg transition-all duration-200'
                                  onClick={() => {
                                    handleFineToggle(fine.id);
                                  }}
                                >
                                  {/* Custom Checkbox */}
                                  <div
                                    className='w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center transition-all duration-200'
                                    style={{
                                      backgroundColor: isSelected ? '#dc2626' : 'white',
                                      borderColor: isSelected ? '#dc2626' : '#d1d5db',
                                    }}
                                  >
                                    {isSelected && (
                                      <svg
                                        className='w-3 h-3 text-white'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'
                                      >
                                        <path
                                          fillRule='evenodd'
                                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                          clipRule='evenodd'
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className='flex-1'>
                                    <span className='text-sm font-medium text-gray-900'>
                                      {fine.name}
                                    </span>
                                    <div className='flex items-center gap-2 mt-1'>
                                      <span className='text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full'>
                                        {(fine.amountCents / 100).toFixed(2)} جنيه
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {PREDEFINED_FINES.filter(
                              fine =>
                                fine.category === 'غرامات' &&
                                fine.name.toLowerCase().includes(finesSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className='text-center py-4 text-gray-500'>
                                <p className='text-sm'>
                                  {finesSearchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد غرامات متاحة'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Services Dropdown */}
                  <div className='relative dropdown-container services-dropdown-container'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>الخدمات</label>
                    <button
                      type='button'
                      onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 text-right flex items-center justify-between'
                    >
                      <span>
                        {selectedFines.filter(id => {
                          const fine = PREDEFINED_FINES.find(f => f.id === id);
                          return fine?.category === 'خدمات اضافية';
                        }).length === 0
                          ? 'اختر الخدمات'
                          : `${
                              selectedFines.filter(id => {
                                const fine = PREDEFINED_FINES.find(f => f.id === id);
                                return fine?.category === 'خدمات اضافية';
                              }).length
                            } خدمة مختارة`}
                      </span>
                      <div className='flex items-center gap-2'>
                        {selectedFines.filter(id => {
                          const fine = PREDEFINED_FINES.find(f => f.id === id);
                          return fine?.category === 'خدمات اضافية';
                        }).length > 0 && (
                          <span className='bg-green-500 text-white text-xs px-2 py-0.5 rounded-full'>
                            {
                              selectedFines.filter(id => {
                                const fine = PREDEFINED_FINES.find(f => f.id === id);
                                return fine?.category === 'خدمات اضافية';
                              }).length
                            }
                          </span>
                        )}
                        <svg
                          className={`w-5 h-5 transition-transform ${showServicesDropdown ? 'rotate-180' : ''}`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </button>
                    {showServicesDropdown && (
                      <div
                        className='absolute z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto services-dropdown-container'
                        style={{ zIndex: 99999 }}
                      >
                        <div className='p-3'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-semibold text-gray-800'>اختر الخدمات</h4>
                            <button
                              type='button'
                              onClick={() => {
                                const servicesIds = PREDEFINED_FINES.filter(
                                  f => f.category === 'خدمات اضافية'
                                ).map(f => f.id);
                                setSelectedFines(prev =>
                                  prev.filter(id => !servicesIds.includes(id))
                                );
                              }}
                              className='text-xs text-red-500 hover:text-red-700 font-medium'
                            >
                              إلغاء الكل
                            </button>
                          </div>
                          {/* Search Input */}
                          <div className='mb-3'>
                            <div className='relative'>
                              <input
                                type='text'
                                placeholder='ابحث في الخدمات...'
                                value={servicesSearchTerm}
                                onChange={e => {
                                  setServicesSearchTerm(e.target.value);
                                }}
                                className='w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
                              />
                              <svg
                                className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                />
                              </svg>
                            </div>
                          </div>
                          <div className='space-y-3'>
                            {PREDEFINED_FINES.filter(
                              fine =>
                                fine.category === 'خدمات اضافية' &&
                                fine.name.toLowerCase().includes(servicesSearchTerm.toLowerCase())
                            ).map(service => {
                              const isSelected = selectedFines.includes(service.id);
                              const isAutomatic = service.id === 'service_001'; // مصاريف غرامة
                              const manualAmount = manualServices[service.id] || 0;
                              return (
                                <div
                                  key={service.id}
                                  className='border border-gray-200 rounded-lg p-3 hover:bg-green-50 transition-all duration-200'
                                >
                                  <div className='flex items-center space-x-3 mb-2'>
                                    {/* Custom Checkbox */}
                                    <div
                                      className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                                        isAutomatic
                                          ? 'cursor-not-allowed opacity-60'
                                          : 'cursor-pointer'
                                      }`}
                                      style={{
                                        backgroundColor: isSelected ? '#16a34a' : 'white',
                                        borderColor: isSelected ? '#16a34a' : '#d1d5db',
                                      }}
                                      onClick={() => {
                                        if (!isAutomatic) {
                                          handleFineToggle(service.id);
                                        }
                                      }}
                                    >
                                      {isSelected && (
                                        <svg
                                          className='w-3 h-3 text-white'
                                          fill='currentColor'
                                          viewBox='0 0 20 20'
                                        >
                                          <path
                                            fillRule='evenodd'
                                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                            clipRule='evenodd'
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <div className='flex-1'>
                                      <span className='text-sm font-medium text-gray-900'>
                                        {service.name}
                                      </span>
                                      {isAutomatic && (
                                        <div className='text-xs text-blue-600 mt-1'>
                                          تلقائية:{' '}
                                          {
                                            selectedFines.filter(id => {
                                              const fine = PREDEFINED_FINES.find(f => f.id === id);
                                              return (
                                                fine?.category === 'غرامات' && id !== 'fine_004'
                                              );
                                            }).length
                                          }{' '}
                                          غرامة ={' '}
                                          {(
                                            calculateActualFineAmounts(selectedFines) / 100
                                          ).toFixed(2)}{' '}
                                          جنيه
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {/* Manual Amount Input for non-automatic services */}
                                  {!isAutomatic && isSelected && (
                                    <div className='mt-2'>
                                      <label className='block text-xs text-gray-600 mb-1'>
                                        المبلغ (جنيه)
                                      </label>
                                      <input
                                        type='number'
                                        min='0'
                                        step='0.01'
                                        value={manualAmount}
                                        onChange={e => {
                                          const amount = parseFloat(e.target.value) || 0;
                                          handleManualServiceChange(service.id, amount);
                                        }}
                                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
                                        placeholder='أدخل المبلغ'
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {PREDEFINED_FINES.filter(
                              fine =>
                                fine.category === 'خدمات اضافية' &&
                                fine.name.toLowerCase().includes(servicesSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className='text-center py-4 text-gray-500'>
                                <p className='text-sm'>
                                  {servicesSearchTerm
                                    ? 'لا توجد نتائج للبحث'
                                    : 'لا توجد خدمات متاحة'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Other Fees Input */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      مصاريف أخرى
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={formData.otherFees}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            otherFees: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold'
                        placeholder='0.00'
                      />
                      <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold'>
                        جنيه
                      </div>
                    </div>
                    {(formData.otherFees > 0 || shouldAddMandatoryFee(selectedFines)) && (
                      <div className='mt-2 text-xs text-purple-600'>
                        إجمالي:{' '}
                        {(
                          calculateMandatoryFeeAmount(selectedFines) / 100 +
                          formData.otherFees
                        ).toFixed(2)}{' '}
                        جنيه
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Discount and Total Summary */}
              <div className='mt-6 bg-white rounded-xl p-6 border border-gray-200'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Discount */}
                  <div>
                    <label className='block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2'>
                      <svg
                        className='w-5 h-5 text-orange-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                        />
                      </svg>
                      خصم
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        min='0'
                        step='0.01'
                        value={formData.discount}
                        onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400 font-bold text-lg'
                        placeholder='0.00'
                      />
                      <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold'>
                        جنيه
                      </div>
                    </div>
                  </div>
                  {/* Total Value */}
                  <div>
                    <label className='block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2'>
                      <svg
                        className='w-5 h-5 text-green-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                        />
                      </svg>
                      الإجمالي النهائي
                    </label>
                    <div className='relative'>
                      <input
                        type='text'
                        value={(calculateTotal() / 100).toFixed(2)}
                        disabled
                        className='w-full px-4 py-3 border border-gray-300 rounded-xl bg-green-50 text-gray-900 font-bold text-lg text-center'
                      />
                      <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold'>
                        جنيه
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Selected Items Summary */}
              {(selectedFines.length > 0 || formData.otherFees > 0) && (
                <div className='mt-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200'>
                  <h4 className='text-base font-bold text-gray-800 mb-3 flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-blue-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                    ملخص الرسوم المختارة
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* الغرامات */}
                    {selectedFines.filter(id => {
                      const fine = PREDEFINED_FINES.find(f => f.id === id);
                      return fine?.category === 'غرامات';
                    }).length > 0 && (
                      <div className='bg-white rounded-lg p-4 border border-red-100'>
                        <h5 className='font-semibold text-red-700 mb-3 flex items-center gap-2'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                            />
                          </svg>
                          الغرامات
                        </h5>
                        <div className='space-y-2'>
                          {selectedFines
                            .filter(id => {
                              const fine = PREDEFINED_FINES.find(f => f.id === id);
                              return fine?.category === 'غرامات';
                            })
                            .map(fineId => {
                              const fine = PREDEFINED_FINES.find(f => f.id === fineId);
                              if (!fine) return null;
                              return (
                                <div key={fineId} className='flex justify-between text-sm'>
                                  <span className='text-gray-700'>{fine.name}</span>
                                  {fine.id === 'fine_004' ? (
                                    <span className='font-medium text-red-600'>
                                      {(fine.amountCents / 100).toFixed(2)} جنيه
                                    </span>
                                  ) : (
                                    <span className='text-gray-500 text-sm'>-</span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {/* الخدمات */}
                    {(selectedFines.filter(id => {
                      const fine = PREDEFINED_FINES.find(f => f.id === id);
                      return fine?.category === 'خدمات اضافية';
                    }).length > 0 ||
                      calculateLostReportForServices(selectedFines) > 0) && (
                      <div className='bg-white rounded-lg p-4 border border-green-100'>
                        <h5 className='font-semibold text-green-700 mb-3 flex items-center gap-2'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          الخدمات
                        </h5>
                        <div className='space-y-2'>
                          {/* Lost Report (محضر فقد) */}
                          {calculateLostReportForServices(selectedFines) > 0 && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-700'>محضر فقد (تلقائي)</span>
                              <span className='font-medium text-green-600'>
                                {(calculateLostReportForServices(selectedFines) / 100).toFixed(2)}{' '}
                                جنيه
                              </span>
                            </div>
                          )}
                          {/* مصاريف غرامة */}
                          {selectedFines.includes('service_001') && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-700'>مصاريف غرامة (تلقائي)</span>
                              <span className='font-medium text-green-600'>
                                {(calculateActualFineAmounts(selectedFines) / 100).toFixed(2)} جنيه
                              </span>
                            </div>
                          )}
                          {/* خدمات يدوية */}
                          {selectedFines
                            .filter(id => {
                              const fine = PREDEFINED_FINES.find(f => f.id === id);
                              return fine?.category === 'خدمات اضافية' && id !== 'service_001';
                            })
                            .map(serviceId => {
                              const service = PREDEFINED_FINES.find(f => f.id === serviceId);
                              const manualAmount = manualServices[serviceId] || 0;
                              return (
                                <div key={serviceId} className='flex justify-between text-sm'>
                                  <span className='text-gray-700'>{service?.name}</span>
                                  <span className='font-medium text-green-600'>
                                    {manualAmount.toFixed(2)} جنيه
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {/* مصاريف أخرى */}
                    {formData.otherFees > 0 && (
                      <div className='bg-white rounded-lg p-4 border border-purple-100'>
                        <h5 className='font-semibold text-purple-700 mb-3 flex items-center gap-2'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                            />
                          </svg>
                          مصاريف أخرى
                        </h5>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-700'>مبلغ إضافي</span>
                          <span className='font-medium text-purple-600'>
                            {formData.otherFees.toFixed(2)} جنيه
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Payment Section - Compact */}
            <div className='mt-4 pt-3 border-t border-gray-200'>
              <h3 className='text-base font-semibold text-gray-900 mb-3'>💳 طريقة الدفع</h3>

              {/* Payment Method Cards */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-4'>
                {[
                  { value: 'CASH', label: 'كاش', icon: '💵', color: 'green' },
                  { value: 'BANK_TRANSFER', label: 'تحويل بنكي', icon: '🏦', color: 'blue' },
                  { value: 'MOBILE_WALLET', label: 'محفظة إلكترونية', icon: '📱', color: 'purple' },
                  { value: 'CREDIT_CARD', label: 'بطاقة ائتمان', icon: '💳', color: 'indigo' },
                ].map(method => (
                  <div
                    key={method.value}
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                    className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                      formData.paymentMethod === method.value
                        ? `border-${method.color}-500 bg-${method.color}-50 ring-1 ring-${method.color}-500`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className='text-xl mb-1'>{method.icon}</div>
                    <div className='text-xs font-semibold text-gray-900'>{method.label}</div>
                  </div>
                ))}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Paid Amount */}
                <div>
                  <label className='block text-xs font-semibold text-gray-700 mb-1'>
                    المدفوع (جنيه)
                  </label>
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.paidAmount}
                    onChange={e => setFormData(prev => ({ ...prev, paidAmount: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white h-9 text-sm'
                    placeholder='0.00'
                  />
                </div>
                {/* Remaining Amount */}
                <div>
                  <label className='block text-sm font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-1'>
                    المتبقي (جنيه)
                  </label>
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    value={formData.remainingAmount || 0}
                    readOnly
                    className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 font-bold cursor-not-allowed h-9 text-sm'
                    placeholder='0.00'
                  />
                </div>
              </div>
            </div>

            {/* Order Details Section - Compact */}
            <div className='mt-4 pt-3 border-t border-gray-200'>
              <h3 className='text-base font-semibold text-gray-900 mb-3'>📦 تفاصيل الطلب</h3>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                {/* Delivery Type */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    نوع التوصيل
                  </label>
                  <select
                    value={formData.deliveryType}
                    onChange={e => setFormData(prev => ({ ...prev, deliveryType: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                  >
                    <option value='OFFICE'>استلام من المكتب</option>
                    <option value='ADDRESS'>توصيل على العنوان</option>
                  </select>
                </div>
                {/* Delivery Fee */}
                {formData.deliveryType === 'ADDRESS' && (
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      رسوم التوصيل (جنيه)
                    </label>
                    <input
                      type='number'
                      min='0'
                      step='0.01'
                      value={formData.deliveryFee}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          deliveryFee: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Payment Summary */}
            {selectedVariant && (
              <div className='mt-4 p-3 bg-gray-50 rounded-lg text-sm'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-900'>المجموع الكلي:</span>
                    <span className='font-medium'>{(calculateTotal() / 100).toFixed(2)} جنيه</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-900'>المبلغ المدفوع:</span>
                    <span className='font-medium text-green-600'>
                      {(parseFloat(formData.paidAmount) || 0).toFixed(2)} جنيه
                    </span>
                  </div>
                  <div className='border-t border-gray-300 pt-2'>
                    <div className='flex justify-between text-lg font-bold'>
                      <span className='text-gray-900'>المبلغ المتبقي:</span>
                      <span
                        className={`font-bold ${formData.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {formData.remainingAmount.toFixed(2)} جنيه
                      </span>
                    </div>
                  </div>
                  {formData.remainingAmount === 0 && (parseFloat(formData.paidAmount) || 0) > 0 && (
                    <div className='text-center text-green-600 font-medium mt-2'>
                      ✓ الطلب مدفوع بالكامل
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider Line */}
          {selectedVariant && <div className='border-t-2 border-gray-300 my-4'></div>}

          {/* Total Summary */}
          {selectedVariant && (
            <div className='bg-green-50 rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>ملخص الطلب النهائي</h2>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-900'>سعر الخدمة:</span>
                  <span className='font-medium'>
                    {(selectedVariant.priceCents / 100).toFixed(2)} جنيه
                  </span>
                </div>
                {formData.deliveryType === 'ADDRESS' && formData.deliveryFee > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-900'>رسوم التوصيل:</span>
                    <span className='font-medium'>+{formData.deliveryFee.toFixed(2)} جنيه</span>
                  </div>
                )}
                {formData.photographyLocation && (
                  <div className='flex justify-between'>
                    <span className='text-gray-900'>رسوم التصوير:</span>
                    <span className='font-medium text-blue-600'>
                      +
                      {formData.photographyLocation === 'dandy_mall'
                        ? '200'
                        : formData.photographyLocation === 'civil_registry_haram'
                          ? '50'
                          : formData.photographyLocation === 'home_photography'
                            ? '200'
                            : '0'}{' '}
                      جنيه
                    </span>
                  </div>
                )}
                {(parseFloat(formData.discount) || 0) > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-900'>الخصم:</span>
                    <span className='font-medium text-red-600'>
                      -{(parseFloat(formData.discount) || 0).toFixed(2)} جنيه
                    </span>
                  </div>
                )}
                <div className='border-t border-gray-300 pt-2'>
                  <div className='flex justify-between text-lg font-bold'>
                    <span className='text-gray-900'>المجموع الكلي:</span>
                    <span className='text-blue-600'>
                      {(calculateTotal() / 100).toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
                <div className='flex justify-between text-lg'>
                  <span className='text-gray-900'>المبلغ المدفوع:</span>
                  <span className='text-green-600 font-bold'>
                    {(parseFloat(formData.paidAmount) || 0).toFixed(2)} جنيه
                  </span>
                </div>
                <div className='border-t border-gray-300 pt-2'>
                  <div className='flex justify-between text-xl font-bold'>
                    <span className='text-gray-900'>المبلغ المتبقي:</span>
                    <span
                      className={`font-bold ${formData.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {formData.remainingAmount.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
                {formData.remainingAmount === 0 && (parseFloat(formData.paidAmount) || 0) > 0 && (
                  <div className='text-center text-green-600 font-bold text-lg mt-4 p-3 bg-green-100 rounded-lg'>
                    ✓ الطلب مدفوع بالكامل - جاهز للتنفيذ
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Divider Line */}
          <div className='border-t-2 border-gray-300 my-4'></div>

          {/* Action Buttons */}
          <div
            id='actions-section'
            className='bg-white rounded-xl shadow-lg border border-gray-100 p-8 scroll-mt-24'
          >
            <div className='flex items-center mb-6'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4'>
                <svg
                  className='w-6 h-6 text-purple-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>إجراءات الطلب</h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
              <button
                type='button'
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    underImplementationReason: 'تم وضع الطلب تحت التنفيذ',
                  }))
                }
                className='flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-medium shadow-lg transition-all duration-200 transform hover:scale-105'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                تحت التنفيذ UnderWork
              </button>
              <button
                type='button'
                onClick={() => {
                  // Handle collective receipt generation
                  if (customer?.id) {
                    const today = new Date().toISOString().split('T')[0];
                    const cleanCustomerId = encodeURIComponent(customer.id.trim());
                    const url = `/admin/collective-receipt?customerId=${cleanCustomerId}&date=${today}`;
                    window.open(url, '_blank');
                  } else {
                    alert('يرجى البحث عن العميل أولاً');
                  }
                }}
                className='flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 font-medium shadow-lg transition-all duration-200 transform hover:scale-105'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                  />
                </svg>
                إيصال مجمع عميل Print All
              </button>
              <Link
                href='/admin/orders'
                className='flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 font-medium shadow-lg transition-all duration-200 transform hover:scale-105'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                رجوع Close
              </Link>
            </div>
            {/* Print Image Checkbox */}
            <div className='flex justify-center'>
              <label className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200'>
                <input
                  type='checkbox'
                  className='mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <span className='text-sm font-medium text-gray-900'>طباعة صورة</span>
              </label>
            </div>
          </div>

          {/* Divider Line */}
          <div className='border-t-2 border-gray-300 my-4'></div>

          {/* Sticky Submit Button */}
          <div className='sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 -mb-4 mt-8'>
            <div className='flex justify-center'>
              <button
                type='submit'
                disabled={submitting}
                className='group px-16 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20'
              >
                {submitting ? (
                  <div className='flex items-center space-x-2 space-x-reverse'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                    <span>جاري إنشاء الطلب...</span>
                  </div>
                ) : (
                  <div className='flex items-center space-x-2 space-x-reverse'>
                    <span>🚀 إنشاء الطلب</span>
                    <svg
                      className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-200'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7l5 5m0 0l-5 5m5-5H6'
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4'
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowAddressModal(false);
            }
          }}
        >
          <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-2xl font-bold text-gray-900'>إدخال العنوان التفصيلي</h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            {/* Modal Content */}
            <div className='p-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Governorate */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>المحافظة</label>
                  <select
                    value={formData.governorate}
                    onChange={e => setFormData(prev => ({ ...prev, governorate: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                  >
                    <option value=''>اختر المحافظة</option>
                    <option value='القاهرة'>القاهرة</option>
                    <option value='الجيزة'>الجيزة</option>
                    <option value='الإسكندرية'>الإسكندرية</option>
                    <option value='الشرقية'>الشرقية</option>
                    <option value='الدقهلية'>الدقهلية</option>
                    <option value='البحيرة'>البحيرة</option>
                    <option value='الغربية'>الغربية</option>
                    <option value='المنيا'>المنيا</option>
                    <option value='أسيوط'>أسيوط</option>
                    <option value='سوهاج'>سوهاج</option>
                    <option value='قنا'>قنا</option>
                    <option value='الأقصر'>الأقصر</option>
                    <option value='أسوان'>أسوان</option>
                    <option value='البحر الأحمر'>البحر الأحمر</option>
                    <option value='شمال سيناء'>شمال سيناء</option>
                    <option value='جنوب سيناء'>جنوب سيناء</option>
                    <option value='الوادي الجديد'>الوادي الجديد</option>
                    <option value='مطروح'>مطروح</option>
                    <option value='كفر الشيخ'>كفر الشيخ</option>
                    <option value='الفيوم'>الفيوم</option>
                    <option value='بني سويف'>بني سويف</option>
                    <option value='المنوفية'>المنوفية</option>
                    <option value='القليوبية'>القليوبية</option>
                    <option value='دمياط'>دمياط</option>
                    <option value='بورسعيد'>بورسعيد</option>
                    <option value='الإسماعيلية'>الإسماعيلية</option>
                    <option value='السويس'>السويس</option>
                  </select>
                </div>
                {/* City */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>المدينة</label>
                  <input
                    type='text'
                    value={formData.city}
                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل المدينة'
                  />
                </div>
                {/* District */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    الحي/المنطقة
                  </label>
                  <input
                    type='text'
                    value={formData.district}
                    onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل الحي أو المنطقة'
                  />
                </div>
                {/* Street */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>الشارع</label>
                  <input
                    type='text'
                    value={formData.street}
                    onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل اسم الشارع'
                  />
                </div>
                {/* Building Number */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    رقم المبنى
                  </label>
                  <input
                    type='text'
                    value={formData.buildingNumber}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, buildingNumber: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل رقم المبنى'
                  />
                </div>
                {/* Apartment Number */}
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    رقم الشقة
                  </label>
                  <input
                    type='text'
                    value={formData.apartmentNumber}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, apartmentNumber: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل رقم الشقة'
                  />
                </div>
                {/* Landmark */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    المعلم المميز
                  </label>
                  <input
                    type='text'
                    value={formData.landmark}
                    onChange={e => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                    placeholder='أدخل معلم مميز (مثل: بجوار مسجد، أمام مدرسة)'
                  />
                </div>
                {/* Full Address Summary */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    العنوان الكامل
                  </label>
                  <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {[
                        formData.governorate,
                        formData.city,
                        formData.district,
                        formData.street,
                        formData.buildingNumber ? `مبني رقم ${formData.buildingNumber}` : '',
                        formData.apartmentNumber ? `شقة رقم ${formData.apartmentNumber}` : '',
                        formData.landmark ? `بجوار ${formData.landmark}` : '',
                      ]
                        .filter(Boolean)
                        .join(' - ') || 'لم يتم إدخال العنوان بعد'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Modal Actions */}
              <div className='flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200'>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors'
                >
                  إغلاق
                </button>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className='px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors'
                >
                  حفظ العنوان
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>إضافة مرفق</h3>

            <div className='space-y-4'>
              {/* اسم المرفق */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  اسم المرفق *
                </label>
                <input
                  type='text'
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white'
                  placeholder='مثال: شهادة ميلاد، صورة شخصية، إلخ'
                />
              </div>

              {/* رفع ملف (اختياري) */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  رفع ملف (اختياري)
                </label>
                <input
                  type='file'
                  onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                  accept='.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white'
                />
                {attachmentFile && (
                  <p className='text-sm text-green-600 mt-1'>تم اختيار: {attachmentFile.name}</p>
                )}
              </div>

              {/* أزرار */}
              <div className='flex space-x-3 space-x-reverse'>
                <button
                  type='button'
                  onClick={handleSaveAttachment}
                  className='flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors'
                >
                  حفظ
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowAttachmentModal(false);
                    setAttachmentName('');
                    setAttachmentFile(null);
                  }}
                  className='flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors'
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
