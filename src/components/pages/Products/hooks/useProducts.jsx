import { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import { productService } from '../services/productServices.js';
import { toast } from 'react-hot-toast';

export const useProducts = (modelFilter, factoryFilter, searchTerm) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.fetchProducts();
      setAllProducts(response.data);
    } catch (error) {
      toast.error('Error fetching products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Frontend filtering logic
  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (searchTerm) {
      products = products.filter(
        (product) =>
          product.serialNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.model?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.factory?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (modelFilter && modelFilter !== 'all') {
      products = products.filter(
        (product) => product.model?._id === modelFilter
      );
    }

    if (factoryFilter && factoryFilter !== 'all') {
      products = products.filter(
        (product) => product.factory?._id === factoryFilter
      );
    }

    return products;
  }, [allProducts, modelFilter, factoryFilter, searchTerm]);

  // Group filtered products by orderId and boxNumber
  const groupedProducts = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const key = `${product.orderId}-${product.boxNumber}`;
      if (!acc[key]) {
        acc[key] = {
          _id: key, // This _id is for the grouped row, not for selection
          orderId: product.orderId,
          boxNumber: product.boxNumber,
          productName: product.productName, // Assuming all products in a box have same name
          category: product.category,
          model: product.model,
          price: product.price, // Assuming all products in a box have same price
          factory: product.factory,
          status: product.status, // This might vary per product in box, need to decide how to display
          orderType: product.orderType,
          distributor: product.distributor, // Assuming all products in a box have same distributor
          productsInBox: [], // Array to hold individual product objects
        };
      }
      acc[key].productsInBox.push(product); // Push the entire product object
      return acc;
    }, {});
    console.log('Grouped Products:', grouped); // Add console log here
    return Object.values(grouped);
  }, [filteredProducts]); // Dependency on filteredProducts

  return {
    products: groupedProducts, // Return grouped products for display
    loading,
    fetchProducts,
  };
};
