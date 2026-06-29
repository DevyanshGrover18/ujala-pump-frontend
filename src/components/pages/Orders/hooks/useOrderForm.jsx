import { useState, useEffect } from 'react';
import { orderService } from '../services/orderServices';

const initialOrderState = {
  category: '',
  model: '',
  quantity: '',
  totalPumps: '',
  factory: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  status: 'Pending',
  orderType: '1_unit',
  isManual: false,
  manualSerials: '',
};

export const useOrderForm = (isEdit = false, editOrder = null, models = []) => {
  const [formData, setFormData] = useState(initialOrderState);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedModelDetails, setSelectedModelDetails] = useState(null);
  const [dbDuplicates, setDbDuplicates] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  useEffect(() => {
    if (!formData.isManual || !formData.manualSerials) {
      setDbDuplicates([]);
      return;
    }

    const serials = formData.manualSerials
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    if (serials.length === 0) {
      setDbDuplicates([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const { data } = await orderService.checkDuplicates(serials);
        setDbDuplicates(data.duplicates || []);
      } catch (err) {
        console.error('Error checking duplicates:', err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 600); // 600ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [formData.manualSerials, formData.isManual]);

  useEffect(() => {
    if (isEdit && editOrder) {
      const totalPumps =
        editOrder.quantity *
        (editOrder.orderType === '2_units'
          ? 2
          : editOrder.orderType === '3_units'
            ? 3
            : 1);

      setFormData({
        category: editOrder.category?._id || '',
        model: editOrder.model?._id || '',
        quantity: editOrder.quantity,
        totalPumps: totalPumps,
        factory: editOrder.factory?._id || '',
        month: editOrder.month || new Date().getMonth() + 1,
        year: editOrder.year || new Date().getFullYear(),
        status: editOrder.status || 'Pending',
        orderType: editOrder.orderType || '1_unit',
        isManual: editOrder.isManual || false,
        manualSerials: editOrder.serialNumbers ? editOrder.serialNumbers.join(', ') : '',
      });

      if (editOrder.model) {
        setSelectedModelDetails(editOrder.model);
      }

      if (editOrder.category?._id) {
        const categoryModels = models.filter(
          (m) => m.category?._id === editOrder.category._id
        );
        setFilteredModels(categoryModels);
      }
    } else {
      resetForm();
    }
  }, [isEdit, editOrder, models]);

  useEffect(() => {
    if (formData.category) {
      const categoryModels = models.filter(
        (m) => m.category?._id === formData.category
      );
      setFilteredModels(categoryModels);
      if (!isEdit) {
        setFormData((prev) => ({ ...prev, model: '' }));
        setSelectedModelDetails(null);
      }
    } else {
      setFilteredModels([]);
      if (!isEdit) {
        setSelectedModelDetails(null);
      }
    }
  }, [formData.category, models, isEdit]);

  useEffect(() => {
    if (formData.model) {
      const selectedModel = models.find((m) => m._id === formData.model);
      setSelectedModelDetails(selectedModel || null);
    } else {
      setSelectedModelDetails(null);
    }
  }, [formData.model, models]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateOrderType = (orderType) => {
    const totalPumps = formData.totalPumps || formData.quantity;
    const unitsPerBox =
      orderType === '2_units' ? 2 : orderType === '3_units' ? 3 : 1;

    setFormData((prev) => ({
      ...prev,
      orderType,
      totalPumps,
      quantity: Math.ceil(totalPumps / unitsPerBox),
    }));
  };

  const updateTotalPumps = (totalPumps) => {
    const unitsPerBox =
      formData.orderType === '2_units'
        ? 2
        : formData.orderType === '3_units'
          ? 3
          : 1;

    setFormData((prev) => ({
      ...prev,
      totalPumps: totalPumps || '',
      quantity: totalPumps ? Math.ceil(totalPumps / unitsPerBox) : '',
    }));
  };

  const resetForm = (isManualDefault = false) => {
    setFormData({
      ...initialOrderState,
      isManual: isManualDefault,
    });
    setFilteredModels([]);
    setSelectedModelDetails(null);
  };

  const validateForm = () => {
    const requiredFields = [
      'category',
      'model',
      'totalPumps',
      'factory',
      'orderType',
    ];
    
    if (formData.isManual) {
      requiredFields.push('manualSerials');
    }

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Please fill in all required fields: ${missingFields.join(', ')}`,
      };
    }

    if (formData.totalPumps <= 0) {
      return { valid: false, error: 'Number of pumps must be greater than 0' };
    }

    const unitsPerBox =
      formData.orderType === '2_units'
        ? 2
        : formData.orderType === '3_units'
          ? 3
          : 1;

    if (unitsPerBox > 1 && formData.totalPumps % unitsPerBox !== 0) {
      return {
        valid: false,
        error: `For ${unitsPerBox}N orders, the number of pumps must be divisible by ${unitsPerBox}`,
      };
    }

    if (formData.isManual) {
      const serials = formData.manualSerials
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);

      if (serials.length !== parseInt(formData.totalPumps)) {
        return {
          valid: false,
          error: `Number of pumps (${formData.totalPumps}) and entered serial numbers (${serials.length}) must be the same.`,
        };
      }

      const uniqueSerials = [...new Set(serials)];
      if (uniqueSerials.length !== serials.length) {
        const duplicates = serials.filter((item, index) => serials.indexOf(item) !== index);
        return {
          valid: false,
          error: `Duplicate serial numbers found in input: ${[...new Set(duplicates)].join(', ')}`,
        };
      }

      if (dbDuplicates.length > 0) {
        return {
          valid: false,
          error: `The following serial numbers already exist in the database: ${dbDuplicates.join(', ')}`,
        };
      }
    }

    return { valid: true };
  };

  const getSubmitData = () => {
    const unitsPerBox =
      formData.orderType === '2_units'
        ? 2
        : formData.orderType === '3_units'
          ? 3
          : 1;

    const data = {
      ...formData,
      totalPumps: parseInt(formData.totalPumps),
      quantity: Math.ceil(parseInt(formData.totalPumps) / unitsPerBox),
    };

    if (formData.isManual) {
      data.serialNumbers = formData.manualSerials
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }

    return data;
  };

  return {
    formData,
    filteredModels,
    selectedModelDetails,
    updateField,
    updateOrderType,
    updateTotalPumps,
    resetForm,
    validateForm,
    getSubmitData,
    dbDuplicates,
    isCheckingDuplicates,
  };
};
