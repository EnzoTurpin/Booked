import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionnez une option",
  className = "",
  required = false,
  id,
  name,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trouver l'option sélectionnée
  const selectedOption = options.find((option) => option.value === value);

  // Gérer l'ouverture/fermeture du dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Sélectionner une option
  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Gérer la fermeture du dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Gérer la navigation au clavier
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        toggleDropdown();
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus à la première option ou à l'option suivante
          event.preventDefault();
          const dropdown = dropdownRef.current;
          if (dropdown) {
            const options = dropdown.querySelectorAll(".custom-select-option");
            const selectedIndex = Array.from(options).findIndex(
              (option) => option.getAttribute("data-value") === value
            );
            const nextIndex =
              selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
            const nextOption = options[nextIndex];
            if (nextOption) {
              const nextValue = nextOption.getAttribute("data-value");
              if (nextValue) {
                onChange(nextValue);
              }
            }
          }
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          const dropdown = dropdownRef.current;
          if (dropdown) {
            const options = dropdown.querySelectorAll(".custom-select-option");
            const selectedIndex = Array.from(options).findIndex(
              (option) => option.getAttribute("data-value") === value
            );
            const prevIndex =
              selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
            const prevOption = options[prevIndex];
            if (prevOption) {
              const prevValue = prevOption.getAttribute("data-value");
              if (prevValue) {
                onChange(prevValue);
              }
            }
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={selectRef}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={`${id || name}-dropdown`}
    >
      {/* Bouton qui s'affiche comme un select */}
      <div
        className={`custom-select-header ${isOpen ? "open" : ""} ${
          isFocused ? "focused" : ""
        }`}
        onClick={toggleDropdown}
        aria-disabled={disabled}
      >
        <div className="custom-select-selected-value">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <div className="custom-select-arrow"></div>
      </div>

      {/* Dropdown avec les options */}
      <div
        className={`custom-select-dropdown ${isOpen ? "open" : ""}`}
        ref={dropdownRef}
        id={`${id || name}-dropdown`}
        role="listbox"
        aria-multiselectable="false"
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={`custom-select-option ${
              value === option.value ? "selected" : ""
            }`}
            onClick={() => handleOptionSelect(option.value)}
            data-value={option.value}
            role="option"
            aria-selected={value === option.value}
          >
            {option.label}
          </div>
        ))}
      </div>

      {/* Input caché pour compatibilité avec les formulaires */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        id={id}
      />
    </div>
  );
};

export default CustomSelect;
