import { useState, useEffect } from "react";

const useLocaLStorage = () => {
  const [values, setValues] = useState<string[]>([]);

  // Load values from localStorage on mount
  useEffect(() => {
    const storedValues = localStorage.getItem("search");
    if (storedValues) {
      setValues(JSON.parse(storedValues));
    }
  }, []);

  // Get item from local storage
  const getItem = () => {
    return JSON.parse(localStorage.getItem("search"));
  };

  // Set item in local storage
  const setItem = (value: string) => {
    if (!value) return;

    const currentValues = getItem() || [];
    const updatedValues = [...currentValues, value];

    setValues(updatedValues);
    localStorage.setItem("search", JSON.stringify(updatedValues));
  };

  // Remove item from local storage
  const removeItem = (valueToRemove: string) => {
    const updatedValues = values.filter((value) => value !== valueToRemove);
    setValues(updatedValues);
    localStorage.setItem("search", JSON.stringify(updatedValues));
  };

  // Clear all items from local storage
  const clearStorage = () => {
    setValues([]);
    localStorage.removeItem("search");
  };

  return { values, setItem, getItem, removeItem, clearStorage };
};

export default useLocaLStorage;
